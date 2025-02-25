<template>
  <div class="max-w-md mx-auto py-20">
    <div class="text-center mb-10">
      <NuxtLink to="/" class="text-2xl font-bold text-primary"
        >Your App Name</NuxtLink
      >
      <h1 class="text-2xl font-bold mt-6 text-white">Reset Your Password</h1>
    </div>

    <UCard class="mb-4">
      <UForm :state="form" @submit="handleResetPassword">
        <UFormGroup label="New Password" name="password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Your new password"
          />
        </UFormGroup>

        <UFormGroup label="Confirm Password" name="confirmPassword">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your new password"
          />
        </UFormGroup>

        <div class="mt-4">
          <UButton
            type="submit"
            block
            :loading="loading"
            :disabled="!isFormValid"
          >
            Update Password
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const router = useRouter();
const loading = ref(false);
const toast = useToast();

const form = reactive({
  password: "",
  confirmPassword: "",
});

const isFormValid = computed(() => {
  return form.password.length >= 6 && form.password === form.confirmPassword;
});

const handleResetPassword = async () => {
  if (!isFormValid.value) {
    return toast.add({
      title: "Validation Error",
      description:
        form.password.length < 6
          ? "Password must be at least 6 characters"
          : "Passwords don't match",
      color: "red",
    });
  }

  try {
    loading.value = true;

    const { error } = await supabase.auth.updateUser({
      password: form.password,
    });

    if (error) throw error;

    toast.add({
      title: "Password Reset Successful",
      description: "Your password has been reset. Redirecting to login...",
      color: "green",
      icon: "i-heroicons-check-circle",
      timeout: 5000,
    });

    // Redirect to login after successful password reset
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (error) {
    toast.add({
      title: "Password Reset Failed",
      description: error.message,
      color: "red",
      icon: "i-heroicons-exclamation-circle",
      timeout: 5000,
    });
  } finally {
    loading.value = false;
  }
};
</script>
