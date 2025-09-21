<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
  >
    <v-card>
      <v-card-title>
        Move Task
        <div
          class="text-body-2 text-medium-emphasis mt-1"
          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap"
        >
          Select destination workspace for "{{ taskName }}"
        </div>
      </v-card-title>

      <v-card-text>
        <v-list v-if="availableWorkspaces.length > 0">
          <v-list-item
            v-for="workspace in availableWorkspaces"
            :key="workspace.id"
            :value="workspace.id"
            @click="selectedWorkspaceId = workspace.id"
            :active="selectedWorkspaceId === workspace.id"
            rounded
            class="mb-2"
          >
            <v-list-item-title>
              {{ workspace.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ workspace.tasks?.length || 0 }} task{{
                workspace.tasks?.length !== 1 ? "s" : ""
              }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-alert v-else type="info" variant="tonal" class="mt-2">
          No other workspaces available. Create a new workspace first.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel"> Cancel </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!selectedWorkspaceId"
          @click="confirmMove"
        >
          Move Task
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { useWorkspaceStore } from "~/stores/workspace";
import { storeToRefs } from "pinia";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  currentWorkspaceId: {
    type: String,
    required: true,
  },
  taskName: {
    type: String,
    default: "this task",
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const store = useWorkspaceStore();
const { workspaces } = storeToRefs(store);

const selectedWorkspaceId = ref(null);

const availableWorkspaces = computed(() => {
  return workspaces.value.filter((w) => w.id !== props.currentWorkspaceId);
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      selectedWorkspaceId.value = null;
    }
  }
);

const confirmMove = () => {
  if (selectedWorkspaceId.value) {
    emit("confirm", selectedWorkspaceId.value);
    emit("update:modelValue", false);
  }
};

const cancel = () => {
  selectedWorkspaceId.value = null;
  emit("update:modelValue", false);
};
</script>
