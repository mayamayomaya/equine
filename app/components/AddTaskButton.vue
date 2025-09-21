<template>
  <v-btn
    color="primary"
    size="large"
    block
    variant="flat"
    prepend-icon="mdi-plus"
    @click="$emit('click')"
  >
    Add New Task
  </v-btn>
</template>

<script setup>
defineEmits(["click"]);
</script>
