<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isLoading = ref(true)
const errorMessage = ref('')
const firestoreScores = ref([])
const requestingScore = ref(null)
const requesterName = ref('')
const requesterEmail = ref('')
const requestError = ref('')
const requestSuccess = ref('')
const isSubmittingRequest = ref(false)
const previewingScore = ref(null)

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

function driveFileId(score) {
  if (!score.driveUrl) return ''

  try {
    const url = new URL(score.driveUrl)
    if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com' || url.port || url.username || url.password) return ''
    const match = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/|$)/)
    return match?.[1] || ''
  } catch {
    return ''
  }
}

const previewUrl = computed(() => {
  const fileId = previewingScore.value && driveFileId(previewingScore.value)
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview?rm=minimal` : ''
})

function openPreview(score) {
  if (driveFileId(score)) previewingScore.value = score
}

function openLicenseRequest(score) {
  if (!userStore.isFirebaseConfigured) {
    requestError.value = 'License requests are unavailable until Firebase is configured.'
    return
  }
  requestSuccess.value = ''
  requestError.value = ''
  requestingScore.value = score
  requesterName.value = userStore.user?.name || userStore.authUser?.displayName || ''
  requesterEmail.value = userStore.user?.email || userStore.authUser?.email || ''
}

function closeLicenseRequest() {
  if (isSubmittingRequest.value) return
  requestingScore.value = null
  requestError.value = ''
}

async function submitLicenseRequest() {
  if (!requestingScore.value) return
  requestError.value = ''
  requestSuccess.value = ''
  isSubmittingRequest.value = true
  try {
    await userStore.createLicenseRequest({
      scoreId: requestingScore.value.id,
      scoreTitle: requestingScore.value.title,
      requesterName: requesterName.value,
      requesterEmail: requesterEmail.value,
    })
    requestSuccess.value = `Your license request for “${requestingScore.value.title}” has been sent to our team.`
    requestingScore.value = null
  } catch (error) {
    console.error('Unable to submit license request:', error)
    requestError.value = error.message || 'Your license request could not be sent. Please try again.'
  } finally {
    isSubmittingRequest.value = false
  }
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
      <p v-if="requestError && !requestingScore" role="alert" class="mb-6 border border-red-800/15 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">{{ requestError }}</p>
      <p v-if="requestSuccess" role="status" class="mb-6 border border-emerald-800/15 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-900">{{ requestSuccess }}</p>
      <p v-if="isLoading" class="py-12 text-center text-sm text-brand-dark/50">Finding your next favorite…</p>
      <div v-if="!isLoading && !errorMessage && !scores.length" class="border border-dashed border-brand-gold/40 bg-white px-6 py-16 text-center">
        <p class="font-serif text-2xl">A new collection is on its way.</p>
        <p class="mt-3 text-sm text-brand-dark/55">Please check back soon for our latest sheet music.</p>
      </div>

      <div v-if="!isLoading && !errorMessage && scores.length" class="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        <article v-for="score in scores" :key="score.id" class="group">
          <div class="relative aspect-[4/4.7] overflow-hidden bg-[#e9e3d7]">
            <img :src="score.image" :alt="`${score.title} sheet music`" class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105">
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
          <button
            v-if="driveFileId(score)"
            type="button"
            class="mt-3 inline-block text-xs font-medium text-brand-gold underline underline-offset-4 hover:text-brand-dark"
            :aria-label="`Preview ${score.title} by ${score.composer || 'unknown composer'} PDF`"
            @click="openPreview(score)"
          >Preview score PDF</button>
          <button
            type="button"
            class="mt-4 w-full rounded-full border border-brand-dark/15 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors hover:border-brand-gold hover:bg-brand-gold hover:text-brand-dark"
            @click="openLicenseRequest(score)"
          >Request a license</button>
        </article>
      </div>

      <div class="mt-14 border-t border-brand-dark/10 pt-6 text-center">
        <p class="font-serif text-xl italic text-brand-dark/60">The right piece can change the whole room.</p>
      </div>
    </section>

    <div v-if="previewingScore" class="fixed inset-0 z-50 grid place-items-center bg-brand-dark/80 p-3 sm:p-6" @click.self="previewingScore = null">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-preview-title"
        class="flex max-h-[94vh] w-full max-w-5xl flex-col border border-brand-dark/10 bg-brand-cream p-4 shadow-2xl sm:p-6"
      >
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">Google Drive preview</p>
            <h2 id="score-preview-title" class="mt-1 font-serif text-xl">{{ previewingScore.title }}</h2>
          </div>
          <button type="button" aria-label="Close PDF preview" class="text-2xl leading-none text-brand-dark/60 hover:text-brand-dark" @click="previewingScore = null">×</button>
        </div>
        <div class="h-[72vh] overflow-hidden bg-white">
          <iframe
            :src="previewUrl"
            :title="`PDF preview of ${previewingScore.title}`"
            class="h-full w-full pointer-events-none select-none"
            scrolling="no"
            tabindex="-1"
            referrerpolicy="no-referrer"
          ></iframe>
        </div>
        <p class="mt-3 text-xs leading-5 text-brand-dark/55">Preview controls and scrolling are disabled. Screen capture cannot be prevented in a web browser.</p>
      </section>
    </div>

    <div v-if="requestingScore" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-brand-dark/60 p-4" @click.self="closeLicenseRequest">
      <section role="dialog" aria-modal="true" aria-labelledby="license-request-title" class="my-8 w-full max-w-lg border border-brand-dark/10 bg-brand-cream p-6 shadow-2xl sm:p-8">
        <div class="mb-6 flex items-start justify-between gap-4">
          <div>
            <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">License request</p>
            <h2 id="license-request-title" class="font-serif text-2xl">Request “{{ requestingScore.title }}”</h2>
            <p class="mt-2 text-sm text-brand-dark/55">Our team will review your request and contact you by email.</p>
          </div>
          <button type="button" aria-label="Close license request" class="text-xl text-brand-dark/50 hover:text-brand-dark" :disabled="isSubmittingRequest" @click="closeLicenseRequest">×</button>
        </div>

        <p v-if="requestError" role="alert" class="mb-5 border border-red-800/15 bg-red-50 px-4 py-3 text-sm text-red-800">{{ requestError }}</p>

        <form @submit.prevent="submitLicenseRequest">
          <template v-if="userStore.isLoggedIn">
            <p class="mb-4 border border-brand-dark/10 bg-white px-4 py-3 text-sm leading-6">
              <span class="block font-medium">{{ requesterName }}</span>
              <span class="text-brand-dark/55">{{ requesterEmail }}</span>
            </p>
          </template>
          <template v-else>
            <label for="license-requester-name" class="mb-2 block text-xs font-semibold text-brand-dark/75">Your name</label>
            <input id="license-requester-name" v-model="requesterName" required maxlength="100" autocomplete="name" class="mb-4 w-full border border-brand-dark/15 bg-white px-3 py-3 text-sm outline-none focus:border-brand-gold">
            <label for="license-requester-email" class="mb-2 block text-xs font-semibold text-brand-dark/75">Email address</label>
            <input id="license-requester-email" v-model="requesterEmail" required maxlength="254" type="email" autocomplete="email" class="mb-4 w-full border border-brand-dark/15 bg-white px-3 py-3 text-sm outline-none focus:border-brand-gold">
          </template>
          <button type="submit" :disabled="isSubmittingRequest" class="w-full rounded-full bg-brand-dark px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-cream transition-colors hover:bg-brand-gold hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
            {{ isSubmittingRequest ? 'Sending request…' : 'Send license request' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>
