<script setup lang="ts">
import NavigationHeader from './components/NavigationHeader.vue';
</script>

<template>
  <div>
    <NavigationHeader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>