import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { useUserStore } from '@/store/user'
import { registerAuth } from '@/utils/auth'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)

registerAuth(() => {
  const store = useUserStore(pinia)
  return {
    token: store.token,
    setToken: store.setToken,
    resetUser: store.resetUser,
  }
})

app.use(router)
app.mount('#app')