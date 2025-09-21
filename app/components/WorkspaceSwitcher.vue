<template>
  <div>
    <v-btn
      variant="text"
      class="text-h5 ps-0"
      @click="dialog = true"
      v-if="currentWorkspace"
    >
      {{ currentWorkspace.name }}
      <v-icon end>mdi-chevron-down</v-icon>
    </v-btn>

    <slot v-else name="empty">
      <h2>No Workspace Selected</h2>
    </slot>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Switch Workspace</v-card-title>
        <v-list>
          <v-list-item
            v-for="workspace in workspaces"
            :key="workspace.id"
            @click="switchWorkspace(workspace.id)"
            :active="workspace.id === currentWorkspace?.id"
            active-color="primary"
          >
            <v-list-item-title v-if="editingWorkspace !== workspace.id">
              {{ workspace.name }}
            </v-list-item-title>

            <v-text-field
              v-else
              v-model="editingName"
              density="compact"
              variant="outlined"
              hide-details
              autofocus
              @keyup.enter="saveRename(workspace.id)"
              @keyup.esc="cancelRename"
              @click.stop
            />

            <v-list-item-subtitle>
              Created {{ formatDate(workspace.created) }} •
              {{ workspace.tasks?.length || 0 }} tasks
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-btn
                v-if="editingWorkspace !== workspace.id"
                icon="mdi-pencil"
                variant="text"
                size="small"
                @click.stop="startRename(workspace)"
              />

              <template v-else>
                <v-btn
                  icon="mdi-check"
                  variant="text"
                  size="small"
                  color="success"
                  @click.stop="saveRename(workspace.id)"
                />
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  size="small"
                  color="error"
                  @click.stop="cancelRename"
                />
              </template>

              <v-btn
                icon="mdi-delete"
                variant="text"
                size="small"
                @click.stop="deleteWorkspace(workspace.id)"
                v-if="
                  workspace.id !== currentWorkspace?.id &&
                  editingWorkspace !== workspace.id
                "
              />
            </template>
          </v-list-item>

          <v-list-item v-if="workspaces.length === 0">
            <v-list-item-title class="text-center text-medium-emphasis">
              No workspaces yet
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <ExportWorkspacesButton />

          <v-spacer />

          <v-btn variant="text" @click="dialog = false">Close</v-btn>
          <v-btn color="primary" variant="tonal" to="/">
            <v-icon start>mdi-plus</v-icon>
            New Workspace
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { useWorkspaceStore } from "~/stores/workspace";
import { storeToRefs } from "pinia";

const store = useWorkspaceStore();
const { workspaces, currentWorkspace } = storeToRefs(store);

const dialog = ref(false);
const editingWorkspace = ref(null);
const editingName = ref("");

onMounted(() => {
  store.loadFromStorage();
});

const switchWorkspace = (workspaceId) => {
  store.setCurrentWorkspace(workspaceId);
  dialog.value = false;
};

const deleteWorkspace = (workspaceId) => {
  store.deleteWorkspace(workspaceId);
};

const startRename = (workspace) => {
  editingWorkspace.value = workspace.id;
  editingName.value = workspace.name;
};

const saveRename = (workspaceId) => {
  if (!editingName.value.trim()) {
    cancelRename();
    return;
  }

  store.renameWorkspace(workspaceId, editingName.value);
  cancelRename();
};

const cancelRename = () => {
  editingWorkspace.value = null;
  editingName.value = "";
};

const formatDate = (isoString) => {
  if (!isoString) return "No date";
  return new Date(isoString).toLocaleDateString();
};
</script>
