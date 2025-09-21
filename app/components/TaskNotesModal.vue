<template>
  <v-dialog v-model="dialog" max-width="600">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="outlined" block class="mb-3">
        <v-icon start>mdi-note-text</v-icon>
        {{
          modelValue.length > 0 ? `Notes (${modelValue.length})` : "Add Notes"
        }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title>Task Notes</v-card-title>

      <v-card-text>
        <v-list v-if="localNotes.length > 0" class="mb-3">
          <v-list-item
            v-for="(note, index) in localNotes"
            :key="index"
            class="px-0"
          >
            <div class="d-flex align-start w-100">
              <div
                class="flex-grow-1"
                style="word-break: break-word; min-width: 0"
              >
                {{ note.text }}
              </div>

              <div class="d-flex align-center ml-2" style="flex-shrink: 0">
                <v-chip
                  v-if="note.imageUrl"
                  size="small"
                  color="success"
                  variant="tonal"
                  class="ms-2"
                >
                  <v-icon start size="small">mdi-image</v-icon>
                  Image
                </v-chip>

                <v-btn
                  :icon="note.imageUrl ? 'mdi-image-edit' : 'mdi-image-plus'"
                  size="small"
                  variant="text"
                  @click="openImageInput(index)"
                />

                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteNote(index)"
                />
              </div>
            </div>

            <v-expand-transition>
              <div v-if="editingImageIndex === index" class="mt-2">
                <v-text-field
                  v-model="tempImageUrl"
                  label="Image URL for this note"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @keyup.enter="saveNoteImage(index)"
                  @keyup.esc="cancelImageEdit"
                >
                  <template v-slot:append-inner>
                    <v-btn
                      icon="mdi-check"
                      size="x-small"
                      variant="text"
                      color="success"
                      @click="saveNoteImage(index)"
                    />
                  </template>
                </v-text-field>
              </div>
            </v-expand-transition>
          </v-list-item>
        </v-list>

        <div v-else class="text-center py-4 text-medium-emphasis">
          No notes yet
        </div>

        <v-divider class="mb-3" />

        <v-text-field
          v-model="newNoteText"
          label="Add a note..."
          density="compact"
          variant="outlined"
          hide-details
          @keyup.enter="addNote"
        >
          <template v-slot:append-inner>
            <v-btn
              icon="mdi-plus"
              size="small"
              variant="text"
              :disabled="!newNoteText.trim()"
              @click="addNote"
            />
          </template>
        </v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="cancel">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="save">Save Notes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const dialog = ref(false);
const localNotes = ref([]);
const newNoteText = ref("");
const editingImageIndex = ref(null);
const tempImageUrl = ref("");

watch(dialog, (newVal) => {
  if (newVal) {
    localNotes.value = JSON.parse(JSON.stringify(props.modelValue || []));
  }
});

const addNote = () => {
  if (!newNoteText.value.trim()) return;

  localNotes.value.push({
    text: newNoteText.value,
    imageUrl: null,
  });

  newNoteText.value = "";
};

const deleteNote = (index) => {
  localNotes.value.splice(index, 1);
};

const openImageInput = (index) => {
  editingImageIndex.value = index;
  tempImageUrl.value = localNotes.value[index].imageUrl || "";
};

const saveNoteImage = (index) => {
  localNotes.value[index].imageUrl = tempImageUrl.value || null;
  cancelImageEdit();
};

const cancelImageEdit = () => {
  editingImageIndex.value = null;
  tempImageUrl.value = "";
};

const save = () => {
  emit("update:modelValue", localNotes.value);
  dialog.value = false;
};

const cancel = () => {
  localNotes.value = [];
  newNoteText.value = "";
  dialog.value = false;
};
</script>
