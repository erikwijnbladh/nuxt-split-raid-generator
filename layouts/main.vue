<template>
  <div class="min-h-screen bg-gray-900 flex">
    <!-- Left sidebar - hidden on auth pages -->
    <Transition name="slide">
      <div
        v-if="!isAuthPage"
        class="w-64 bg-gray-800 border-r border-primary/10 h-screen fixed left-0 top-0"
      >
        <div class="p-4">
          <nav class="space-y-2">
            <!-- Main navigation links -->
            <template v-if="!user">
              <NuxtLink
                to="/"
                class="flex items-center text-white hover:text-primary px-2 py-2 rounded-md"
              >
                <UIcon name="i-heroicons-home" class="mr-2" />
                Home
              </NuxtLink>
              <NuxtLink
                to="/login"
                class="flex items-center text-white hover:text-primary px-2 py-2 rounded-md"
              >
                <UIcon
                  name="i-heroicons-arrow-right-on-rectangle"
                  class="mr-2"
                />
                Sign In
              </NuxtLink>
              <NuxtLink
                to="/register"
                class="flex items-center text-white hover:text-primary px-2 py-2 rounded-md"
              >
                <UIcon name="i-heroicons-user-plus" class="mr-2" />
                Register
              </NuxtLink>
            </template>

            <!-- Logged in user navigation -->
            <template v-else>
              <NuxtLink
                to="/splits"
                class="flex items-center text-white hover:text-primary px-2 py-2 rounded-md"
              >
                <UIcon name="i-heroicons-chart-bar" class="mr-2" />
                Splits
              </NuxtLink>
              <NuxtLink
                to="/roster"
                class="flex items-center text-white hover:text-primary px-2 py-2 rounded-md"
              >
                <UIcon name="i-heroicons-user-group" class="mr-2" />
                Raid Roster
              </NuxtLink>
              <NuxtLink
                to="/profile"
                class="flex items-center text-white hover:text-primary px-2 py-2 rounded-md"
              >
                <UIcon name="i-heroicons-user" class="mr-2" />
                Profile
              </NuxtLink>
              <NuxtLink
                v-if="isAdmin"
                to="/admin"
                class="flex items-center text-white hover:text-primary px-2 py-2 rounded-md"
              >
                <UIcon name="i-heroicons-command-line" class="mr-2" />
                Admin
              </NuxtLink>
              <button
                @click="handleLogout"
                class="w-full flex items-center text-white hover:text-primary px-2 py-2 rounded-md text-left"
              >
                <UIcon
                  name="i-heroicons-arrow-left-on-rectangle"
                  class="mr-2"
                />
                Logout
              </button>
            </template>
          </nav>
        </div>
      </div>
    </Transition>

    <!-- Main content area with conditional padding based on sidebar visibility -->
    <main
      :class="[
        !isAuthPage ? 'ml-64' : '',
        'w-full transition-all duration-300',
      ]"
    >
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </main>

    <!-- Add UNotifications component -->
    <UNotifications />
  </div>
</template>

<script setup>
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute();
const isAdmin = ref(false);

// Check if current route is an auth page
const isAuthPage = computed(() => {
  const authPages = ["/", "/login", "/register", "/confirm"];
  return authPages.includes(route.path);
});

// Fetch user's admin status
async function fetchUserRole() {
  if (!user.value) return;

  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.value.id)
      .single();

    if (error) throw error;
    isAdmin.value = data?.is_admin || false;
  } catch (error) {
    console.error("Error fetching user role:", error);
    isAdmin.value = false;
  }
}

const handleLogout = async () => {
  await supabase.auth.signOut();
  router.push("/");
};

// Watch for user changes and fetch admin status when user is available
watch(
  user,
  (newUser) => {
    if (newUser) {
      fetchUserRole();
    } else {
      isAdmin.value = false;
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.1s ease, opacity 0.1s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
