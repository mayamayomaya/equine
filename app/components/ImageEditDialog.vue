<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
  >
    <v-card>
      <v-img :src="imageUrl" max-height="400" />

      <v-card-text>
        <v-text-field
          v-model="editingUrl"
          label="Image URL"
          variant="outlined"
          density="compact"
          clearable
          @keyup.enter="handleUpdate"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="handleClose"> Cancel </v-btn>
        <v-btn color="primary" variant="flat" @click="handleUpdate">
          Update Image
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
  imageUrl: {
    type: String,
    default: "",
  },
  taskId: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: "task",  
  },
  noteIndex: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "update"]);

const editingUrl = ref("");

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      editingUrl.value = props.imageUrl || "";
    }
  }
);

const handleUpdate = () => {
  emit("update", {
    url: editingUrl.value,
    taskId: props.taskId,
    type: props.type,
    noteIndex: props.noteIndex,
  });
  handleClose();
};

const handleClose = () => {
  editingUrl.value = "";
  emit("update:modelValue", false);
};
</script>
