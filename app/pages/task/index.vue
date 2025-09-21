<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12" md="8" class="mx-auto">
        <WorkspaceHeader
          :task-count="currentTasks.length"
          :has-workspace="!!currentWorkspace"
        />

        <SearchCard v-if="currentWorkspace" />

        <OverdueAlert
          v-if="overdueCount > 0 && currentWorkspace"
          :count="overdueCount"
          @reschedule="handleReschedule"
        />
        <AddTaskForm v-if="currentWorkspace" @task-added="handleTaskAdded" />

        <TaskList
          v-if="currentWorkspace"
          :tasks="currentTasks"
          :completed-count="completedCount"
          @task-updated="handleTaskUpdated"
          @task-deleted="handleTaskDeleted"
          @clear-completed="store.clearCompleted"
          @edit-image="openImageDialog"
          @edit-note-image="openNoteImageDialog"
          @move-task="openMoveDialog"
        />
        <EmptyState v-if="!currentWorkspace" />
      </v-col>
    </v-row>

    <ImageEditDialog
      v-model="imageDialog"
      :image-url="editingImageUrl"
      :task-id="editingImageTaskId"
      :type="editingImageType"
      :note-index="editingNoteIndex"
      @update="handleImageUpdate"
    />
    <MoveTaskDialog
      v-model="moveDialog"
      :current-workspace-id="currentWorkspace?.id || ''"
      :task-name="movingTask?.text"
      @confirm="handleMoveTask"
    />
  </v-container>
</template>

<script setup>
import { useWorkspaceStore } from "~/stores/workspace";
import { storeToRefs } from "pinia";

const store = useWorkspaceStore();
const {
  currentWorkspace,
  currentTasks: allTasks,
  filteredCurrentTasks: currentTasks,
  completedCount,
  overdueCount,
} = storeToRefs(store);

const imageDialog = ref(false);
const dialogImage = ref("");
const editingImageUrl = ref("");
const editingImageTaskId = ref(null);
const editingImageType = ref("");
const editingNoteIndex = ref(null);
const moveDialog = ref(false);
const movingTask = ref(null);

const openMoveDialog = (task) => {
  movingTask.value = task;
  moveDialog.value = true;
};

const handleMoveTask = (targetWorkspaceId) => {
  if (movingTask.value && currentWorkspace.value) {
    const success = store.moveTaskToWorkspace(
      movingTask.value.id,
      currentWorkspace.value.id,
      targetWorkspaceId
    );

    if (success) {
      console.log("Task moved successfully");
    }
  }
  moveDialog.value = false;
  movingTask.value = null;
};
onMounted(() => {
  store.loadFromStorage();
});

const handleReschedule = () => {
  const count = store.rescheduleOverdueTasks();
  console.log(`Rescheduled ${count} tasks to today`);
};

const handleTaskAdded = (task) => {
  const updatedTasks = [...allTasks.value, task];
  store.updateCurrentTasks(updatedTasks);
  store.clearSearch();
};

const handleTaskUpdated = (updatedTask) => {
  const updatedTasks = allTasks.value.map((t) =>
    t.id === updatedTask.id ? updatedTask : t
  );
  store.updateCurrentTasks(updatedTasks);
};

const handleTaskDeleted = (taskId) => {
  const updatedTasks = allTasks.value.filter((t) => t.id !== taskId);
  store.updateCurrentTasks(updatedTasks);
};

const handleImageUpdate = (data) => {
  if (data.type === "task") {
    const updatedTasks = allTasks.value.map((t) =>
      t.id === data.taskId ? { ...t, imageUrl: data.url } : t
    );
    store.updateCurrentTasks(updatedTasks);
  } else if (data.type === "note") {
    const updatedTasks = allTasks.value.map((t) => {
      if (t.id === data.taskId) {
        const updatedNotes = [...(t.notes || [])];
        if (updatedNotes[data.noteIndex]) {
          updatedNotes[data.noteIndex].imageUrl = data.url;
        }
        return { ...t, notes: updatedNotes };
      }
      return t;
    });
    store.updateCurrentTasks(updatedTasks);
  }
  imageDialog.value = false;
};
const openImageDialog = (data) => {
  dialogImage.value = data.task.imageUrl;
  editingImageUrl.value = data.task.imageUrl || "";
  editingImageTaskId.value = data.task.id;
  editingImageType.value = "task";
  imageDialog.value = true;
};

const openNoteImageDialog = (data) => {
  dialogImage.value = data.note.imageUrl;
  editingImageUrl.value = data.note.imageUrl || "";
  editingImageTaskId.value = data.task.id;
  editingNoteIndex.value = data.index;
  editingImageType.value = "note";
  imageDialog.value = true;
};
</script>
