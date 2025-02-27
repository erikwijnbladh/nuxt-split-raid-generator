<template>
  <div>
    <h1 class="text-2xl font-bold mb-6 text-white">WoW Data Management</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-user-group" class="text-xl mr-2" />
            <h2 class="text-lg font-semibold">Classes & Specs</h2>
          </div>
        </template>

        <p class="text-gray-400 mb-4">
          Manage WoW classes and specializations.
        </p>

        <div class="flex flex-col space-y-3 mt-4">
          <UButton to="/admin/wow-data/classes" color="primary" block>
            Manage Classes
          </UButton>
          <UButton to="/admin/wow-data/specs" color="primary" block>
            Manage Specs
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-queue-list" class="text-xl mr-2" />
            <h2 class="text-lg font-semibold">Armor Tokens</h2>
          </div>
        </template>

        <p class="text-gray-400 mb-4">
          Manage armor tokens and class assignments.
        </p>

        <UButton to="/admin/wow-data/armor-tokens" color="primary" block>
          Manage Armor Tokens
        </UButton>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center">
            <UIcon name="i-heroicons-sparkles" class="text-xl mr-2" />
            <h2 class="text-lg font-semibold">Buffs & Debuffs</h2>
          </div>
        </template>

        <p class="text-gray-400 mb-4">
          Manage raid buffs, debuffs and their providers.
        </p>

        <UButton to="/admin/wow-data/buffs" color="primary" block>
          Manage Buffs & Debuffs
        </UButton>
      </UCard>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});
</script>
