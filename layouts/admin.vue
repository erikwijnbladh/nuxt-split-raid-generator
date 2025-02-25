<template>
  <div>
    <header class="bg-gray-900 text-white shadow">
      <UContainer>
        <div class="flex items-center justify-between py-4">
          <h1 class="text-xl font-bold">WoW Raid Admin</h1>
          <div class="flex items-center gap-4">
            <UButton to="/admin" color="white" variant="ghost"
              >Dashboard</UButton
            >
            <UButton to="/admin/users" color="white" variant="ghost"
              >User Management</UButton
            >
            <UButton to="/admin/wow-data" color="white" variant="ghost"
              >WoW Data</UButton
            >
            <UButton to="/dashboard" color="white" variant="ghost"
              >Back to App</UButton
            >
          </div>
        </div>
      </UContainer>
    </header>

    <UContainer class="py-8">
      <slot />
    </UContainer>
  </div>
</template>

<script setup>
// Remove the middleware definition from here
</script>
