// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'
import './assets/main.css' // Ensure this points to your Tailwind CSS

const app = createApp(App)

app.use(createPinia())
const userStore = useUserStore()
userStore.initialize()
app.use(router)

app.mount('#app')