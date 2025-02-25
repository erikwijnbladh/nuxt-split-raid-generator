<template>
  <div class="max-w-md mx-auto py-12">
    <h1 class="text-2xl font-bold mb-8 text-center text-white">
      Create Account
    </h1>

    <template v-if="registered">
      <UCard>
        <div class="text-center py-4">
          <UIcon
            name="i-heroicons-envelope-check"
            class="text-5xl text-green-500 mb-4"
          />
          <h2 class="text-xl font-semibold mb-2">Check your email!</h2>
          <p class="text-gray-300 mb-4">
            We've sent a verification link to <strong>{{ form.email }}</strong>
          </p>
          <p class="text-sm text-gray-400">
            Please check your inbox and click the verification link to complete
            your registration.
          </p>
        </div>
      </UCard>
    </template>

    <template v-else>
      <UCard class="mb-4">
        <UForm :state="form" @submit="handleRegister">
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
            <UButton type="submit" block :loading="loading"
              >Create Account</UButton
            >
          </div>
        </UForm>
      </UCard>

      <div class="text-center">
        <p class="text-sm text-gray-300">
          Already have an account?
          <NuxtLink to="/login" class="text-primary">Sign In</NuxtLink>
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const loading = ref(false);
const registered = ref(false);
const errorMessage = ref("");
const toast = useToast();

const form = reactive({
  email: "",
  password: "",
});

const handleRegister = async () => {
  if (!form.email || !form.password) {
    toast.add({
      title: "Validation Error",
      description: "Please provide both email and password",
      color: "red",
      icon: "i-heroicons-exclamation-circle",
      timeout: 5000,
    });
    return;
  }

  if (form.password.length < 6) {
    toast.add({
      title: "Validation Error",
      description: "Password must be at least 6 characters long",
      color: "red",
      icon: "i-heroicons-exclamation-circle",
      timeout: 5000,
    });
    return;
  }

  try {
    loading.value = true;
    errorMessage.value = "";

    // Proceed with signup directly
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) throw error;

    registered.value = true; // Show verification message
  } catch (error) {
    console.error("Registration error:", error);
    errorMessage.value = error.message;

    // Check for duplicate email errors from Supabase
    if (
      error.message.includes("already registered") ||
      error.message.includes("already in use")
    ) {
      toast.add({
        title: "Email Already Registered",
        description:
          "This email address is already registered. Please sign in instead.",
        color: "amber",
        icon: "i-heroicons-information-circle",
        timeout: 7000,
        actions: [
          {
            label: "Sign In",
            click: () => {
              navigateTo("/login");
            },
            color: "white",
          },
        ],
      });
    } else {
      toast.add({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred",
        color: "red",
        icon: "i-heroicons-exclamation-circle",
        timeout: 5000,
      });
    }
  } finally {
    loading.value = false;
  }
};
</script>
