<script setup>
const scores = [
  { title: 'Nocturne in E-flat', composer: 'Frédéric Chopin', category: 'PIANO · ROMANTIC', price: '$24', image: 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=1000&auto=format&fit=crop', tag: 'Bestseller' },
  { title: 'The Quiet Garden', composer: 'Clara Schumann', category: 'PIANO · ORIGINAL EDITION', price: '$32', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop', tag: 'New edition' },
  { title: 'A Winter Reverie', composer: 'Claude Debussy', category: 'ENSEMBLE · IMPRESSIONIST', price: '$28', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1000&auto=format&fit=crop', tag: 'Curator’s pick' },
  { title: 'Songs Without Words', composer: 'Felix Mendelssohn', category: 'PIANO · CLASSICAL', price: '$21', image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1000&auto=format&fit=crop', tag: 'Rare find' },
]
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
      <div class="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="score in scores" :key="score.title" class="group">
          <router-link to="/library" :aria-label="`View ${score.title} by ${score.composer}`" class="block">
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
              <span class="pt-1 text-sm font-medium">{{ score.price }}</span>
            </div>
          </router-link>
        </article>
      </div>
      <div class="mt-14 border-t border-brand-dark/10 pt-6 text-center">
        <p class="font-serif text-xl italic text-brand-dark/60">The right piece can change the whole room.</p>
      </div>
    </section>
  </div>
</template>
