<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">Your Profile</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- User Info Card -->
      <UCard class="md:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Account Information</h2>
            <UBadge v-if="isAdmin" color="amber">Admin</UBadge>
            <UBadge v-else color="gray">User</UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-400">Email</h3>
            <p class="text-lg">{{ user?.email }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-400">Account Created</h3>
            <p class="text-lg">{{ formattedCreationDate }}</p>
          </div>

          <div
            v-if="isAdmin"
            class="bg-amber-100 bg-opacity-20 p-3 rounded-lg border border-amber-500 border-opacity-30"
          >
            <div class="flex items-center">
              <UIcon
                name="i-heroicons-shield-check"
                class="text-amber-500 mr-2 text-lg"
              />
              <p class="text-amber-500 font-medium">Administrator Account</p>
            </div>
            <p class="text-sm text-gray-300 mt-1">
              You have administrator privileges and can access the admin
              dashboard.
            </p>
          </div>
        </div>

        <template #footer v-if="isAdmin">
          <UButton to="/admin" color="amber" icon="i-heroicons-command-line">
            Go to Admin Dashboard
          </UButton>
        </template>
      </UCard>

      <!-- Quick Links Card -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Quick Links</h2>
        </template>

        <nav class="space-y-2">
          <UButton
            to="/dashboard"
            block
            color="white"
            variant="ghost"
            class="justify-start"
          >
            <UIcon name="i-heroicons-chart-bar" class="mr-2" />
            Dashboard
          </UButton>
          <UButton
            to="/roster"
            block
            color="white"
            variant="ghost"
            class="justify-start"
          >
            <UIcon name="i-heroicons-user-group" class="mr-2" />
            Raid Roster
          </UButton>
          <UButton
            @click="handleLogout"
            block
            color="white"
            variant="ghost"
            class="justify-start"
          >
            <UIcon name="i-heroicons-arrow-left-on-rectangle" class="mr-2" />
            Logout
          </UButton>
        </nav>
      </UCard>
    </div>

    <!-- Change password card -->
    <UCard class="mb-6">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">Change Password</h2>
        <UForm :state="passwordForm" @submit="handlePasswordChange">
          <UFormGroup label="Current Password" name="currentPassword">
            <UInput
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="Your current password"
            />
          </UFormGroup>

          <UFormGroup label="New Password" name="newPassword">
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Your new password"
            />
            <template #hint>
              <p class="text-xs text-gray-400">
                Password must be at least 6 characters
              </p>
            </template>
          </UFormGroup>

          <UFormGroup label="Confirm New Password" name="confirmPassword">
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm your new password"
            />
          </UFormGroup>

          <div class="mt-4">
            <UButton
              type="submit"
              color="primary"
              :loading="passwordLoading"
              :disabled="!canSubmitPasswordForm"
            >
              Update Password
            </UButton>
          </div>
        </UForm>
      </div>
    </UCard>

    <!-- Reset password option -->
    <UCard>
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">Reset Password</h2>
        <p class="text-gray-300 mb-4">
          Forgot your password? You can request a password reset email.
        </p>
        <UButton
          @click="handleResetPassword"
          variant="outline"
          color="gray"
          :loading="resetLoading"
        >
          Send Reset Email
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const router = useRouter();
const toast = useToast();
const isAdmin = ref(false);
const loading = ref(true);

// Password update form
const passwordLoading = ref(false);
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Password reset functionality
const resetLoading = ref(false);

// Computed property to check if password form can be submitted
const canSubmitPasswordForm = computed(() => {
  return (
    passwordForm.currentPassword.length > 0 &&
    passwordForm.newPassword.length >= 6 &&
    passwordForm.newPassword === passwordForm.confirmPassword
  );
});

const formattedCreationDate = computed(() => {
  if (!user.value?.created_at) return "-";
  return new Date(user.value.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Fetch admin status
async function fetchUserRole() {
  try {
    loading.value = true;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.value.id)
      .single();

    if (error) throw error;

    isAdmin.value = data?.is_admin || false;
  } catch (error) {
    console.error("Error fetching user role:", error);
  } finally {
    loading.value = false;
  }
}

// Handle logout
async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    router.push("/auth/login");
  }
}

// Handle password change
const handlePasswordChange = async () => {
  if (!canSubmitPasswordForm.value) {
    return toast.add({
      title: "Validation Error",
      description:
        passwordForm.newPassword.length < 6
          ? "New password must be at least 6 characters"
          : "Passwords don't match",
      color: "red",
      icon: "i-heroicons-exclamation-circle",
      timeout: 5000,
    });
  }

  try {
    passwordLoading.value = true;

    // First verify the current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: passwordForm.currentPassword,
    });

    if (signInError) {
      throw new Error("Current password is incorrect");
    }

    // If verification succeeded, update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (updateError) throw updateError;

    toast.add({
      title: "Password Updated",
      description: "Your password has been successfully changed",
      color: "green",
      icon: "i-heroicons-check-circle",
      timeout: 5000,
    });

    // Clear the form
    passwordForm.currentPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
  } catch (error) {
    toast.add({
      title: "Password Change Failed",
      description: error.message,
      color: "red",
      icon: "i-heroicons-exclamation-circle",
      timeout: 5000,
    });
  } finally {
    passwordLoading.value = false;
  }
};

// Handle password reset
const handleResetPassword = async () => {
  try {
    resetLoading.value = true;

    const { error } = await supabase.auth.resetPasswordForEmail(
      user.value.email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) throw error;

    toast.add({
      title: "Email Sent",
      description: "Check your email for the password reset link",
      color: "green",
      icon: "i-heroicons-envelope",
      timeout: 5000,
    });
  } catch (error) {
    toast.add({
      title: "Reset Request Failed",
      description: error.message,
      color: "red",
      icon: "i-heroicons-exclamation-circle",
      timeout: 5000,
    });
  } finally {
    resetLoading.value = false;
  }
};

onMounted(() => {
  fetchUserRole();
});
</script>
