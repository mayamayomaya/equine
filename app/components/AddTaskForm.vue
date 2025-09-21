<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
    persistent
  >
    <v-card>
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>New Task</v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="closeDialog" />
      </v-toolbar>

      <v-card-text class="pa-6">
        <v-text-field
          v-model="newTaskText"
          label="What needs to be done?"
          variant="solo-filled"
          flat
          autofocus
          hide-details
          class="mb-4"
        />

        <v-sheet
          :color="
            $vuetify.theme.current.dark ? 'grey-darken-3' : 'grey-lighten-4'
          "
          rounded
          class="pa-3 mb-4"
        >
          <v-row align="center" no-gutters>
            <v-col>
              <v-checkbox
                v-model="hasDeadline"
                label="Add deadline"
                hide-details
                density="compact"
              />
            </v-col>
            <v-col cols="auto" v-if="hasDeadline">
              <v-btn-group variant="tonal" density="compact">
                <v-btn @click="setDueToday">Today</v-btn>
                <v-btn @click="setDueTomorrow">Tomorrow</v-btn>
              </v-btn-group>
            </v-col>
          </v-row>

          <v-expand-transition>
            <v-text-field
              v-if="hasDeadline"
              v-model="dueDate"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
              class="mt-3"
            />
          </v-expand-transition>
        </v-sheet>

        <div>
          <div class="text-caption text-medium-emphasis mb-2">OPTIONAL</div>

          <v-text-field
            v-model="taskImageUrl"
            label="Image URL"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            class="mb-3"
          >
            <template v-slot:append-inner>
              <v-icon
                v-if="taskImageUrl && isValidImageUrl(taskImageUrl)"
                color="success"
                size="small"
              >
                mdi-check
              </v-icon>
            </template>
          </v-text-field>

          <TaskNotesModal v-model="taskNotes" />

          <v-expand-transition>
            <v-img
              v-if="taskImageUrl && isValidImageUrl(taskImageUrl)"
              :src="taskImageUrl"
              max-height="150"
              class="rounded mt-3"
              cover
            />
          </v-expand-transition>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          @click="addTask"
          :disabled="!newTaskText.trim()"
        >
          Create Task
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["task-added", "update:modelValue"]);

const newTaskText = ref("");
const hasDeadline = ref(false);
const dueDate = ref("");
const taskImageUrl = ref("");
const taskNotes = ref([]);
const imageLoadError = ref(false);

watch(hasDeadline, (newVal) => {
  if (newVal && !dueDate.value) {
    setDueToday();
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      newTaskText.value = "";
      hasDeadline.value = false;
      dueDate.value = "";
      taskImageUrl.value = "";
      taskNotes.value = [];
      imageLoadError.value = false;
    }
  }
);

const isValidImageUrl = (url) => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

const setDueToday = () => {
  const today = new Date();
  dueDate.value = today.toISOString().split("T")[0];
};

const setDueTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dueDate.value = tomorrow.toISOString().split("T")[0];
};

const addTask = () => {
  if (!newTaskText.value.trim()) return;

  const task = {
    id: Date.now().toString(),
    text: newTaskText.value,
    created: new Date().toISOString(),
    hasDeadline: hasDeadline.value,
    due: hasDeadline.value && dueDate.value ? dueDate.value : null,
    completed: false,
    completedAt: null,
    imageUrl:
      taskImageUrl.value && isValidImageUrl(taskImageUrl.value)
        ? taskImageUrl.value
        : null,
    notes: taskNotes.value || [],
  };

  emit("task-added", task);
  closeDialog();
};

const closeDialog = () => {
  emit("update:modelValue", false);
};
</script>
