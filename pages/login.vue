<template>
  <div class="max-w-md mx-auto py-20">
    <div class="text-center mb-10">
      <NuxtLink to="/" class="text-2xl font-bold text-primary"
        >Your App Name</NuxtLink
      >
      <h1 class="text-2xl font-bold mt-6 text-white">Sign In</h1>
    </div>

    <UCard class="mb-4">
      <UForm :state="form" @submit="handleLogin">
        <UFormGroup label="Email" name="email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
          />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="********"
          />
        </UFormGroup>

        <div class="mt-4">
          <UButton type="submit" block :loading="loading">Sign In</UButton>
        </div>
      </UForm>
    </UCard>

    <div class="text-center">
      <p class="text-sm text-gray-300">
        Don't have an account?
        <NuxtLink to="/register" class="text-primary">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const router = useRouter();
const loading = ref(false);
const errorMessage = ref("");
const toast = useToast();

const form = reactive({
  email: "",
  password: "",
});

const handleLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = "";

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) throw error;

    // Redirect to dashboard on success
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = error.message;
    toast.add({
      title: "Login Failed",
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
