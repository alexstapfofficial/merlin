<script setup lang="ts"> 

const links = [{
  label: 'Docs',
  icon: 'i-heroicons-book-open',
  to: '/getting-started'
}, {
  label: 'Pro',
  icon: 'i-heroicons-square-3-stack-3d',
  to: '/pro'
}, {
  label: 'Releases',
  icon: 'i-heroicons-rocket-launch',
  to: '/releases'
}]
</script>

<template>
  <UHeader :links="links">
    <template #logo>
      <Logo  />
    </template>

    <template #panel>
      <UNavigationTree :links="links" />
    </template>
  </UHeader>
</template>

