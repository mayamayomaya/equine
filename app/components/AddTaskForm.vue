<template>
  <v-card class="mb-4">
    <v-card-text>
      <v-row align="center" no-gutters>
        <v-col>
          <v-text-field
            v-model="newTaskText"
            label="Add a task..."
            variant="outlined"
            density="comfortable"
            @keyup.enter="addTask"
            hide-details
          />
        </v-col>
        <v-col cols="auto" class="ms-2">
          <v-checkbox
            v-model="hasDeadline"
            label="Has deadline"
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="auto" class="ms-2">
          <v-btn
            icon="mdi-plus"
            variant="tonal"
            @click="addTask"
            :disabled="!newTaskText.trim()"
          />
        </v-col>
      </v-row>

      <v-expand-transition>
        <div v-if="hasDeadline" class="mt-4">
          <v-row no-gutters align="center">
            <v-col>
              <v-text-field
                v-model="dueDate"
                label="Due date"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="auto" class="ms-2">
              <v-btn variant="tonal" color="primary" @click="setDueToday">
                Today
              </v-btn>
            </v-col>
            <v-col cols="auto" class="ms-2">
              <v-btn variant="tonal" @click="setDueTomorrow"> Tomorrow </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>

      <div class="mt-3">
        <v-row no-gutters align="center">
          <v-col>
            <v-text-field
              v-model="taskImageUrl"
              label="Image URL (optional)"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            >
              <template v-slot:append-inner>
                <v-icon
                  v-if="taskImageUrl && isValidImageUrl(taskImageUrl)"
                  color="success"
                >
                  mdi-check
                </v-icon>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="auto">
            <TaskNotesModal v-model="taskNotes" />
          </v-col>
        </v-row>

        <v-expand-transition>
          <div
            v-if="taskImageUrl && isValidImageUrl(taskImageUrl)"
            class="mt-2"
          >
            <v-img
              :src="taskImageUrl"
              max-height="200"
              class="rounded"
              cover
              @error="imageLoadError = true"
            >
              <template v-slot:error>
                <div class="text-center pa-4 text-error">
                  Failed to load image
                </div>
              </template>
            </v-img>
          </div>
        </v-expand-transition>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const emit = defineEmits(["task-added"]);

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

  newTaskText.value = "";
  hasDeadline.value = false;
  dueDate.value = "";
  taskImageUrl.value = "";
  taskNotes.value = [];
  imageLoadError.value = false;
};
</script>
