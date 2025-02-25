<template>
  <div class="max-w-md mx-auto py-12 text-center">
    <template v-if="loading">
      <USkeleton class="h-32 w-full" />
    </template>
    <template v-else-if="error">
      <UCard>
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="text-5xl text-red-500 mb-4"
        />
        <h1 class="text-2xl font-bold mb-2">Verification Failed</h1>
        <p class="text-gray-300 mb-4">{{ error }}</p>
        <UButton to="/login" color="primary">Back to Login</UButton>
      </UCard>
    </template>
    <template v-else>
      <UCard>
        <UIcon
          name="i-heroicons-check-circle"
          class="text-5xl text-green-500 mb-4"
        />
        <h1 class="text-2xl font-bold mb-2">Email Verified!</h1>
        <p class="text-gray-300 mb-4">
          Your email has been successfully verified.
        </p>
        <UButton to="/splits" color="primary">Go to Splits Dashboard</UButton>
      </UCard>
    </template>
  </div>
</template>

<script setup>
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const route = useRoute();
    // Wait a moment for Supabase auth to complete the verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
});
</script>
