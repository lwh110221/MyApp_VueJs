import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'
import messagePlugin from './plugins/message'

const app = createApp(App)
app.use(router)
app.use(messagePlugin)
app.mount('#app')
