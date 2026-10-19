<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isRegister = computed(() => route.name === 'register')
const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

watch(isRegister, () => {
  errorMessage.value = ''
  password.value = ''
  confirmPassword.value = ''
})

function authErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'An account already exists for this email. Sign in instead.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Sign in using your original method.',
    'auth/invalid-credential': 'That email and password combination could not be verified.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in your Firebase Console.',
    'auth/invalid-oauth-client-id': 'The Google OAuth client ID is invalid. Check the Google provider Web SDK configuration in Firebase Console.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow popups and try again.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed before completion.',
    'auth/unauthorized-domain': 'This domain is not authorized for Firebase sign-in. Add it in your Firebase Authentication settings.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/user-disabled': 'This account is currently disabled. Please contact support.',
    'auth/weak-password': 'Choose a stronger password with at least 6 characters.',
    'auth/network-request-failed': 'A network error interrupted the request. Check your connection and retry.',
  }

  return messages[error.code] || (isRegister.value
    ? 'We could not create your account. Please check your details and try again.'
    : 'We could not sign you in. Check your details and try again.')
}

async function finishSignIn() {
  const redirect = route.query.redirect
  const safeRedirect = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/library'
  await router.replace(safeRedirect)
}

async function submitForm() {
  errorMessage.value = ''

  if (isRegister.value && password.value !== confirmPassword.value) {
    errorMessage.value = 'Your passwords do not match.'
    return
  }

  if (isRegister.value && !displayName.value.trim()) {
    errorMessage.value = 'Enter your name to create an account.'
    return
  }

  isSubmitting.value = true
  try {
    if (isRegister.value) {
      await userStore.register(displayName.value.trim(), email.value.trim(), password.value)
    } else {
      await userStore.login(email.value.trim(), password.value)
    }

    await finishSignIn()
  } catch (error) {
    console.error('Firebase authentication failed:', error)
    errorMessage.value = authErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

async function submitGoogle() {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await userStore.loginWithGoogle()
    await finishSignIn()
  } catch (error) {
    console.error('Google authentication failed:', error)
    errorMessage.value = error.code === 'auth/operation-not-allowed'
      ? 'Google sign-in is not enabled. In Firebase Console, enable the Google provider and configure its Web SDK OAuth client ID.'
      : authErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto grid min-h-[calc(100vh-160px)] max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_.9fr] md:gap-16 md:py-16">
    <section class="relative hidden min-h-[590px] overflow-hidden bg-brand-dark text-brand-cream md:block">
      <img src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1300&auto=format&fit=crop" alt="A pianist performing beneath warm stage lights" class="absolute inset-0 h-full w-full object-cover opacity-45">
      <div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/35 to-brand-dark/10"></div>
      <div class="absolute left-10 top-10 flex items-center gap-3">
        <span class="grid h-10 w-10 place-items-center rounded-full border border-brand-gold/70 font-serif text-lg text-brand-gold">A</span>
        <span class="font-serif text-sm tracking-[0.16em]">ABC SCORES</span>
      </div>
      <div class="absolute bottom-12 left-10 right-10">
        <p class="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">Your music, beautifully kept</p>
        <h1 class="max-w-lg font-serif text-4xl leading-tight lg:text-5xl">A place for the pieces that stay with you.</h1>
        <p class="mt-5 max-w-md text-sm leading-7 text-white/70">Sign in to return to your library, or create an account and begin collecting.</p>
        <div class="mt-8 flex items-center gap-3 text-xs text-white/65">
          <span class="h-px w-8 bg-brand-gold"></span>
          Curated for the joy of playing
        </div>
      </div>
      <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-brand-gold/20"></div>
      <div class="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-brand-gold/20"></div>
    </section>

    <section class="mx-auto w-full max-w-md py-5">
      <router-link to="/" class="mb-10 inline-flex items-center gap-2 text-xs text-brand-dark/55 transition-colors hover:text-brand-gold md:hidden">
        <span aria-hidden="true">←</span> Back to ABC Scores
      </router-link>
      <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">{{ isRegister ? 'Begin your collection' : 'Welcome back' }}</p>
      <h2 class="font-serif text-4xl font-medium">{{ isRegister ? 'Create an account.' : 'Good to have you back.' }}</h2>
      <p class="mt-3 text-sm leading-6 text-brand-dark/55">
        {{ isRegister ? 'Save your favorite scores and keep your music close.' : 'Sign in to pick up where the music left off.' }}
      </p>

      <div v-if="!userStore.isFirebaseConfigured" role="alert" class="mt-7 border border-amber-800/20 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p class="font-semibold">Firebase setup is needed</p>
        <p class="mt-1">Add your Firebase web app settings to <code class="rounded bg-amber-900/5 px-1">.env</code>, enable Email/Password and Google sign-in, and create a Firestore database in the Firebase Console.</p>
      </div>

      <form class="mt-8 space-y-5" @submit.prevent="submitForm">
        <div v-if="isRegister">
          <label for="display-name" class="mb-2 block text-xs font-semibold text-brand-dark/75">Your name</label>
          <input id="display-name" v-model="displayName" autocomplete="name" maxlength="80" required type="text" placeholder="Eleanor Vance" class="auth-input">
        </div>

        <div>
          <label for="email" class="mb-2 block text-xs font-semibold text-brand-dark/75">Email address</label>
          <input id="email" v-model="email" autocomplete="email" required type="email" placeholder="you@example.com" class="auth-input">
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between gap-4">
            <label for="password" class="block text-xs font-semibold text-brand-dark/75">Password</label>
            <span v-if="isRegister" class="text-[10px] text-brand-dark/45">At least 6 characters</span>
          </div>
          <input id="password" v-model="password" :autocomplete="isRegister ? 'new-password' : 'current-password'" minlength="6" required type="password" placeholder="••••••••" class="auth-input">
        </div>

        <div v-if="isRegister">
          <label for="confirm-password" class="mb-2 block text-xs font-semibold text-brand-dark/75">Confirm password</label>
          <input id="confirm-password" v-model="confirmPassword" autocomplete="new-password" minlength="6" required type="password" placeholder="••••••••" class="auth-input">
        </div>

        <p v-if="errorMessage" role="alert" class="border border-red-800/15 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">{{ errorMessage }}</p>

        <button
          type="submit"
          :disabled="isSubmitting || !userStore.isFirebaseConfigured"
          class="group flex w-full items-center justify-center gap-3 rounded-full bg-brand-dark px-6 py-4 text-xs font-semibold uppercase tracking-[0.13em] text-brand-cream transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ isSubmitting ? 'Please wait…' : isRegister ? 'Create my account' : 'Sign in' }}
          <span v-if="!isSubmitting" aria-hidden="true" class="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </form>

      <div class="my-6 flex items-center gap-4" aria-hidden="true">
        <span class="h-px flex-1 bg-brand-dark/10"></span>
        <span class="text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-dark/40">Or continue with</span>
        <span class="h-px flex-1 bg-brand-dark/10"></span>
      </div>

      <button
        type="button"
        :disabled="isSubmitting || !userStore.isFirebaseConfigured"
        class="flex w-full items-center justify-center gap-3 rounded-full border border-brand-dark/15 bg-white px-6 py-3.5 text-sm font-medium text-brand-dark transition-colors hover:border-brand-gold hover:bg-brand-cream disabled:cursor-not-allowed disabled:opacity-50"
        @click="submitGoogle"
      >
        <svg class="h-[18px] w-[18px]" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.92 46.98 31.79 46.98 24.55Z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
          <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.93 23.93 0 0 0 0 24c0 3.87.93 7.55 2.56 10.78l7.97-6.19Z" />
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
        </svg>
        {{ isSubmitting ? 'Please wait…' : 'Continue with Google' }}
      </button>
      <p class="mt-3 text-center text-[11px] leading-5 text-brand-dark/45">Google sign-in is securely handled by Firebase.</p>

      <p class="mt-7 text-center text-sm text-brand-dark/55">
        {{ isRegister ? 'Already have an account?' : 'New to ABC Scores?' }}
        <router-link :to="{ name: isRegister ? 'login' : 'register', query: route.query }" class="ml-1 font-semibold text-brand-dark underline decoration-brand-gold/60 underline-offset-4 transition-colors hover:text-brand-gold">
          {{ isRegister ? 'Sign in' : 'Create an account' }}
        </router-link>
      </p>
      <p class="mt-10 text-center text-[10px] uppercase tracking-[0.14em] text-brand-dark/35">A considered collection of sheet music</p>
    </section>
  </div>
</template>

<style scoped>
.auth-input {
  width: 100%;
  border: 1px solid rgb(23 33 30 / 14%);
  border-radius: 2px;
  background: white;
  padding: 13px 14px;
  color: #17211e;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.auth-input::placeholder {
  color: rgb(23 33 30 / 30%);
}

.auth-input:focus {
  border-color: #bd9a62;
  box-shadow: 0 0 0 3px rgb(189 154 98 / 13%);
}
</style>
