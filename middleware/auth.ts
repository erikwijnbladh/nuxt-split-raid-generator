import type { NavigationGuard } from "#vue-router";

export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();

  // If we're on the client and user is null (not logged in)
  if (process.client && !user.value) {
    return navigateTo("/login");
  }
}) as NavigationGuard;
