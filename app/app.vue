<template>
  <NuxtLayout>
    <v-app>
      <v-navigation-drawer
        v-if="!isMobile"
        permanent
        :rail="rail"
        rail-width="68"
        @click:rail="rail = !rail"
      >
        <v-list-item class="px-2" @click="rail = !rail">
          <template v-if="!rail">
            <v-list-item-title class="text-h6">Equine</v-list-item-title>
          </template>
          <template v-else>
            <div class="text-center w-100">
              <v-icon>mdi-horse</v-icon>
            </div>
          </template>
        </v-list-item>

        <v-divider />

        <v-list nav density="compact">
          <v-list-item
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :prepend-icon="item.icon"
            :title="item.title"
            color="primary"
          />
        </v-list>

        <template v-slot:append>
          <v-divider />
          <div class="pa-2 text-center">
            <ThemeToggle />
          </div>
        </template>
      </v-navigation-drawer>

      <v-main>
        <div ref="swipeTarget" :style="swipeStyle" class="h-100">
          <NuxtPage />
        </div>
      </v-main>

      <v-bottom-navigation
        :key="route.path"
        v-if="isMobile"
        grow
        bg-color="surface"
      >
        <v-btn v-for="item in navItems" :key="item.path" :to="item.path">
          <v-icon>{{ item.icon }}</v-icon>
          <span class="text-caption">{{ item.title }}</span>
        </v-btn>
      </v-bottom-navigation>

      <v-snackbar
        v-model="showSwipeHint"
        :timeout="800"
        location="top"
        color="surface-variant"
        rounded="pill"
        elevation="2"
      >
        <div class="text-center">
          <v-icon size="small">{{ swipeIcon }}</v-icon>
          {{ swipeText }}
        </div>
      </v-snackbar>
    </v-app>
  </NuxtLayout>
</template>

<script setup>
import { useSwipe } from "@vueuse/core";
import { useDisplay } from "vuetify";

const router = useRouter();
const route = useRoute();
const display = useDisplay();

const rail = ref(false);
const swipeTarget = ref(null);
const swipeStyle = ref({});
const showSwipeHint = ref(false);
const swipeIcon = ref("");
const swipeText = ref("");

const isMobile = computed(() => display.mobile.value);

const navItems = [
  { path: "/", icon: "mdi-home", title: "Home" },
  { path: "/task", icon: "mdi-checkbox-marked-circle", title: "Tasks" },
  { path: "/search", icon: "mdi-magnify", title: "Search" },
  { path: "/timeline", icon: "mdi-timeline", title: "Timeline" },
];

const currentIndex = computed(() => {
  return navItems.findIndex((item) => item.path === route.path);
});

if (process.client) {
  const { direction, lengthX } = useSwipe(swipeTarget, {
    threshold: 50,
    onSwipe() {
      if (!isMobile.value) return;

      swipeStyle.value = {
        opacity: Math.max(0.5, 1 - Math.abs(lengthX.value) / 500),
        transition: "none",
      };
    },
    onSwipeEnd() {
      if (!isMobile.value) return;

      swipeStyle.value = {
        transform: "translateX(0)",
        opacity: 1,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      };

      if (
        direction.value === "left" &&
        currentIndex.value < navItems.length - 1
      ) {
        const next = navItems[currentIndex.value + 1];
        router.push(next.path);

        swipeIcon.value = next.icon;
        swipeText.value = next.title;
        showSwipeHint.value = true;
      } else if (direction.value === "right" && currentIndex.value > 0) {
        const prev = navItems[currentIndex.value - 1];
        router.push(prev.path);

        swipeIcon.value = prev.icon;
        swipeText.value = prev.title;
        showSwipeHint.value = true;
      }
    },
  });
}
</script>

<style scoped>
.h-100 {
  height: 100%;
  overflow-x: hidden;
}
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.v-main {
  padding-bottom: 56px !important;
}

@media (min-width: 960px) {
  .v-main {
    padding-bottom: 0 !important;
  }
}
</style>
