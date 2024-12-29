import { createApp } from 'vue'
import GlobalMessage from '../components/GlobalMessage.vue'

const messagePlugin = {
  install(app) {
    // 创建一个消息组件实例
    const messageInstance = createApp(GlobalMessage).mount(
      document.createElement('div')
    )
    document.body.appendChild(messageInstance.$el)

    // 添加全局方法
    app.config.globalProperties.$message = {
      show: messageInstance.show,
      success(message, duration) {
        messageInstance.show(message, 'success', duration)
      },
      error(message, duration) {
        messageInstance.show(message, 'error', duration)
      },
      info(message, duration) {
        messageInstance.show(message, 'info', duration)
      },
      warning(message, duration) {
        messageInstance.show(message, 'warning', duration)
      }
    }
  }
}

export default messagePlugin
