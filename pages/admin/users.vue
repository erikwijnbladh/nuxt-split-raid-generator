<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">User Management</h1>

    <UCard>
      <div class="mb-4 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <UInput
            v-model="searchQuery"
            placeholder="Search users..."
            icon="i-heroicons-magnifying-glass"
          />
          <UButton color="gray" @click="loadUsers">Search</UButton>
        </div>
        <USelect
          v-model="adminFilter"
          :options="adminFilterOptions"
          class="w-52"
        />
      </div>

      <UTable :columns="columns" :rows="users" :loading="loading">
        <template #email-data="{ row }">
          <div>
            <p>{{ row.email }}</p>
            <p class="text-xs text-gray-500">
              ID: {{ row.id.substring(0, 8) }}...
            </p>
          </div>
        </template>

        <template #created_at-data="{ row }">
          {{ new Date(row.created_at).toLocaleDateString() }}
        </template>

        <template #is_admin-data="{ row }">
          <UBadge v-if="row.is_admin" color="amber">Admin</UBadge>
          <UBadge v-else color="gray">User</UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              @click="handleResetPassword(row)"
              color="blue"
              variant="soft"
              size="sm"
            >
              Reset Password
            </UButton>
          </div>
        </template>
      </UTable>

      <template #footer>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">
            Showing {{ users.length }} of {{ totalUsers }} users
          </p>
          <UPagination
            v-model="page"
            :total="totalPages"
            :ui="{ wrapper: 'gap-1' }"
          />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

const supabase = useSupabaseClient();
const toast = useToast();
const loading = ref(true);
const users = ref([]);
const totalUsers = ref(0);
const searchQuery = ref("");
const page = ref(1);
const pageSize = 10;
const adminFilter = ref("all");
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize));

const adminFilterOptions = [
  { label: "All Users", value: "all" },
  { label: "Admins Only", value: "admins" },
  { label: "Non-Admins", value: "non-admins" },
];

const columns = [
  { key: "email", label: "User" },
  { key: "created_at", label: "Joined" },
  { key: "is_admin", label: "Role" },
  { key: "actions", label: "Options" },
];

async function loadUsers() {
  try {
    loading.value = true;

    // Start with the profiles query
    let query = supabase
      .from("user_profiles")
      .select("id, is_admin, created_at", { count: "exact" });

    // Apply filters
    if (adminFilter.value === "admins") {
      query = query.eq("is_admin", true);
    } else if (adminFilter.value === "non-admins") {
      query = query.eq("is_admin", false);
    }

    // Apply pagination
    const from = (page.value - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: profiles, count, error } = await query;

    if (error) throw error;

    totalUsers.value = count || 0;

    if (profiles && profiles.length > 0) {
      // Get the user emails from auth.users using the RPC function we'll create
      const { data: userData, error: userError } = await supabase.rpc(
        "get_users_by_ids",
        { user_ids: profiles.map((p) => p.id) }
      );

      if (userError) throw userError;

      // Merge the data
      users.value = profiles.map((profile) => {
        const userInfo = userData.find((u) => u.id === profile.id) || {};
        return {
          ...profile,
          email: userInfo.email || "Unknown",
        };
      });
    } else {
      users.value = [];
    }
  } catch (error) {
    console.error("Error loading users:", error);
    toast.add({
      title: "Error",
      description: "Failed to load users",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
}

async function handleResetPassword(user) {
  try {
    loading.value = true;

    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    toast.add({
      title: "Password Reset Email Sent",
      description: `A password reset email has been sent to ${user.email}`,
      color: "green",
    });
  } catch (error) {
    console.error("Error sending password reset:", error);
    toast.add({
      title: "Error",
      description: "Failed to send password reset email",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
}

// Watch for page or filter changes to reload data
watch([page, adminFilter], () => {
  loadUsers();
});

onMounted(() => {
  loadUsers();
});
</script>
