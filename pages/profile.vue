<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">Your Profile</h1>

    <!-- User info card -->
    <UCard class="mb-6">
      <div v-if="user" class="p-4">
        <h2 class="text-lg font-semibold mb-4">Account Information</h2>
        <div class="flex items-center mb-4">
          <UAvatar :alt="user.email || 'User'" size="lg" class="mr-4" />
          <div>
            <p class="text-gray-300">{{ user.email }}</p>
            <p class="text-sm text-gray-400">
              Account ID: {{ user.id.substring(0, 8) }}...
            </p>
          </div>
        </div>
      </div>
    </UCard>

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
const toast = useToast();

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
</script>
