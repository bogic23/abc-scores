<!-- src/App.vue -->
<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <main class="flex-grow">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <footer class="border-t border-white/10 bg-brand-dark text-brand-cream">
      <div class="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <router-link to="/" class="font-serif text-sm tracking-[0.12em] text-brand-cream/85">ABC <span class="text-brand-gold">SCORES</span></router-link>
        <p class="text-xs text-brand-cream/45">&copy; 2026 ABC Scores. Made for the love of music.</p>
        <router-link to="/about" class="text-xs text-brand-cream/60 transition-colors hover:text-brand-gold">A little about us <span aria-hidden="true">↗</span></router-link>
      </div>
    </footer>
  </div>
</template>