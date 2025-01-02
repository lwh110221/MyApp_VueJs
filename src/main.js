import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css'
import messagePlugin from './plugins/message'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(messagePlugin)

app.mount('#app')
