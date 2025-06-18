<script setup lang="ts">
import { useHead } from 'nuxt/app';

// could also use this emoji 🎽 🏈

useHead({
  title: 'We tLove Footy',
  meta: [
    {
      name: 'description',
      content: 'Footy for all',
    },
  ],
  link: [
    {
      rel: 'icon',
      href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19"><text y="14" font-size="16">🏈</text></svg>',
    },
  ],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
