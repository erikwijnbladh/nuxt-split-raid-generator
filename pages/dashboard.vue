<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 dark:text-white">
      Welcome to Your Dashboard
    </h1>

    <UCard>
      <div v-if="user" class="p-4">
        <h2 class="text-lg font-semibold mb-2 dark:text-white">Your Account</h2>
        <p class="text-gray-600 dark:text-gray-300">Email: {{ user.email }}</p>
        <p class="text-gray-600 dark:text-gray-300">User ID: {{ user.id }}</p>
      </div>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});

const user = useSupabaseUser();
</script>
