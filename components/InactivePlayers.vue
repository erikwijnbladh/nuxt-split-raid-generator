<template>
  <div class="flex items-center" v-if="inactivePlayers.length > 0">
    <UTooltip>
      <div class="max-w-xs">
        <p class="text-sm mb-2">
          The following players are inactive and their characters will be
          excluded from splits:
        </p>
        <ul class="text-xs list-disc pl-4">
          <li v-for="player in inactivePlayers" :key="player.id">
            {{ player.name }}
          </li>
        </ul>
        <UButton size="xs" color="primary" class="mt-2" to="/roster">
          Manage Players
        </UButton>
      </div>
      <template #popper>
        <UButton
          size="xs"
          color="gray"
          variant="soft"
          icon="i-heroicons-information-circle"
        >
          Inactive players info
        </UButton>
      </template>
    </UTooltip>
  </div>
</template>

<script setup>
defineProps({
  inactivePlayers: {
    type: Array,
    required: true,
  },
});
</script>
