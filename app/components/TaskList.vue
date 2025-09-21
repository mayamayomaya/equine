<template>
  <div>
    <div
      class="d-flex justify-space-between align-center mb-4 pa-3 rounded-lg"
      :style="headerStyle"
    >
      <span class="text-h6 font-weight-medium">Tasks</span>
      <div>
        <v-chip
          size="small"
          variant="tonal"
          class="me-2"
          v-if="completedCount > 0"
        >
          {{ completedCount }} completed
        </v-chip>
        <v-btn
          v-if="completedCount > 0"
          size="small"
          variant="text"
          color="error"
          @click="$emit('clear-completed')"
        >
          Clear Completed
        </v-btn>
      </div>
    </div>

    <TaskCard
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @update="$emit('task-updated', $event)"
      @delete="$emit('task-deleted', $event)"
      @toggle-complete="handleToggleComplete"
      @edit-image="handleEditImage"
      @edit-note-image="handleEditNoteImage"
      @move-task="$emit('move-task', $event)"
      class="mb-3"
    />
    <v-card v-if="tasks.length === 0" variant="flat">
      <v-card-text class="text-center py-8 text-medium-emphasis">
        No tasks yet. Stop horsing around.
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { useTheme } from "vuetify";
import { useWorkspaceStore } from "~/stores/workspace";

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
  completedCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  "task-updated",
  "task-deleted",
  "clear-completed",
  "edit-image",
  "edit-note-image",
  "move-task",
]);
const theme = useTheme();
const store = useWorkspaceStore();

const headerStyle = computed(() => {
  return theme.current.value.dark
    ? "background-color: rgba(255, 255, 255, 0.05)"
    : "background-color: rgba(0, 0, 0, 0.03)";
});

const handleToggleComplete = (taskId) => {
  store.toggleTaskComplete(taskId);
};

const handleEditImage = (data) => {
  emit("edit-image", data);
};

const handleEditNoteImage = (data) => {
  emit("edit-note-image", data);
};
</script>
