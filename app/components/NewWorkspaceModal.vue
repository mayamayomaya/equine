<template>
  <v-dialog v-model="dialog" max-width="500">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        class="mb-3"
        block
        v-bind="props"
      >
        New Equine Workspace
      </v-btn>
    </template>

    <v-card>
      <v-card-title>Create New Workspace</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="workspaceName"
          label="Workspace Name"
          variant="outlined"
          @keyup.enter="createWorkspace"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="createWorkspace"
          :disabled="!workspaceName.trim()"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const dialog = ref(false);
const workspaceName = ref("");

const createWorkspace = () => {
  if (!workspaceName.value.trim()) return;

  const workspace = {
    id: Date.now().toString(),
    name: workspaceName.value,
    created: new Date().toISOString(),
    tasks: [],
  };

  const workspaces = JSON.parse(
    localStorage.getItem("equine-workspaces") || "[]"
  );
  workspaces.push(workspace);
  localStorage.setItem("equine-workspaces", JSON.stringify(workspaces));

  localStorage.setItem("current-workspace", workspace.id);

  workspaceName.value = "";
  dialog.value = false;

  navigateTo("/task");
};
</script>
