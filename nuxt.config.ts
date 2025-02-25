// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/supabase", "@nuxt/ui"],
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/", "/register"],
    },
  },
  ui: {
    // Optional UI configuration
    icons: ["heroicons", "mdi"],
    colorMode: {
      preference: "dark",
      fallback: "dark",
      classSuffix: "",
    },
  },
  // Enable page transitions
  app: {
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
  },
});
