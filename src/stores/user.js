import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { firebaseApp, isFirebaseConfigured } from '@/firebase'

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
  const isLoggedIn = computed(() => Boolean(authUser.value))
  let initialized = false
  let resolveAuthReady
  const authReady = new Promise((resolve) => {
    resolveAuthReady = resolve
  })

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

  async function logout() {
    requireFirebase()
    authError.value = ''
    try {
      const authSdk = await loadAuthSdk()
      await authSdk.signOut(authSdk.getAuth(firebaseApp))
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
    initialize,
    isFirebaseConfigured,
    isLoading,
    isLoggedIn,
    login,
    loginWithGoogle,
    logout,
    register,
    user,
  }
})
