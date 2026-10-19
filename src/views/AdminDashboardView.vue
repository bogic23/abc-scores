<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const activeTab = ref('scores')
const scores = ref([])
const users = ref([])
const selectedFile = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)
const isConnectingDrive = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const form = reactive({
  id: '',
  title: '',
  composer: '',
  category: '',
  details: '',
  price: '',
  driveFileId: '',
  driveUrl: '',
  shareWithAnyone: true,
})
const canSaveScore = computed(() => {
  if (form.id && !selectedFile.value) return true
  return userStore.isDriveConfigured && Boolean(userStore.driveAccessToken)
})

async function loadScores() {
  scores.value = await userStore.listScores()
}

async function loadUsers() {
  users.value = await userStore.listUsers()
}

async function loadDashboard() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await Promise.all([loadScores(), loadUsers()])
  } catch (error) {
    console.error('Unable to load admin dashboard:', error)
    errorMessage.value = error.message || 'Dashboard data could not be loaded.'
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    id: '',
    title: '',
    composer: '',
    category: '',
    details: '',
    price: '',
    driveFileId: '',
    driveUrl: '',
    shareWithAnyone: true,
  })
  selectedFile.value = null
  const input = document.querySelector('#score-pdf')
  if (input) input.value = ''
}

function editScore(score) {
  Object.assign(form, {
    id: score.id,
    title: score.title || '',
    composer: score.composer || '',
    category: score.category || '',
    details: score.details || '',
    price: score.price ?? '',
    driveFileId: score.driveFileId || '',
    driveUrl: score.driveUrl || '',
    shareWithAnyone: true,
  })
  selectedFile.value = null
  errorMessage.value = ''
  successMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleFileChange(event) {
  selectedFile.value = event.target.files?.[0] || null
  errorMessage.value = ''
}

async function saveScore() {
  errorMessage.value = ''
  successMessage.value = ''
  if (!form.id && !selectedFile.value) {
    errorMessage.value = 'Choose a PDF file for this new score.'
    return
  }

  isSaving.value = true
  let uploadedPdf = null
  const previousDriveFileId = form.driveFileId
  try {
    if (selectedFile.value) {
      uploadedPdf = await userStore.uploadScorePdf(selectedFile.value, {
        shareWithAnyone: form.shareWithAnyone,
      })
    }

    await userStore.saveScore(form.id, {
      title: form.title,
      composer: form.composer,
      category: form.category,
      details: form.details,
      price: form.price,
      ...(uploadedPdf || (form.driveFileId && form.driveUrl
        ? { driveFileId: form.driveFileId, driveUrl: form.driveUrl }
        : {})),
    })

    if (uploadedPdf && previousDriveFileId && previousDriveFileId !== uploadedPdf.driveFileId) {
      try {
        await userStore.deleteDrivePdf(previousDriveFileId)
      } catch (error) {
        console.error('New score saved, but the previous Drive PDF could not be removed:', error)
        successMessage.value = 'Score saved. The previous PDF could not be deleted from Drive; remove it manually when convenient.'
      }
    }

    if (!successMessage.value) successMessage.value = form.id ? 'Score updated successfully.' : 'Score added successfully.'
    resetForm()
    await loadScores()
  } catch (error) {
    console.error('Unable to save score:', error)
    if (uploadedPdf) {
      try {
        await userStore.deleteDrivePdf(uploadedPdf.driveFileId)
        errorMessage.value = `The score record could not be saved, so the uploaded PDF was removed from Drive: ${error.message}`
      } catch (cleanupError) {
        console.error('Unable to remove uploaded PDF after score save failed:', cleanupError)
        errorMessage.value = `The score record could not be saved, and the uploaded PDF remains in Drive (file ID ${uploadedPdf.driveFileId}): ${error.message}`
      }
    } else {
      errorMessage.value = error.message || 'The score could not be saved.'
    }
  } finally {
    isSaving.value = false
  }
}

async function removeScore(score) {
  if (!window.confirm(`Delete “${score.title}” and its Google Drive PDF?`)) return
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await userStore.deleteScore(score)
    scores.value = scores.value.filter((item) => item.id !== score.id)
    successMessage.value = 'Score and PDF deleted.'
    if (form.id === score.id) resetForm()
  } catch (error) {
    console.error('Unable to delete score:', error)
    errorMessage.value = error.message || 'The score could not be deleted.'
  }
}

async function connectGoogleDrive() {
  isConnectingDrive.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await userStore.connectGoogleDrive()
    successMessage.value = 'Google Drive connected for this session.'
  } catch (error) {
    console.error('Unable to connect Google Drive:', error)
    errorMessage.value = error.message || 'Google Drive could not be connected.'
  } finally {
    isConnectingDrive.value = false
  }
}

