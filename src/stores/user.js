import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  firebaseApp,
  isDriveConfigured,
  isFirebaseConfigured,
  scoresFolderId,
} from '@/firebase'

let authSdkPromise
let firestoreSdkPromise

function loadAuthSdk() {
  authSdkPromise ||= import('firebase/auth')
  return authSdkPromise
}

function loadFirestoreSdk() {
  firestoreSdkPromise ||= import('firebase/firestore/lite')
  return firestoreSdkPromise
}

function requireFirebase() {
  if (!isFirebaseConfigured || !firebaseApp) {
    throw new Error('Firebase is not configured. Add your Firebase web app settings to the local .env file.')
  }
}

function profileFromAuthUser(authUser, name = authUser.displayName || authUser.email?.split('@')[0] || 'Music lover') {
  return {
    uid: authUser.uid,
    name,
    email: authUser.email,
    role: 'user',
    photoURL: authUser.photoURL || '',
  }
}

export const useUserStore = defineStore('user', () => {
  const authUser = ref(null)
  const user = ref(null)
  const isLoading = ref(true)
  const authError = ref('')
  const driveAccessToken = ref('')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isLoggedIn = computed(() => Boolean(authUser.value))
  let initialized = false
  let resolveAuthReady
  const authReady = new Promise((resolve) => {
    resolveAuthReady = resolve
  })

  function requireAdmin() {
    if (!isAdmin.value) {
      throw new Error('Administrator access is required for this action.')
    }
  }

  function requireDriveConfig() {
    if (!isDriveConfigured) {
      throw new Error('Google Drive is not configured. Set VITE_ABC_SCORES_FOLDER_ID in .env, then restart the dev server.')
    }
  }

  function requireDriveToken() {
    if (!driveAccessToken.value) {
      throw new Error('Connect your Google Drive account before uploading or deleting score PDFs.')
    }
    return driveAccessToken.value
  }

  async function callDriveApi(path, options = {}) {
    requireAdmin()
    requireDriveConfig()
    const token = requireDriveToken()
    const url = new URL(`https://www.googleapis.com/drive/v3/${path}`)

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      let message = `Google Drive request failed (${response.status}).`
      try {
        const result = await response.json()
        message = result.error?.message || message
      } catch (error) {
        console.error('Unable to read Google Drive error response:', error)
      }

      if (response.status === 401) driveAccessToken.value = ''
      throw new Error(message)
    }

    if (response.status === 204) return null
    return response.json()
  }

  async function loadProfile(firebaseUser) {
    const firestoreSdk = await loadFirestoreSdk()
    const userRef = firestoreSdk.doc(firestoreSdk.getFirestore(firebaseApp), 'users', firebaseUser.uid)
    const profileSnapshot = await firestoreSdk.getDoc(userRef)

    if (profileSnapshot.exists()) {
      return profileSnapshot.data()
    }

    const profile = profileFromAuthUser(firebaseUser)
    await firestoreSdk.setDoc(userRef, {
      ...profile,
      createdAt: firestoreSdk.serverTimestamp(),
      updatedAt: firestoreSdk.serverTimestamp(),
    })
    return profile
  }

  function initialize() {
    if (initialized) return authReady
    initialized = true

    if (!isFirebaseConfigured || !firebaseApp) {
      isLoading.value = false
      resolveAuthReady()
      return authReady
    }

    loadAuthSdk()
      .then(({ getAuth, onAuthStateChanged }) => {
        onAuthStateChanged(getAuth(firebaseApp), async (firebaseUser) => {
          authUser.value = firebaseUser
          authError.value = ''

          if (!firebaseUser) {
            user.value = null
            isLoading.value = false
            resolveAuthReady()
            return
          }

          isLoading.value = true
          try {
            const profile = await loadProfile(firebaseUser)
            if (authUser.value?.uid === firebaseUser.uid) {
              user.value = profile
            }
          } catch (error) {
            if (authUser.value?.uid === firebaseUser.uid) {
              authError.value = 'Your account is signed in, but its Firestore profile could not be loaded. Check your Firestore rules and try again.'
              user.value = null
            }
            console.error('Unable to load Firebase user profile:', error)
          } finally {
            isLoading.value = false
            resolveAuthReady()
          }
        })
      })
      .catch((error) => {
        authError.value = 'Firebase Authentication could not be initialized. Check your Firebase configuration and network connection.'
        isLoading.value = false
        console.error('Unable to initialize Firebase Authentication:', error)
        resolveAuthReady()
      })

    return authReady
  }

  async function register(name, email, password) {
    requireFirebase()
    authError.value = ''
    const [authSdk, firestoreSdk] = await Promise.all([loadAuthSdk(), loadFirestoreSdk()])
    const credential = await authSdk.createUserWithEmailAndPassword(authSdk.getAuth(firebaseApp), email, password)
    await authSdk.updateProfile(credential.user, { displayName: name })

    const profile = {
      ...profileFromAuthUser(credential.user, name),
      createdAt: firestoreSdk.serverTimestamp(),
      updatedAt: firestoreSdk.serverTimestamp(),
    }
    const userRef = firestoreSdk.doc(firestoreSdk.getFirestore(firebaseApp), 'users', credential.user.uid)
    await firestoreSdk.setDoc(userRef, profile)
    authUser.value = credential.user
    user.value = { ...profile, createdAt: null, updatedAt: null }
    return credential.user
  }

  async function login(email, password) {
    requireFirebase()
    authError.value = ''
    const authSdk = await loadAuthSdk()
    const credential = await authSdk.signInWithEmailAndPassword(authSdk.getAuth(firebaseApp), email, password)
    authUser.value = credential.user
    user.value = await loadProfile(credential.user)
    return credential.user
  }

  async function loginWithGoogle() {
    requireFirebase()
    authError.value = ''
    const authSdk = await loadAuthSdk()
    const provider = new authSdk.GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const credential = await authSdk.signInWithPopup(authSdk.getAuth(firebaseApp), provider)
    authUser.value = credential.user
    user.value = await loadProfile(credential.user)
    return credential.user
  }

  async function connectGoogleDrive() {
    requireFirebase()
    requireAdmin()
    requireDriveConfig()
    const authSdk = await loadAuthSdk()
    const auth = authSdk.getAuth(firebaseApp)
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('Sign in before connecting Google Drive.')

    const provider = new authSdk.GoogleAuthProvider()
    provider.addScope('https://www.googleapis.com/auth/drive.file')
    provider.setCustomParameters({ prompt: 'consent select_account' })

    const isGoogleLinked = currentUser.providerData.some(({ providerId }) => providerId === 'google.com')
    const result = isGoogleLinked
      ? await authSdk.reauthenticateWithPopup(currentUser, provider)
      : await authSdk.linkWithPopup(currentUser, provider)
    const credential = authSdk.GoogleAuthProvider.credentialFromResult(result)

    if (!credential?.accessToken) {
      throw new Error('Google did not provide Drive access. Confirm the Drive scope is allowed in your OAuth consent configuration and try again.')
    }

    driveAccessToken.value = credential.accessToken
    authUser.value = result.user
    return true
  }

  async function listScores() {
    requireFirebase()
    const firestoreSdk = await loadFirestoreSdk()
    const scoresRef = firestoreSdk.collection(firestoreSdk.getFirestore(firebaseApp), 'scores')
    const scoresQuery = firestoreSdk.query(scoresRef, firestoreSdk.orderBy('title'))
    const snapshot = await firestoreSdk.getDocs(scoresQuery)
    return snapshot.docs.map((scoreDoc) => ({ id: scoreDoc.id, ...scoreDoc.data() }))
  }

  async function saveScore(scoreId, scoreData) {
    requireFirebase()
    requireAdmin()
    const firestoreSdk = await loadFirestoreSdk()
    const database = firestoreSdk.getFirestore(firebaseApp)
    const data = {
      title: scoreData.title.trim(),
      composer: scoreData.composer.trim(),
      category: scoreData.category.trim(),
      details: scoreData.details.trim(),
      price: scoreData.price ? Number(scoreData.price) : null,
      updatedAt: firestoreSdk.serverTimestamp(),
    }

    if (scoreId) {
      const updatedScore = { ...data }
      if (scoreData.driveFileId && scoreData.driveUrl) {
        updatedScore.driveFileId = scoreData.driveFileId
        updatedScore.driveUrl = scoreData.driveUrl
      }
      await firestoreSdk.updateDoc(firestoreSdk.doc(database, 'scores', scoreId), updatedScore)
      return scoreId
    }

    const created = await firestoreSdk.addDoc(firestoreSdk.collection(database, 'scores'), {
      ...data,
      driveFileId: scoreData.driveFileId,
      driveUrl: scoreData.driveUrl,
      createdAt: firestoreSdk.serverTimestamp(),
      createdBy: authUser.value.uid,
    })
    return created.id
  }

  async function deleteScore(score) {
    requireFirebase()
    requireAdmin()
    if (!score.driveFileId) throw new Error('This score does not have an associated Google Drive PDF.')

    await callDriveApi(`files/${encodeURIComponent(score.driveFileId)}`, { method: 'DELETE' })
    const firestoreSdk = await loadFirestoreSdk()
    await firestoreSdk.deleteDoc(
      firestoreSdk.doc(firestoreSdk.getFirestore(firebaseApp), 'scores', score.id),
    )
  }

  async function uploadScorePdf(file, { shareWithAnyone = false } = {}) {
    requireAdmin()
    requireDriveConfig()
    requireDriveToken()
    if (!(file instanceof File) || file.type !== 'application/pdf') {
      throw new Error('Choose a PDF file to upload.')
    }
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('PDF files must be 25 MB or smaller.')
    }

    const boundary = `abc_scores_${crypto.randomUUID().replaceAll('-', '')}`
    const metadata = {
      name: file.name,
      mimeType: 'application/pdf',
      parents: [scoresFolderId],
    }
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      `--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`,
      file,
      `\r\n--${boundary}--`,
    ], { type: `multipart/related; boundary=${boundary}` })
    const query = new URLSearchParams({
      uploadType: 'multipart',
      fields: 'id,name,mimeType,webViewLink',
    })
    const token = requireDriveToken()
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files?${query}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    })

    if (!response.ok) {
      let message = `Google Drive upload failed (${response.status}).`
      try {
        const result = await response.json()
        message = result.error?.message || message
      } catch (error) {
        console.error('Unable to read Google Drive upload error response:', error)
      }
      if (response.status === 401) driveAccessToken.value = ''
      throw new Error(message)
    }

    const uploadedFile = await response.json()
    if (shareWithAnyone) {
      try {
        await callDriveApi(`files/${encodeURIComponent(uploadedFile.id)}/permissions?fields=id`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'anyone', role: 'reader' }),
        })
      } catch (error) {
        try {
          await callDriveApi(`files/${encodeURIComponent(uploadedFile.id)}`, { method: 'DELETE' })
        } catch (cleanupError) {
          console.error('Unable to remove uploaded PDF after sharing failed:', cleanupError)
        }
        throw new Error(`PDF uploaded, but public sharing could not be enabled: ${error.message}`, { cause: error })
      }
    }

    return {
      driveFileId: uploadedFile.id,
      driveUrl: uploadedFile.webViewLink || `https://drive.google.com/file/d/${uploadedFile.id}/view`,
    }
  }

  async function listUsers() {
    requireFirebase()
    requireAdmin()
    const firestoreSdk = await loadFirestoreSdk()
    const snapshot = await firestoreSdk.getDocs(
      firestoreSdk.collection(firestoreSdk.getFirestore(firebaseApp), 'users'),
    )
    return snapshot.docs.map((userDoc) => ({ id: userDoc.id, ...userDoc.data() }))
  }

  async function listLicenseRequests() {
    requireFirebase()
    requireAdmin()
    const firestoreSdk = await loadFirestoreSdk()
    const requests = firestoreSdk.collection(firestoreSdk.getFirestore(firebaseApp), 'licenseRequests')
    const requestsQuery = firestoreSdk.query(requests, firestoreSdk.orderBy('createdAt', 'desc'))
    const snapshot = await firestoreSdk.getDocs(requestsQuery)
    return snapshot.docs.map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }))
  }

  async function createLicenseRequest({ scoreId, scoreTitle, requesterName, requesterEmail }) {
    requireFirebase()
    const name = requesterName.trim()
    const email = requesterEmail.trim()
    if (!scoreId || !scoreTitle?.trim() || !name || !email) {
      throw new Error('Provide your name and email address to request a license.')
    }

    const firestoreSdk = await loadFirestoreSdk()
    const database = firestoreSdk.getFirestore(firebaseApp)
    const created = await firestoreSdk.addDoc(firestoreSdk.collection(database, 'licenseRequests'), {
      scoreId,
      scoreTitle: scoreTitle.trim(),
      requesterName: name,
      requesterEmail: email,
      requesterUid: authUser.value?.uid || '',
      status: 'pending',
      createdAt: firestoreSdk.serverTimestamp(),
    })
    return created.id
  }

  async function updateLicenseRequestStatus(requestId, status, issuedAt = new Date(), licenseDetails = null) {
    requireFirebase()
    requireAdmin()
    if (!['approved', 'declined'].includes(status)) {
      throw new Error('Choose approve or decline for this license request.')
    }

    const firestoreSdk = await loadFirestoreSdk()
    const update = { status, reviewedAt: firestoreSdk.serverTimestamp() }
    if (status === 'approved') {
      if (!licenseDetails?.licenseTitle?.trim() || !licenseDetails?.licensedTo?.trim()) {
        throw new Error('Enter a score title and licensee before approving this request.')
      }
      update.issuedAt = firestoreSdk.Timestamp.fromDate(issuedAt)
      update.licenseTitle = licenseDetails.licenseTitle.trim()
      update.licensedTo = licenseDetails.licensedTo.trim()
    }

    await firestoreSdk.updateDoc(
      firestoreSdk.doc(firestoreSdk.getFirestore(firebaseApp), 'licenseRequests', requestId),
      update,
    )
  }

  async function updateUserRole(userId, role) {
    requireFirebase()
    requireAdmin()
    if (!['user', 'admin'].includes(role)) throw new Error('Choose a valid user role.')
    if (userId === authUser.value?.uid) throw new Error('You cannot change your own administrator role.')

    const firestoreSdk = await loadFirestoreSdk()
    await firestoreSdk.updateDoc(
      firestoreSdk.doc(firestoreSdk.getFirestore(firebaseApp), 'users', userId),
      { role, updatedAt: firestoreSdk.serverTimestamp() },
    )
  }

  async function logout() {
    requireFirebase()
    authError.value = ''
    try {
      const authSdk = await loadAuthSdk()
      await authSdk.signOut(authSdk.getAuth(firebaseApp))
      driveAccessToken.value = ''
    } catch (error) {
      authError.value = 'We could not sign you out. Please try again.'
      console.error('Unable to sign out from Firebase:', error)
      return false
    }
    return true
  }

  return {
    authError,
    authReady,
    authUser,
    connectGoogleDrive,
    driveAccessToken,
    initialize,
    isAdmin,
    isDriveConfigured,
    isFirebaseConfigured,
    isLoading,
    isLoggedIn,
    createLicenseRequest,
    listScores,
    listLicenseRequests,
    listUsers,
    login,
    loginWithGoogle,
    logout,
    register,
    saveScore,
    deleteScore,
    deleteDrivePdf: (fileId) => callDriveApi(`files/${encodeURIComponent(fileId)}`, { method: 'DELETE' }),
    updateUserRole,
    updateLicenseRequestStatus,
    uploadScorePdf,
    user,
  }
})
