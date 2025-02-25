<template>
  <UButton
    color="gray"
    variant="ghost"
    :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
    aria-label="Toggle color mode"
    @click="toggleColorMode"
  />
</template>

<script setup>
const colorMode = useColorMode();

function toggleColorMode() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>
