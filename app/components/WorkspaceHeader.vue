<template>
  <v-card class="mb-4" variant="flat">
    <v-card-title class="d-flex justify-space-between align-center">
      <div>
        <WorkspaceSwitcher />
        <v-card-subtitle class="pa-0">
          {{ taskCount }} task{{ taskCount !== 1 ? "s" : "" }}
        </v-card-subtitle>
      </div>

      <v-btn v-if="!hasWorkspace" color="primary" variant="tonal" to="/">
        Create Workspace
      </v-btn>
    </v-card-title>
  </v-card>
</template>

<script setup>
defineProps({
  taskCount: {
    type: Number,
    default: 0,
  },
  hasWorkspace: {
    type: Boolean,
    default: false,
  },
});
</script>
