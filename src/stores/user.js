// src/stores/user.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(true) // Set to false to test logged-out state
  const user = ref({
    name: 'Eleanor Vance',
    avatar: 'https://i.pravatar.cc/150?img=32' // Placeholder avatar
  })

  function logout() {
    isLoggedIn.value = false
    user.value = null
  }

  return { isLoggedIn, user, logout }
})