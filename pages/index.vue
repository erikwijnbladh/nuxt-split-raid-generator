<template>
  <div>
    <div class="text-center py-20">
      <h1 class="text-4xl font-bold mb-4 text-white">Welcome</h1>
      <p class="text-lg text-gray-300 mb-8">
        Sign in to access your splits and roster or create a new account
      </p>
      <div class="flex justify-center gap-4">
        <UButton to="/login" color="primary">Sign In</UButton>
        <UButton to="/register" variant="outline">Create Account</UButton>
      </div>
    </div>
  </div>
</template>
