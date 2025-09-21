<template>
  <v-btn
    :variant="variant"
    :color="color"
    :size="size"
    :block="block"
    @click="downloadWorkspaces"
  >
    <v-icon
      v-if="icon"
      :start="iconPosition === 'start'"
      :end="iconPosition === 'end'"
    >
      mdi-download
    </v-icon>
    {{ label }}
  </v-btn>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: "Export All",
  },
  variant: {
    type: String,
    default: "text",
  },
  color: {
    type: String,
    default: "success",
  },
  size: {
    type: String,
    default: "default",
  },
  icon: {
    type: Boolean,
    default: true,
  },
  iconPosition: {
    type: String,
    default: "start",
  },
  block: {
    type: Boolean,
    default: false,
  },
  filename: {
    type: String,
    default: "equine-workspaces",
  },
});

const downloadWorkspaces = () => {
  const workspaces = JSON.parse(
    localStorage.getItem("equine-workspaces") || "[]"
  );

  if (workspaces.length === 0) {
    console.warn("No workspaces to export, genius");
    return;
  }

  const dataStr = JSON.stringify(workspaces, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${props.filename}-${
    new Date().toISOString().split("T")[0]
  }.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>
