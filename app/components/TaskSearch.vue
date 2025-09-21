<template>
  <v-text-field
    :model-value="searchQuery"
    @update:model-value="updateSearch"
    :placeholder="placeholder"
    prepend-inner-icon="mdi-magnify"
    variant="outlined"
    density="compact"
    hide-details
    clearable
    @click:clear="store.clearSearch()"
    @keyup.escape="store.clearSearch()"
  />
</template>

<script setup>
import { useWorkspaceStore } from "~/stores/workspace";
import { storeToRefs } from "pinia";

const props = defineProps({
  placeholder: {
    type: String,
    default: "Search tasks...",
  },
  global: {
    type: Boolean,
    default: false,
  },
});

const store = useWorkspaceStore();
const { searchQuery } = storeToRefs(store);

const updateSearch = (value) => {
  store.setSearchQuery(value || "");
};
</script>
