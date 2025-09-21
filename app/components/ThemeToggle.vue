<template>
  <v-btn
    :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
    variant="text"
    @click="toggleTheme"
  />
</template>

<script setup>
import { useTheme } from "vuetify";

const theme = useTheme();

const isDark = computed(() => theme.global.current.value.dark);

const toggleTheme = () => {
  theme.global.name.value = isDark.value ? "light" : "dark";
  localStorage.setItem("theme-preference", theme.global.name.value);
};

onMounted(() => {
  const saved = localStorage.getItem("theme-preference");
  if (saved) {
    theme.global.name.value = saved;
  }
});
</script>
