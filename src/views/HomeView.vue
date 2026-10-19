<script setup>
const highlights = [
  { number: '01', title: 'Curated with care', text: 'Every edition chosen for its musicality, quality, and story.' },
  { number: '02', title: 'Made to be played', text: 'Thoughtful, readable scores for the moments that matter.' },
  { number: '03', title: 'A lifetime of music', text: 'Build a personal library you will return to, again and again.' },
]

const featuredScores = [
  {
    title: 'Nocturne in E-flat',
    composer: 'Frédéric Chopin',
    image: 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=1000&auto=format&fit=crop',
    label: 'Piano · Romantic',
  },
  {
    title: 'The Quiet Garden',
    composer: 'Clara Schumann',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1000&auto=format&fit=crop',
    label: 'Piano · Original edition',
  },
  {
    title: 'A Winter Reverie',
    composer: 'Claude Debussy',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1000&auto=format&fit=crop',
    label: 'Ensemble · Impressionist',
  },
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden bg-brand-dark text-brand-cream">
      <div class="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full border border-brand-gold/10"></div>
      <div class="pointer-events-none absolute -left-24 top-26 h-64 w-64 rounded-full border border-brand-gold/10"></div>
      <div class="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.05fr_.95fr] md:py-20">
        <div class="relative z-10 max-w-2xl">
          <p class="reveal-up mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-gold">
            <span class="h-px w-9 bg-brand-gold"></span>
            A considered collection of sheet music
          </p>
          <h1 class="reveal-up reveal-delay-1 font-serif text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-[76px]">
            Let the music<br>
            <span class="italic text-brand-gold">find its way</span><br>
            to you.
          </h1>
          <p class="reveal-up reveal-delay-2 mt-7 max-w-lg text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
            Rare editions, enduring compositions, and new discoveries — selected for the joy of playing.
          </p>
          <div class="reveal-up reveal-delay-2 mt-9 flex flex-wrap items-center gap-5">
            <router-link to="/collections" class="group inline-flex items-center gap-4 rounded-full bg-brand-gold px-7 py-4 text-xs font-bold uppercase tracking-[0.12em] text-brand-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-cream">
              Explore the collection
              <span aria-hidden="true" class="transition-transform group-hover:translate-x-1">→</span>
            </router-link>
            <router-link to="/about" class="text-sm text-white/65 transition-colors hover:text-brand-gold">Our story <span aria-hidden="true">↗</span></router-link>
          </div>
          <div class="mt-14 flex items-center gap-5 border-t border-white/10 pt-6">
            <div class="flex -space-x-2" aria-hidden="true">
              <span class="grid h-9 w-9 place-items-center rounded-full border-2 border-brand-dark bg-[#d8c6ad] font-serif text-xs text-brand-dark">♬</span>
              <span class="grid h-9 w-9 place-items-center rounded-full border-2 border-brand-dark bg-[#9caa9c] font-serif text-xs text-brand-dark">♪</span>
              <span class="grid h-9 w-9 place-items-center rounded-full border-2 border-brand-dark bg-[#c2a37d] font-serif text-xs text-brand-dark">♫</span>
            </div>
            <p class="text-xs leading-5 text-white/55"><span class="font-semibold text-white">For musicians, by music lovers.</span><br>Every score has a story worth playing.</p>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-[500px] py-5 md:ml-auto">
          <div class="absolute -right-3 top-0 h-[86%] w-[82%] border border-brand-gold/40 sm:-right-5"></div>
          <div class="relative mr-4 overflow-hidden sm:mr-6">
            <img
              src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1300&auto=format&fit=crop"
              alt="A pianist performing beneath warm stage lights"
              class="h-[390px] w-full object-cover object-center transition-transform duration-1000 hover:scale-[1.03] sm:h-[490px]"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-brand-dark/65 via-transparent to-brand-dark/10"></div>
            <div class="absolute bottom-7 left-7 text-brand-cream">
              <p class="text-[10px] uppercase tracking-[0.22em] text-brand-gold">The listening room</p>
              <p class="mt-2 font-serif text-2xl">Find your next favorite.</p>
            </div>
          </div>
          <div class="absolute -bottom-1 right-0 rounded-sm border border-brand-gold/30 bg-brand-cream px-5 py-4 text-brand-dark shadow-xl sm:right-0 sm:px-7">
            <p class="font-serif text-2xl text-brand-gold">Est. 2024</p>
            <p class="mt-1 text-[9px] uppercase tracking-[0.18em] text-brand-dark/60">A life in music</p>
          </div>
          <span class="absolute -left-2 bottom-12 hidden font-serif text-5xl text-brand-gold/70 md:block" aria-hidden="true">𝄞</span>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-24">
      <div class="mb-11 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">Picked for you</p>
          <h2 class="font-serif text-3xl font-medium sm:text-4xl">A few notes to begin.</h2>
        </div>
        <router-link to="/collections" class="group inline-flex items-center gap-2 text-sm font-medium text-brand-dark/70 transition-colors hover:text-brand-gold">
          View all scores <span class="transition-transform group-hover:translate-x-1">→</span>
        </router-link>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="(score, index) in featuredScores" :key="score.title" class="group overflow-hidden rounded-sm border border-brand-dark/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-dark/10" :class="{ 'sm:hidden lg:block': index === 2 }">
          <router-link to="/collections" class="block">
            <div class="relative h-64 overflow-hidden bg-[#e9e3d7]">
              <img :src="score.image" :alt="`${score.title} sheet music collection`" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">
              <span class="absolute left-4 top-4 bg-brand-cream/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-dark">Editor's choice</span>
            </div>
            <div class="flex items-end justify-between gap-3 p-5">
              <div>
                <p class="mb-2 text-[9px] uppercase tracking-[0.16em] text-brand-gold">{{ score.label }}</p>
                <h3 class="font-serif text-xl">{{ score.title }}</h3>
                <p class="mt-1 text-xs text-brand-dark/55">{{ score.composer }}</p>
              </div>
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand-dark/15 text-brand-dark transition-all group-hover:border-brand-dark group-hover:bg-brand-dark group-hover:text-brand-cream" aria-hidden="true">↗</span>
            </div>
          </router-link>
        </article>
      </div>
    </section>

    <section class="border-y border-brand-dark/10 bg-[#efede6]">
      <div class="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-3 md:gap-12 md:py-16">
        <div v-for="item in highlights" :key="item.number" class="flex gap-5">
          <span class="pt-1 font-serif text-sm text-brand-gold">{{ item.number }}</span>
          <div>
            <h3 class="font-serif text-lg">{{ item.title }}</h3>
            <p class="mt-2 max-w-xs text-sm leading-6 text-brand-dark/60">{{ item.text }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
