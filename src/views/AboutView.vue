<template>
  <div>
    <section class="bg-brand-dark text-brand-cream">
      <div class="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1fr_.8fr] md:py-24">
        <div>
          <p class="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">A note from us</p>
          <h1 class="max-w-xl font-serif text-4xl font-medium leading-tight sm:text-5xl md:text-6xl">Keeping the art of music <span class="italic text-brand-gold">close.</span></h1>
        </div>
        <p class="max-w-lg text-sm leading-7 text-white/65 sm:text-base sm:leading-8">We believe a score is more than notes on a page. It is an invitation — to listen closely, to practice patiently, and to make something entirely your own.</p>
      </div>
    </section>
    <section class="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-2 md:gap-20 md:py-24">
      <div class="relative min-h-[300px] overflow-hidden bg-[#e9e3d7] md:min-h-[440px]">
        <img src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop" alt="A musician's hands at a piano" class="absolute inset-0 h-full w-full object-cover">
        <div class="absolute inset-0 bg-brand-dark/10"></div>
        <p class="absolute bottom-5 left-5 bg-brand-cream/95 px-4 py-2 font-serif text-sm italic text-brand-dark">For the love of the lasting note.</p>
      </div>
      <div class="flex flex-col justify-center">
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">Our story</p>
        <h2 class="font-serif text-3xl font-medium sm:text-4xl">A more thoughtful way to collect.</h2>
        <p class="mt-6 text-sm leading-7 text-brand-dark/65">Founded in 2024, ABC Scores is dedicated to preserving the art of sheet music in a digital age. We believe the tactile experience of reading notes from a page should never be lost.</p>
        <p class="mt-4 text-sm leading-7 text-brand-dark/65">Our curators seek out beautifully prepared editions and work with modern composers to bring new voices to your music stand. Each selection is chosen with the player in mind — clear, considered, and made to be played.</p>
        <router-link to="/collections" class="group mt-8 inline-flex w-fit items-center gap-3 border-b border-brand-gold pb-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:text-brand-gold">Discover the collection <span class="transition-transform group-hover:translate-x-1">→</span></router-link>
      </div>
    </section>
  </div>
</template>
