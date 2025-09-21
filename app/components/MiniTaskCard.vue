<template>
  <v-card
    :variant="variant"
    :draggable="draggable && !task.completed"
    @dragstart="$emit('dragstart', $event)"
    @click="$emit('click')"
    class="mini-task-card"
    :class="{
      'completed-task': task.completed,
      'overdue-task': isOverdue && !task.completed,
    }"
    elevation="3"
    hover
  >
    <div class="task-priority-bar" :class="priorityClass"></div>

    <v-card-text class="pa-3">
      <div class="d-flex align-start">
        <v-checkbox
          :model-value="task.completed"
          @update:model-value="$emit('complete')"
          @click.stop
          density="compact"
          hide-details
          :color="isOverdue ? 'error' : 'primary'"
          class="ma-0 pa-0 me-2 flex-grow-0"
        />

        <div class="flex-grow-1">
          <div
            class="task-title font-weight-medium"
            :class="{
              'text-decoration-line-through text-grey': task.completed,
              'text-error': isOverdue && !task.completed,
            }"
          >
            {{ task.text }}
          </div>

          <div class="d-flex align-center mt-2 gap-1">
            <v-chip
              v-if="task.workspaceName && showWorkspace"
              size="x-small"
              :color="workspaceColor"
              variant="tonal"
              class="font-weight-bold"
            >
              {{ task.workspaceName }}
            </v-chip>

            <v-chip
              v-if="task.notes?.length > 0"
              size="x-small"
              variant="tonal"
              color="blue"
            >
              <v-icon start size="x-small">mdi-note</v-icon>
              {{ task.notes.length }}
            </v-chip>

            <v-chip
              v-if="task.imageUrl"
              size="x-small"
              variant="tonal"
              color="green"
            >
              <v-icon size="x-small">mdi-image</v-icon>
            </v-chip>
          </div>

          <div
            v-if="!task.completed && task.created"
            class="text-caption text-grey mt-1"
          >
            Added {{ timeAgo(task.created) }}
          </div>
        </div>

        <v-icon
          v-if="draggable && !task.completed"
          size="small"
          color="grey-lighten-1"
          class="drag-handle"
        >
          mdi-drag-vertical
        </v-icon>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  draggable: {
    type: Boolean,
    default: true,
  },
  showWorkspace: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click", "complete", "dragstart"]);

const variant = computed(() => {
  if (props.task.completed) return "flat";
  if (isOverdue.value) return "elevated";
  return "elevated";
});

const isOverdue = computed(() => {
  if (!props.task.due || props.task.completed) return false;
  const today = new Date().toISOString().split("T")[0];
  return props.task.due < today;
});

const priorityClass = computed(() => {
  if (props.task.completed) return "priority-done";
  if (isOverdue.value) return "priority-overdue";
  if (props.task.notes?.length > 2) return "priority-high";
  return "priority-normal";
});

const workspaceColor = computed(() => {
  const colors = ["purple", "indigo", "teal", "orange", "pink"];
  const index = props.task.workspaceName?.charCodeAt(0) % colors.length;
  return colors[index] || "grey";
});

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
};
</script>

<style scoped>
.mini-task-card {
  position: relative;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  border: 1px solid rgba(128, 128, 128, 0.2);
}

.mini-task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.mini-task-card[draggable="true"]:hover {
  cursor: grab;
}

.mini-task-card[draggable="true"]:active {
  cursor: grabbing;
}

.task-priority-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
}

.priority-normal {
  background: transparent;
}

.priority-high {
  background: linear-gradient(180deg, #ffa726, #ff9800);
}

.priority-overdue {
  background: linear-gradient(180deg, #ef5350, #f44336);
}

.priority-done {
  background: linear-gradient(180deg, #66bb6a, #4caf50);
}

.completed-task {
  opacity: 0.7;
}

.overdue-task {
  border-color: rgba(239, 68, 68, 0.3) !important;
  background: rgba(239, 68, 68, 0.1) !important;
}

.task-title {
  font-size: 0.875rem;
  line-height: 1.3;
}

.drag-handle {
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s;
}

.mini-task-card:hover .drag-handle {
  opacity: 0.4;
}

.drag-handle:hover {
  opacity: 1 !important;
}

.gap-1 {
  gap: 4px;
}
</style>
