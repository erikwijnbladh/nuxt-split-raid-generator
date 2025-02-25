<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">Admin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-database" class="text-xl mr-2" />
            <h2 class="text-lg font-semibold">WoW Data Management</h2>
          </div>
        </template>

        <p class="text-gray-400 mb-4">Manage game data.</p>

        <template #footer>
          <UButton to="/admin/wow-data" color="primary" block>
            Manage WoW Data
          </UButton>
        </template>
      </UCard>
      <UCard>
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-users" class="text-xl mr-2" />
            <h2 class="text-lg font-semibold">User Management</h2>
          </div>
        </template>

        <p class="text-gray-400 mb-4">Manage users.</p>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Total Users</p>
              <p class="text-2xl font-bold">{{ userStats.total }}</p>
            </div>

            <UIcon
              name="i-heroicons-user-group"
              class="text-3xl text-gray-500"
            />
          </div>
        </div>

        <template #footer>
          <UButton to="/admin/users" color="primary" block>
            Manage Users
          </UButton>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

const supabase = useSupabaseClient();
const loading = ref(true);
const userStats = ref({
  total: 0,
});

onMounted(async () => {
  try {
    // Get user stats
    const { count: totalUsers } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    userStats.value = {
      total: totalUsers || 0,
    };

    // We would load the WoW data stats here once those tables are created
  } catch (error) {
    console.error("Error loading admin dashboard stats:", error);
  } finally {
    loading.value = false;
  }
});
</script>
