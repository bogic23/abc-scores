<script setup>
import defaultAvatar from '@/assets/default-avatar.svg'
import { useUserStore } from '@/stores/user'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()
const isProfileOpen = ref(false)
const isMenuOpen = ref(false)

function useDefaultAvatar(event) {
  if (event.currentTarget.getAttribute('src') !== defaultAvatar) {
    event.currentTarget.src = defaultAvatar
  }
}

watch(() => route.fullPath, () => {
  isMenuOpen.value = false
  isProfileOpen.value = false
})

async function handleLogout() {
  const didLogout = await userStore.logout()
  if (didLogout) isMenuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-brand-dark/10 bg-brand-cream/90 text-brand-dark backdrop-blur-xl">
    <nav aria-label="Main navigation" class="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
      <router-link to="/" class="group flex items-center gap-3" aria-label="ABC Scores home">
        <span class="grid h-10 w-10 place-items-center rounded-full border border-brand-gold/60 font-serif text-lg text-brand-gold transition-colors group-hover:bg-brand-dark group-hover:text-brand-cream">A</span>
        <span class="font-serif text-lg font-semibold tracking-[0.13em]">ABC <span class="font-normal">SCORES</span></span>
      </router-link>

      <div class="hidden items-center gap-9 md:flex">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/collections" class="nav-link">Collections</router-link>
        <router-link to="/library" class="nav-link">My Library</router-link>
        <router-link to="/about" class="nav-link">Our Story</router-link>
        <router-link v-if="userStore.isAdmin" to="/admin" class="nav-link">Admin</router-link>
      </div>

      <div class="flex items-center gap-3">
        <div v-if="userStore.isLoggedIn && userStore.user" class="relative hidden sm:block">
          <button
            type="button"
            class="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-brand-dark/5 focus-visible:outline-brand-gold"
            :aria-expanded="isProfileOpen"
            aria-label="Open profile menu"
            @click="isProfileOpen = !isProfileOpen"
          >
            <img
              :src="userStore.user.photoURL || userStore.authUser?.photoURL || defaultAvatar"
              :alt="`${userStore.user.name} profile picture`"
              class="h-9 w-9 rounded-full border border-brand-gold/50 object-cover"
              @error="useDefaultAvatar"
            >
            <span class="text-sm font-medium">{{ userStore.user.name.split(' ')[0] }}</span>
            <svg class="h-3 w-3 text-brand-dark/50 transition-transform" :class="{ 'rotate-180': isProfileOpen }" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2 4 4 4 4-4" stroke="currentColor" stroke-width="1.5" /></svg>
          </button>
          <div v-if="isProfileOpen" class="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-xl border border-brand-dark/10 bg-white py-2 shadow-xl shadow-brand-dark/10">
            <div class="border-b border-brand-dark/10 px-4 py-3">
              <p class="text-sm font-semibold">{{ userStore.user.name }}</p>
              <p class="mt-0.5 text-xs capitalize text-brand-dark/55">{{ userStore.user.role }} account</p>
            </div>
            <router-link to="/library" class="block px-4 py-2.5 text-sm transition-colors hover:bg-brand-cream">My Library</router-link>
            <button type="button" class="w-full px-4 py-2.5 text-left text-sm text-red-700 transition-colors hover:bg-red-50" @click="handleLogout(); isProfileOpen = false">Sign Out</button>
          </div>
        </div>
        <router-link v-else to="/login" class="hidden rounded-full bg-brand-dark px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-cream transition-all hover:bg-brand-gold hover:text-brand-dark sm:inline-flex">Sign in</router-link>

        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-full border border-brand-dark/10 transition-colors hover:border-brand-gold md:hidden"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-navigation"
          :aria-label="isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
          @click="isMenuOpen = !isMenuOpen"
        >
          <svg v-if="!isMenuOpen" class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
          <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
        </button>
      </div>
    </nav>

    <nav v-if="isMenuOpen" id="mobile-navigation" aria-label="Mobile navigation" class="border-t border-brand-dark/10 bg-brand-cream px-5 py-4 md:hidden">
      <div class="mx-auto flex max-w-7xl flex-col">
        <router-link to="/" class="mobile-nav-link">Home</router-link>
        <router-link to="/collections" class="mobile-nav-link">Collections</router-link>
        <router-link to="/library" class="mobile-nav-link">My Library</router-link>
        <router-link to="/about" class="mobile-nav-link">Our Story</router-link>
        <router-link v-if="userStore.isAdmin" to="/admin" class="mobile-nav-link">Admin Dashboard</router-link>
        <div v-if="userStore.isLoggedIn && userStore.user" class="mt-4 flex items-center justify-between border-t border-brand-dark/10 pt-4">
          <div>
            <p class="text-sm font-semibold">{{ userStore.user.name }}</p>
            <p class="mt-1 text-xs capitalize text-brand-dark/50">{{ userStore.user.role }} account</p>
          </div>
          <button type="button" class="text-xs font-semibold text-red-700" @click="handleLogout">Sign Out</button>
        </div>
        <router-link v-else to="/login" class="mt-3 rounded-full bg-brand-dark px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-brand-cream">Sign in / Register</router-link>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.nav-link {
  position: relative;
  padding: 8px 0;
  color: rgb(23 33 30 / 68%);
  font-size: 0.84rem;
  transition: color 180ms ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #17211e;
}

.nav-link::after {
  position: absolute;
  right: 0;
  bottom: 2px;
  left: 0;
  height: 1px;
  background: #bd9a62;
  content: "";
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 180ms ease;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  transform: scaleX(1);
}

.mobile-nav-link {
  border-bottom: 1px solid rgb(23 33 30 / 8%);
  padding: 14px 2px;
  color: rgb(23 33 30 / 76%);
  font-size: 0.95rem;
}
</style>
