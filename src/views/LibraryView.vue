<template>
  <section class="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
    <div class="mb-10 flex flex-col justify-between gap-5 border-b border-brand-dark/10 pb-8 sm:flex-row sm:items-end">
      <div>
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">Your personal collection</p>
        <h1 class="font-serif text-4xl font-medium sm:text-5xl">My Library</h1>
      </div>
      <p class="max-w-xs text-sm leading-6 text-brand-dark/55">A home for the music you love, ready whenever you are.</p>
    </div>

    <div class="relative overflow-hidden border border-brand-dark/10 bg-white px-6 py-16 text-center sm:px-12 sm:py-24">
      <div class="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border border-brand-gold/15"></div>
      <div class="pointer-events-none absolute -right-8 -top-16 h-48 w-48 rounded-full border border-brand-gold/15"></div>
      <div class="relative mx-auto max-w-md">
        <span class="mx-auto grid h-16 w-16 place-items-center rounded-full border border-brand-gold/40 font-serif text-3xl text-brand-gold" aria-hidden="true">𝄞</span>
        <p class="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gold">A little room to grow</p>
        <h2 class="mt-3 font-serif text-2xl sm:text-3xl">Your next favorite is out there.</h2>
        <p class="mt-3 text-sm leading-6 text-brand-dark/55">Purchased sheet music will find its home here. Start with a piece that speaks to you.</p>
        <router-link to="/collections" class="group mt-7 inline-flex items-center gap-3 rounded-full bg-brand-dark px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-cream transition-all hover:-translate-y-0.5 hover:bg-brand-gold hover:text-brand-dark">
          Browse the collection <span aria-hidden="true" class="transition-transform group-hover:translate-x-1">→</span>
        </router-link>
      </div>
    </div>
  </section>
</template>
