<script setup lang="ts">
const links = [
  { label: 'Home', to: '/', icon: 'i-heroicons-home' },
  { label: 'Horoskop', to: '/horoscope', icon: 'i-heroicons-star' },
  { label: 'Persönlichkeit', to: '/personality', icon: 'i-heroicons-user' },
  { label: 'Synastrie', to: '/synastry', icon: 'i-heroicons-heart' },
  { label: 'Transite', to: '/transits', icon: 'i-heroicons-calendar' },
  { label: 'Übersicht', to: '/overview', icon: 'i-heroicons-chart-bar' }
]
</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <nav class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Merlin
          </NuxtLink>

          <div class="hidden md:flex gap-1">
            <UButton
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              variant="ghost"
              :icon="link.icon"
              size="sm"
            >
              {{ link.label }}
            </UButton>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

