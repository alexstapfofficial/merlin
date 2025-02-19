<script setup lang="ts">
import NavigationHeader from './components/NavigationHeader.vue';
</script>

<template>
  <NavigationHeader />

  <UMain>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UMain>

  <UFooter />
</template>