import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import messagePlugin from './plugins/message'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import loggerService from './api/services/logger.service'

const app = createApp(App)
const pinia = createPinia()

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue错误:', err)
  loggerService.logError(err, `Vue错误: ${info}`)
}

// 全局未捕获的Promise错误
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise错误:', event.reason)
  loggerService.logError(event.reason, '未处理的Promise错误')
})

// 全局未捕获的JS错误
window.addEventListener('error', event => {
  console.error('未捕获的JS错误:', event.error)
  loggerService.logError(event.error || {
    message: event.message,
    fileName: event.filename,
    lineNumber: event.lineno,
    columnNumber: event.colno
  }, '未捕获的JS错误')
})

app.use(pinia)
app.use(router)
app.use(messagePlugin)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})

app.mount('#app')
