<template>
  <v-card>
    <div class="task-header pa-4" :class="headerClass">
      <div class="d-flex align-start">
        <v-checkbox
          :model-value="task.completed"
          @update:model-value="$emit('toggle-complete', task.id)"
          color="white"
          hide-details
          class="mt-0 mr-3"
        />

        <div class="flex-grow-1">
          <h2 class="text-h5 font-weight-bold white--text mb-2">
            {{ task.text }}
          </h2>

          <div class="d-flex gap-2 flex-wrap">
            <v-chip
              size="small"
              :color="task.completed ? 'success' : 'white'"
              :variant="task.completed ? 'flat' : 'outlined'"
            >
              <v-icon start size="small">
                {{ task.completed ? "mdi-check-circle" : "mdi-clock-outline" }}
              </v-icon>
              {{ task.completed ? "Completed" : statusText }}
            </v-chip>

            <v-chip
              v-if="task.workspaceName"
              size="small"
              color="white"
              variant="outlined"
            >
              <v-icon start size="small">mdi-folder</v-icon>
              {{ task.workspaceName }}
            </v-chip>
          </div>
        </div>

        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="$emit('close')"
        />
      </div>
    </div>

    <v-card-text class="pa-4">
      <div class="info-section mb-4">
        <div class="d-flex align-center mb-2">
          <v-icon size="small" class="mr-2">mdi-calendar</v-icon>
          <span class="text-subtitle-2 font-weight-medium">Timeline</span>
        </div>

        <v-list density="compact" class="pa-0">
          <v-list-item class="px-2">
            <template v-slot:prepend>
              <v-icon size="small" color="grey">mdi-plus</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Created {{ formatDate(task.created, true) }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item v-if="task.due" class="px-2">
            <template v-slot:prepend>
              <v-icon size="small" :color="isOverdue ? 'error' : 'primary'">
                mdi-target
              </v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Due {{ formatDate(task.due, true) }}
              <v-chip
                v-if="isOverdue && !task.completed"
                size="x-small"
                color="error"
                class="ml-2"
              >
                OVERDUE
              </v-chip>
            </v-list-item-title>
          </v-list-item>

          <v-list-item v-if="task.completed" class="px-2">
            <template v-slot:prepend>
              <v-icon size="small" color="success">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title class="text-body-2">
              Completed {{ formatDate(task.completedAt, true) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <div v-if="task.notes?.length > 0" class="info-section mb-4">
        <div class="d-flex align-center mb-2">
          <v-icon size="small" class="mr-2">mdi-note-text</v-icon>
          <span class="text-subtitle-2 font-weight-medium">
            Notes ({{ task.notes.length }})
          </span>
        </div>

        <v-card
          v-for="(note, idx) in task.notes"
          :key="idx"
          variant="outlined"
          class="mb-2"
        >
          <v-card-text class="pa-3">
            <div class="text-body-2">{{ note.text }}</div>
            <v-img
              v-if="note.imageUrl"
              :src="note.imageUrl"
              class="mt-2 rounded"
              max-height="200"
              cover
              @click="$emit('view-image', note.imageUrl)"
            />
          </v-card-text>
        </v-card>
      </div>

      <div v-if="task.imageUrl" class="info-section mb-4">
        <div class="d-flex align-center mb-2">
          <v-icon size="small" class="mr-2">mdi-image</v-icon>
          <span class="text-subtitle-2 font-weight-medium">Attachment</span>
        </div>

        <v-img
          :src="task.imageUrl"
          class="rounded elevation-2"
          max-height="300"
          cover
          @click="$emit('view-image', task.imageUrl)"
          style="cursor: pointer"
        />
      </div>

      <v-alert
        v-if="task.rescheduleCount"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        <v-icon size="small">mdi-history</v-icon>
        Rescheduled {{ task.rescheduleCount }} time{{
          task.rescheduleCount !== 1 ? "s" : ""
        }}
      </v-alert>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-4">
      <v-btn
        v-if="!task.completed"
        color="success"
        variant="flat"
        @click="$emit('toggle-complete', task.id)"
      >
        <v-icon start>mdi-check</v-icon>
        Mark Complete
      </v-btn>

      <v-btn v-else variant="tonal" @click="$emit('toggle-complete', task.id)">
        <v-icon start>mdi-undo</v-icon>
        Reopen
      </v-btn>

      <v-btn variant="tonal" @click="$emit('edit', task)">
        <v-icon start>mdi-pencil</v-icon>
        Edit
      </v-btn>

      <v-spacer />

      <v-btn color="error" variant="text" @click="confirmDelete = true">
        <v-icon start>mdi-delete</v-icon>
        Delete
      </v-btn>
    </v-card-actions>

    <v-dialog v-model="confirmDelete" max-width="400">
      <v-card>
        <v-card-title>Delete Task?</v-card-title>
        <v-card-text>
          This action cannot be undone. The task "{{ task.text }}" will be
          permanently deleted.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="handleDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  "close",
  "toggle-complete",
  "edit",
  "delete",
  "view-image",
]);

const confirmDelete = ref(false);

const headerClass = computed(() => {
  if (props.task.completed) return "header-completed";
  if (isOverdue.value) return "header-overdue";
  return "header-active";
});

const isOverdue = computed(() => {
  if (!props.task.due || props.task.completed) return false;
  const today = new Date().toISOString().split("T")[0];
  return props.task.due < today;
});

const statusText = computed(() => {
  if (isOverdue.value) return "Overdue";
  if (!props.task.due) return "No deadline";

  const today = new Date().toISOString().split("T")[0];
  if (props.task.due === today) return "Due today";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (props.task.due === tomorrow.toISOString().split("T")[0])
    return "Due tomorrow";

  return "Upcoming";
});

const formatDate = (dateStr, relative = false) => {
  if (!dateStr) return "N/A";

  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (relative) {
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays === -1) return "tomorrow";
    if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 0 && diffDays > -7) return `in ${Math.abs(diffDays)} days`;
  }

  return date.toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

const handleDelete = () => {
  emit("delete", props.task.id);
  confirmDelete.value = false;
};
</script>

<style scoped>
.task-header {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.header-completed {
  background: #10b981;
}

.header-overdue {
  background: #ef4444;
}

.header-active {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}
.info-section {
  position: relative;
}

.gap-2 {
  gap: 8px;
}
</style>
