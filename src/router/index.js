// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/collections', name: 'collections', component: () => import('../views/CollectionsView.vue') },
    { path: '/library', name: 'library', component: () => import('../views/LibraryView.vue'), meta: { requiresAuth: true } },
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/AuthView.vue'), meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: () => import('../views/AuthView.vue'), meta: { guestOnly: true } },
  ]
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()
  await userStore.authReady

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && userStore.isLoggedIn) {
    const redirect = to.query.redirect
    if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') && !['/login', '/register'].includes(redirect)) {
      return redirect
    }
    return { name: 'home' }
  }
})

export default router