async function changeRole(user, event) {
  const role = event.target.value
  errorMessage.value = ''
  successMessage.value = ''
  try {
    await userStore.updateUserRole(user.id, role)
    user.role = role
    successMessage.value = `Updated ${user.name || user.email} to ${role}.`
  } catch (error) {
    event.target.value = user.role
    console.error('Unable to update user role:', error)
    errorMessage.value = error.message || 'The user role could not be updated.'
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
    <div class="mb-9 flex flex-col justify-between gap-5 border-b border-brand-dark/10 pb-7 sm:flex-row sm:items-end">
      <div>
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-gold">ABC Scores · Administration</p>
        <h1 class="font-serif text-4xl font-medium sm:text-5xl">Studio dashboard.</h1>
        <p class="mt-3 text-sm text-brand-dark/55">Manage your score collection and account roles.</p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span class="rounded-full border border-brand-dark/10 bg-white px-4 py-2 text-xs capitalize text-brand-dark/70">{{ userStore.user?.role }} access</span>
        <button
          type="button"
          :disabled="!userStore.isDriveConfigured || isConnectingDrive || Boolean(userStore.driveAccessToken)"
          class="rounded-full bg-brand-dark px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-cream transition-colors hover:bg-brand-gold hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          @click="connectGoogleDrive"
        >
          {{ userStore.driveAccessToken ? 'Drive connected' : isConnectingDrive ? 'Connecting…' : 'Connect Google Drive' }}
        </button>
      </div>
    </div>

    <p v-if="!userStore.isDriveConfigured" class="mb-6 border border-amber-800/20 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
      Authenticated Drive requests use your Google OAuth access token, so a Drive API key is not required. Set <code class="rounded bg-amber-900/5 px-1">VITE_ABC_SCORES_FOLDER_ID</code> in <code class="rounded bg-amber-900/5 px-1">.env</code>, enable the Google Drive API, and restart Vite.
    </p>
    <p v-else-if="!userStore.driveAccessToken" class="mb-6 border border-brand-gold/25 bg-white px-4 py-3 text-sm leading-6 text-brand-dark/65">
      Connect the Google account that can edit your Drive folder. Drive access is requested only when you choose this button and lasts for this browser session.
    </p>

    <p v-if="errorMessage" role="alert" class="mb-5 border border-red-800/15 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">{{ errorMessage }}</p>
    <p v-if="successMessage" role="status" class="mb-5 border border-emerald-800/15 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-900">{{ successMessage }}</p>

    <div class="mb-8 flex gap-2 border-b border-brand-dark/10">
      <button
        type="button"
        class="border-b-2 px-4 py-3 text-sm transition-colors"
        :class="activeTab === 'scores' ? 'border-brand-gold font-semibold text-brand-dark' : 'border-transparent text-brand-dark/55 hover:text-brand-dark'"
        @click="activeTab = 'scores'"
      >
        Scores <span class="ml-1 text-xs text-brand-dark/45">{{ scores.length }}</span>
      </button>
      <button
        type="button"
        class="border-b-2 px-4 py-3 text-sm transition-colors"
        :class="activeTab === 'users' ? 'border-brand-gold font-semibold text-brand-dark' : 'border-transparent text-brand-dark/55 hover:text-brand-dark'"
        @click="activeTab = 'users'"
      >
        Users <span class="ml-1 text-xs text-brand-dark/45">{{ users.length }}</span>
      </button>
    </div>

    <p v-if="isLoading" class="py-12 text-center text-sm text-brand-dark/50">Loading dashboard…</p>

    <div v-else-if="activeTab === 'scores'" class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.85fr)]">
      <section>
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h2 class="font-serif text-2xl">Score library</h2>
            <p class="mt-1 text-xs text-brand-dark/50">Uploaded PDFs are stored in your selected Drive folder.</p>
          </div>
          <button v-if="form.id" type="button" class="text-xs font-semibold text-brand-gold hover:underline" @click="resetForm">Cancel edit</button>
        </div>

        <div v-if="!scores.length" class="border border-dashed border-brand-gold/40 bg-white px-6 py-12 text-center">
          <p class="font-serif text-xl">Your score library is ready.</p>
          <p class="mt-2 text-sm text-brand-dark/50">Add a score using the form.</p>
        </div>

        <div v-else class="space-y-3">
          <article v-for="score in scores" :key="score.id" class="flex flex-col justify-between gap-4 border border-brand-dark/10 bg-white p-4 sm:flex-row sm:items-center">
            <div class="min-w-0">
              <p class="font-serif text-lg">{{ score.title }}</p>
              <p class="mt-1 text-xs text-brand-dark/55">{{ score.composer || 'Composer not specified' }}<span v-if="score.category"> · {{ score.category }}</span></p>
              <a :href="score.driveUrl" target="_blank" rel="noopener noreferrer" class="mt-2 inline-block max-w-full truncate text-xs text-brand-gold underline underline-offset-2">Open PDF in Google Drive ↗</a>
            </div>
            <div class="flex shrink-0 gap-2">
              <button type="button" class="rounded-full border border-brand-dark/15 px-4 py-2 text-xs transition-colors hover:border-brand-gold" @click="editScore(score)">Edit</button>
              <button type="button" class="rounded-full border border-red-800/15 px-4 py-2 text-xs text-red-800 transition-colors hover:bg-red-50" @click="removeScore(score)">Delete</button>
            </div>
          </article>
        </div>
      </section>

      <form class="h-fit border border-brand-dark/10 bg-white p-5 sm:p-7" @submit.prevent="saveScore">
        <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">{{ form.id ? 'Edit score' : 'New addition' }}</p>
        <h2 class="mb-6 font-serif text-2xl">{{ form.id ? 'Refine the details.' : 'Add a score.' }}</h2>

        <label for="score-title" class="form-label">Score name</label>
        <input id="score-title" v-model="form.title" required maxlength="160" class="form-input" placeholder="Nocturne in E-flat">

        <label for="score-composer" class="form-label">Composer</label>
        <input id="score-composer" v-model="form.composer" required maxlength="120" class="form-input" placeholder="Frédéric Chopin">

        <label for="score-category" class="form-label">Category</label>
        <input id="score-category" v-model="form.category" required maxlength="120" class="form-input" placeholder="Piano · Romantic">

        <label for="score-details" class="form-label">Details</label>
        <textarea id="score-details" v-model="form.details" rows="3" maxlength="2000" class="form-input resize-y" placeholder="Edition notes, instrumentation, or other details"></textarea>

        <label for="score-price" class="form-label">Price (optional)</label>
        <input id="score-price" v-model="form.price" type="number" min="0" step="0.01" class="form-input" placeholder="24.99">

        <label for="score-pdf" class="form-label">{{ form.id ? 'Replace PDF (optional)' : 'PDF sheet music' }}</label>
        <input id="score-pdf" type="file" accept="application/pdf,.pdf" :required="!form.id" class="form-input file:mr-3 file:rounded-full file:border-0 file:bg-brand-cream file:px-3 file:py-1.5 file:text-xs file:font-semibold" @change="handleFileChange">
        <p v-if="form.driveUrl && !selectedFile" class="mb-4 -mt-1 text-xs text-brand-dark/50">Current PDF will be kept unless you select a replacement.</p>

        <label class="mb-5 flex items-start gap-3 text-xs leading-5 text-brand-dark/65">
          <input v-model="form.shareWithAnyone" type="checkbox" class="mt-1 accent-brand-gold">
          Allow anyone with the link to view the PDF. This makes the score accessible without signing into Google.
        </label>

        <button type="submit" :disabled="isSaving || !canSaveScore" class="w-full rounded-full bg-brand-dark px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-cream transition-colors hover:bg-brand-gold hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
          {{ isSaving ? 'Saving score…' : form.id ? 'Save changes' : 'Upload PDF & save score' }}
        </button>
      </form>
    </div>

    <section v-else-if="activeTab === 'users'" class="overflow-hidden border border-brand-dark/10 bg-white">
      <div class="border-b border-brand-dark/10 px-5 py-4">
        <h2 class="font-serif text-2xl">User accounts</h2>
        <p class="mt-1 text-xs text-brand-dark/50">Promote or revoke administrator access. You cannot change your own role here.</p>
      </div>
      <div v-if="!users.length" class="px-5 py-12 text-center text-sm text-brand-dark/50">No user profiles found.</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[600px] text-left text-sm">
          <thead class="bg-brand-cream text-[10px] uppercase tracking-[0.14em] text-brand-dark/55">
            <tr><th class="px-5 py-3 font-semibold">Name</th><th class="px-5 py-3 font-semibold">Email</th><th class="px-5 py-3 font-semibold">Role</th><th class="px-5 py-3 font-semibold">Account</th></tr>
          </thead>
          <tbody>
            <tr v-for="account in users" :key="account.id" class="border-t border-brand-dark/10">
              <td class="px-5 py-4 font-medium">{{ account.name || 'Music lover' }}</td>
              <td class="px-5 py-4 text-brand-dark/60">{{ account.email || '—' }}</td>
              <td class="px-5 py-4">
                <select
                  :value="account.role"
                  :disabled="account.id === userStore.authUser?.uid"
                  class="rounded-full border border-brand-dark/15 bg-white px-3 py-2 text-xs capitalize disabled:cursor-not-allowed disabled:opacity-50"
                  :aria-label="`Role for ${account.name || account.email}`"
                  @change="changeRole(account, $event)"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td class="px-5 py-4 text-xs text-brand-dark/45">{{ account.id === userStore.authUser?.uid ? 'You · current account' : 'Active' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<style scoped>
.form-label {
  display: block;
  margin-bottom: 8px;
  color: rgb(23 33 30 / 75%);
  font-size: 0.75rem;
  font-weight: 600;
}

.form-input {
  width: 100%;
  margin-bottom: 18px;
  border: 1px solid rgb(23 33 30 / 14%);
  border-radius: 2px;
  background: #fff;
  padding: 11px 12px;
  color: #17211e;
  font-size: 0.85rem;
  outline: none;
}

.form-input:focus {
  border-color: #bd9a62;
  box-shadow: 0 0 0 3px rgb(189 154 98 / 13%);
}
</style>
