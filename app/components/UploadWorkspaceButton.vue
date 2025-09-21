<template>
  <div>
    <v-btn
      :color="color"
      :variant="variant"
      :size="size"
      :block="block"
      @click="$refs.fileInput.click()"
    >
      <v-icon v-if="icon" start>mdi-upload</v-icon>
      {{ label }}
    </v-btn>

    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileUpload"
    />

    <v-dialog v-model="mergeDialog" max-width="500">
      <v-card>
        <v-card-title>Workspace Conflict</v-card-title>
        <v-card-text>
          You already have {{ existingCount }} workspace(s). How should we
          handle the import?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="mergeDialog = false">Cancel</v-btn>
          <v-btn color="warning" variant="text" @click="replaceWorkspaces"
            >Replace All</v-btn
          >
          <v-btn color="primary" variant="flat" @click="mergeWorkspaces"
            >Merge</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "Upload Equine Workspace",
  },
  variant: {
    type: String,
    default: "tonal",
  },
  color: {
    type: String,
    default: "green",
  },
  size: {
    type: String,
    default: "large",
  },
  icon: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["workspaces-loaded"]);

const mergeDialog = ref(false);
const existingCount = ref(0);
const pendingWorkspaces = ref(null);
const snackbar = ref(false);
const snackbarText = ref("");
const snackbarColor = ref("success");

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    let workspacesToImport = Array.isArray(data) ? data : data.workspaces;

    if (!workspacesToImport || !Array.isArray(workspacesToImport)) {
      throw new Error("Invalid workspace file format");
    }

    const existing = JSON.parse(
      localStorage.getItem("equine-workspaces") || "[]"
    );

    if (existing.length > 0) {
      existingCount.value = existing.length;
      pendingWorkspaces.value = workspacesToImport;
      mergeDialog.value = true;
    } else {
      importWorkspaces(workspacesToImport, false);
    }
  } catch (error) {
    console.error("Upload failed:", error);
    showSnackbar("Failed to read file. Is it valid JSON?", "error");
  }

  event.target.value = "";
};

const importWorkspaces = (workspaces, merge = false) => {
  try {
    if (merge) {
      const existing = JSON.parse(
        localStorage.getItem("equine-workspaces") || "[]"
      );
      workspaces.forEach((ws) => {
        if (existing.some((e) => e.id === ws.id)) {
          ws.id =
            Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }
      });
      const merged = [...existing, ...workspaces];
      localStorage.setItem("equine-workspaces", JSON.stringify(merged));
      showSnackbar(`Added ${workspaces.length} workspace(s)`, "success");
    } else {
      localStorage.setItem("equine-workspaces", JSON.stringify(workspaces));
      if (workspaces.length > 0 && !localStorage.getItem("current-workspace")) {
        localStorage.setItem("current-workspace", workspaces[0].id);
      }
      showSnackbar(`Imported ${workspaces.length} workspace(s)`, "success");
    }

    emit("workspaces-loaded");

    setTimeout(() => window.location.reload(), 1500);
  } catch (error) {
    console.error("Import failed:", error);
    showSnackbar("Failed to import workspaces", "error");
  }
};

const mergeWorkspaces = () => {
  importWorkspaces(pendingWorkspaces.value, true);
  mergeDialog.value = false;
};

const replaceWorkspaces = () => {
  importWorkspaces(pendingWorkspaces.value, false);
  mergeDialog.value = false;
};

const showSnackbar = (text, color = "success") => {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbar.value = true;
};
</script>
