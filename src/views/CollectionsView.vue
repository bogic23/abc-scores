<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isLoading = ref(true)
const errorMessage = ref('')
const firestoreScores = ref([])

const sampleScores = [
  { id: 'sample-nocturne', title: 'Nocturne in E-flat', composer: 'Frédéric Chopin', category: 'PIANO · ROMANTIC', price: 24, image: 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=1000&auto=format&fit=crop', tag: 'Bestseller' },
  { id: 'sample-garden', title: 'The Quiet Garden', composer: 'Clara Schumann', category: 'PIANO · ORIGINAL EDITION', price: 32, image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop', tag: 'New edition' },
  { id: 'sample-reverie', title: 'A Winter Reverie', composer: 'Claude Debussy', category: 'ENSEMBLE · IMPRESSIONIST', price: 28, image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1000&auto=format&fit=crop', tag: 'Curator’s pick' },
  { id: 'sample-songs', title: 'Songs Without Words', composer: 'Felix Mendelssohn', category: 'PIANO · CLASSICAL', price: 21, image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1000&auto=format&fit=crop', tag: 'Rare find' },
]

const scores = computed(() => {
  if (!userStore.isFirebaseConfigured) return sampleScores
  return firestoreScores.value.map((score) => ({
    ...score,
    image: score.image || 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=1000&auto=format&fit=crop',
    tag: score.tag || 'Selected score',
  }))
})

async function loadScores() {
  isLoading.value = true
  errorMessage.value = ''
  if (!userStore.isFirebaseConfigured) {
    isLoading.value = false
    return
  }

  try {
    firestoreScores.value = await userStore.listScores()
  } catch (error) {
    console.error('Unable to load the score collection:', error)
    errorMessage.value = 'Scores could not be loaded right now. Please try again shortly.'
  } finally {
    isLoading.value = false
  }
}

function formattedPrice(price) {
  if (price === null || price === undefined || price === '') return 'View score'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(price))
}

onMounted(loadScores)
</script>

<template>
  <div class="min-h-[70vh]">
    <section class="border-b border-brand-dark/10 bg-[#efede6]">
      <div class="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <p class="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">The score room</p>
        <div class="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 class="font-serif text-4xl font-medium sm:text-5xl">Collected for the curious.</h1>
            <p class="mt-4 max-w-xl text-sm leading-6 text-brand-dark/60 sm:text-base">Discover expressive works, considered editions, and pieces that stay with you long after the final note.</p>
          </div>
          <p class="text-xs uppercase tracking-[0.14em] text-brand-dark/45">{{ scores.length }} selected scores</p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
      <div class="mb-7 flex items-center justify-between border-b border-brand-dark/10 pb-4">
        <p class="text-xs font-medium text-brand-dark/65">A small collection, thoughtfully chosen</p>
        <span class="text-[10px] uppercase tracking-[0.16em] text-brand-dark/40">Spring / Summer</span>
      </div>

      <p v-if="errorMessage" role="alert" class="mb-6 border border-red-800/15 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">{{ errorMessage }}</p>
      <p v-else-if="isLoading" class="py-12 text-center text-sm text-brand-dark/50">Finding your next favorite…</p>
      <div v-else-if="!scores.length" class="border border-dashed border-brand-gold/40 bg-white px-6 py-16 text-center">
        <p class="font-serif text-2xl">A new collection is on its way.</p>
        <p class="mt-3 text-sm text-brand-dark/55">Please check back soon for our latest sheet music.</p>
      </div>

      <div v-else class="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="score in scores" :key="score.id" class="group">
          <a v-if="score.driveUrl" :href="score.driveUrl" target="_blank" rel="noopener noreferrer" :aria-label="`Open ${score.title} by ${score.composer || 'unknown composer'} PDF`" class="block">
            <div class="relative aspect-[4/4.7] overflow-hidden bg-[#e9e3d7]">
              <img :src="score.image" :alt="`${score.title} sheet music`" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">
              <span class="absolute left-3 top-3 bg-brand-cream/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-brand-dark">{{ score.tag }}</span>
              <span class="absolute bottom-3 right-3 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-brand-cream text-brand-dark opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">↗</span>
            </div>
            <div class="flex items-start justify-between gap-3 pt-4">
              <div>
                <p class="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-brand-gold">{{ score.category }}</p>
                <h2 class="font-serif text-lg transition-colors group-hover:text-brand-gold">{{ score.title }}</h2>
                <p class="mt-1 text-xs text-brand-dark/55">{{ score.composer }}</p>
              </div>
              <span class="pt-1 text-sm font-medium">{{ formattedPrice(score.price) }}</span>
            </div>
          </a>
          <div v-else>
            <div class="relative aspect-[4/4.7] overflow-hidden bg-[#e9e3d7]">
              <img :src="score.image" :alt="`${score.title} sheet music`" class="h-full w-full object-cover">
              <span class="absolute left-3 top-3 bg-brand-cream/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-brand-dark">{{ score.tag }}</span>
            </div>
            <div class="flex items-start justify-between gap-3 pt-4">
              <div>
                <p class="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-brand-gold">{{ score.category }}</p>
                <h2 class="font-serif text-lg">{{ score.title }}</h2>
                <p class="mt-1 text-xs text-brand-dark/55">{{ score.composer }}</p>
              </div>
              <span class="pt-1 text-sm font-medium">{{ formattedPrice(score.price) }}</span>
            </div>
          </div>
        </article>
      </div>

      <div class="mt-14 border-t border-brand-dark/10 pt-6 text-center">
        <p class="font-serif text-xl italic text-brand-dark/60">The right piece can change the whole room.</p>
      </div>
    </section>
  </div>
</template>
