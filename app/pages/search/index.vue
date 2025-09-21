<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12" md="8" class="mx-auto">
        <v-card class="mb-4">
          <v-card-text>
            <TaskSearch placeholder="Search all workspaces..." :global="true" />
          </v-card-text>
        </v-card>

        <v-card v-if="searchQuery && globalResults.length === 0">
          <v-card-text class="text-center py-8 text-medium-emphasis">
            No tasks found. Maybe you actually completed them? Good horse!
          </v-card-text>
        </v-card>

        <div v-else-if="globalResults.length > 0">
          <div class="text-h6 mb-3 text-medium-emphasis">
            Found {{ globalResults.length }} result{{
              globalResults.length !== 1 ? "s" : ""
            }}
          </div>

          <TaskCard
            v-for="task in globalResults"
            :key="task.id"
            :task="task"
            @update="handleTaskUpdate"
            @delete="handleTaskDelete"
            @toggle-complete="handleToggleComplete"
            @edit-image="handleEditImage"
            @edit-note-image="handleEditNoteImage"
            class="mb-3"
          >
            <template v-slot:prepend>
              <v-chip size="small" variant="tonal" class="mb-2">
                {{ task.workspaceName }}
              </v-chip>
            </template>
          </TaskCard>
        </div>
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
  </v-container>
</template>

<script setup>
import { useWorkspaceStore } from "~/stores/workspace";
import { storeToRefs } from "pinia";

const store = useWorkspaceStore();
const { searchQuery, globalSearchResults: globalResults } = storeToRefs(store);

const imageDialog = ref(false);
const editingImageUrl = ref("");
const editingImageTaskId = ref(null);
const editingImageType = ref("");
const editingNoteIndex = ref(null);

onMounted(() => {
  store.loadFromStorage();
  store.clearSearch();
});

onUnmounted(() => {
  store.clearSearch();
});

const formatDate = (isoString) => {
  return new Date(isoString).toLocaleDateString();
};

const handleTaskUpdate = (updatedTask) => {
  const task = globalResults.value.find((t) => t.id === updatedTask.id);
  if (task) {
    store.updateTaskInWorkspace(task.workspaceId, updatedTask.id, {
      text: updatedTask.text,
    });

    const currentQuery = store.searchQuery;
    store.clearSearch();
    nextTick(() => {
      store.setSearchQuery(currentQuery);
    });
  }
};

const handleTaskDelete = (taskId) => {
  const task = globalResults.value.find((t) => t.id === taskId);
  if (task) {
    store.deleteTaskFromWorkspace(task.workspaceId, taskId);
  }
};

const handleToggleComplete = (taskId) => {
  const task = globalResults.value.find((t) => t.id === taskId);
  if (task) {
    store.toggleTaskCompleteInWorkspace(task.workspaceId, taskId);
  }
};

const handleEditImage = (data) => {
  editingImageUrl.value = data.task.imageUrl || "";
  editingImageTaskId.value = data.task.id;
  editingImageType.value = "task";
  imageDialog.value = true;
};

const handleEditNoteImage = (data) => {
  editingImageUrl.value = data.note.imageUrl || "";
  editingImageTaskId.value = data.task.id;
  editingNoteIndex.value = data.index;
  editingImageType.value = "note";
  imageDialog.value = true;
};

const handleImageUpdate = (data) => {
  const task = globalResults.value.find((t) => t.id === data.taskId);
  if (!task) return;

  if (data.type === "task") {
    store.updateTaskInWorkspace(task.workspaceId, data.taskId, {
      imageUrl: data.url,
    });
  } else if (data.type === "note") {
    const workspace = store.workspaces.find((w) => w.id === task.workspaceId);
    const fullTask = workspace?.tasks.find((t) => t.id === data.taskId);
    if (fullTask && fullTask.notes) {
      const updatedNotes = [...fullTask.notes];
      if (updatedNotes[data.noteIndex]) {
        updatedNotes[data.noteIndex].imageUrl = data.url;
      }
      store.updateTaskInWorkspace(task.workspaceId, data.taskId, {
        notes: updatedNotes,
      });
    }
  }

  imageDialog.value = false;
};
</script>
