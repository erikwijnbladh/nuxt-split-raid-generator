<template>
  <NuxtLayout name="main">
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Page transition effects */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.1s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
