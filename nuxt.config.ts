export default defineNuxtConfig({
  pages: true,
  ssr: false,
  devtools: { enabled: false },
  css: ["vuetify/styles", "@mdi/font/css/materialdesignicons.min.css"],
  plugins: ["~/plugins/vuetify.ts"],
  components: true,
  modules: ["@nuxt/eslint", "@nuxt/icon", "@nuxt/image", "@pinia/nuxt"],
  build: {
    transpile: ["vuetify"],
  },
  nitro: {
    preset: "github-pages",
  },
  app: {
    baseURL: "/equine/",
  },
});
