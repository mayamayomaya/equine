<template>
  <v-card
    :variant="task.completed ? 'tonal' : 'elevated'"
    :elevation="task.completed ? 0 : 1"
    :class="{ 'task-completed': task.completed }"
  >
    <v-card-text>
      <v-row no-gutters align="start">
        <v-col v-if="task.imageUrl && !task.completed" cols="auto" class="pr-3">
          <v-img
            :src="task.imageUrl"
            width="100"
            height="100"
            class="rounded"
            cover
            @click.stop="$emit('edit-image', { task, type: 'task' })"
            style="cursor: pointer"
          />
        </v-col>

        <v-col>
          <div
            v-if="!isEditing"
            @click="startEdit"
            style="cursor: pointer"
            class="mb-3"
          >
            <span
              class="text-body-1"
              :class="{
                'text-decoration-line-through text-medium-emphasis':
                  task.completed,
              }"
              style="
                font-size: 1.125rem !important;
                font-weight: 500;
                line-height: 1.4;
              "
            >
              {{ task.text }}
            </span>
            <v-chip
              v-if="isOverdue && !task.completed"
              size="x-small"
              color="error"
              variant="flat"
              class="ms-2"
            >
              OVERDUE
            </v-chip>
          </div>

          <v-text-field
            v-else
            v-model="editingText"
            density="compact"
            variant="outlined"
            hide-details
            autofocus
            @keyup.enter="saveEdit"
            @keyup.esc="cancelEdit"
            @blur="saveEdit"
          />

          <div v-if="task.notes && task.notes.length > 0" class="mb-3">
            <div class="text-caption text-medium-emphasis mb-2">Notes:</div>
            <v-sheet
              v-for="(note, idx) in task.notes"
              :key="idx"
              class="d-flex align-center pa-2 mb-2"
              rounded
              elevation="1"
              :color="noteColor"
            >
              <div class="flex-grow-1 text-body-2">{{ note.text }}</div>
              <v-img
                v-if="note.imageUrl"
                :src="note.imageUrl"
                max-width="60"
                max-height="40"
                class="rounded ms-2"
                cover
                @click.stop="
                  $emit('edit-note-image', { task, note, index: idx })
                "
                style="cursor: pointer"
              />
            </v-sheet>
          </div>

          <div class="text-caption text-medium-emphasis">
            <span v-if="task.completed" class="text-success">
              Completed {{ formatDate(task.completedAt) }} •
            </span>
            Added {{ formatDate(task.created) }}
            <span
              v-if="task.due"
              :class="
                isOverdue && !task.completed ? 'text-error' : 'text-primary'
              "
            >
              • Due {{ formatDate(task.due) }}
            </span>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions class="pt-0">
      <v-btn
        v-if="!task.completed"
        variant="text"
        size="small"
        color="success"
        @click="$emit('toggle-complete', task.id)"
      >
        <v-icon start size="small">mdi-check</v-icon>
        Mark as complete
      </v-btn>
      <v-btn
        v-else
        variant="text"
        size="small"
        @click="$emit('toggle-complete', task.id)"
      >
        <v-icon start size="small">mdi-undo</v-icon>
        Undo
      </v-btn>

      <v-spacer />
      <v-btn
        v-if="showMoveAction && !task.completed"
        icon="mdi-folder-move"
        variant="text"
        size="small"
        @click="$emit('move-task', task)"
        title="Move to another workspace"
      />

      <v-btn
        icon="mdi-delete"
        variant="text"
        size="small"
        color="error"
        @click="$emit('delete', task.id)"
      />
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useTheme } from "vuetify";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  showMoveAction: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "update",
  "delete",
  "toggle-complete",
  "edit-image",
  "edit-note-image",
  "move-task",
]);
const theme = useTheme();

const isEditing = ref(false);
const editingText = ref("");

const isOverdue = computed(() => {
  if (!props.task.due) return false;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const dueDate = new Date(props.task.due);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < now;
});

const noteColor = computed(() => {
  return theme.current.value.dark ? "grey-darken-3" : "grey-lighten-5";
});

const formatDate = (isoString) => {
  if (!isoString) return "No date";
  return new Date(isoString).toLocaleDateString();
};

const startEdit = () => {
  if (props.task.completed) return;
  isEditing.value = true;
  editingText.value = props.task.text;
};

const saveEdit = () => {
  if (!editingText.value.trim()) {
    cancelEdit();
    return;
  }

  emit("update", {
    ...props.task,
    text: editingText.value,
  });

  isEditing.value = false;
  editingText.value = "";
};

const cancelEdit = () => {
  isEditing.value = false;
  editingText.value = "";
};
</script>

<style scoped>
.task-completed {
  opacity: 0.6;
}
</style>
