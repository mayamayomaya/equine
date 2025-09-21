<template>
  <v-card class="mb-4" color="error" variant="tonal">
    <v-card-text class="d-flex justify-space-between align-center">
      <div>
        <v-icon start>mdi-alert</v-icon>
        You have {{ count }} overdue task{{ count !== 1 ? "s" : "" }}
      </div>

      <v-btn color="error" variant="flat" @click="$emit('reschedule')">
        Move All to Today
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    required: true,
  },
});

defineEmits(["reschedule"]);
</script>
