class MessageService {
  constructor() {
    this.defaultDuration = 3000 // 默认显示时间（毫秒）
  }

  /**
   * 显示成功消息
   * @param {string} message - 消息内容
   * @param {number} [duration] - 显示时间（毫秒）
   */
  success(message, duration = this.defaultDuration) {
    this._showMessage(message, 'success', duration)
  }

  /**
   * 显示错误消息
   * @param {string} message - 消息内容
   * @param {number} [duration] - 显示时间（毫秒）
   */
  error(message, duration = this.defaultDuration) {
    this._showMessage(message, 'error', duration)
  }

  /**
   * 显示警告消息
   * @param {string} message - 消息内容
   * @param {number} [duration] - 显示时间（毫秒）
   */
  warning(message, duration = this.defaultDuration) {
    this._showMessage(message, 'warning', duration)
  }

  /**
   * 显示信息消息
   * @param {string} message - 消息内容
   * @param {number} [duration] - 显示时间（毫秒）
   */
  info(message, duration = this.defaultDuration) {
    this._showMessage(message, 'info', duration)
  }

  /**
   * 内部方法：显示消息
   * @private
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型
   * @param {number} duration - 显示时间
   */
  _showMessage(message, type, duration) {
    // 创建消息元素
    const messageElement = document.createElement('div')
    messageElement.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${this._getTypeClass(type)}`
    messageElement.textContent = message

    // 添加到文档
    document.body.appendChild(messageElement)

    // 淡入效果
    setTimeout(() => {
      messageElement.style.opacity = '1'
    }, 0)

    // 自动移除
    setTimeout(() => {
      messageElement.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(messageElement)
      }, 300)
    }, duration)
  }

  /**
   * 内部方法：获取消息类型对应的样式类
   * @private
   * @param {string} type - 消息类型
   * @returns {string} 样式类名
   */
  _getTypeClass(type) {
    const baseClasses = 'transition-opacity duration-300 opacity-0'
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-500 text-white`
      case 'error':
        return `${baseClasses} bg-red-500 text-white`
      case 'warning':
        return `${baseClasses} bg-yellow-500 text-white`
      case 'info':
        return `${baseClasses} bg-blue-500 text-white`
      default:
        return `${baseClasses} bg-gray-500 text-white`
    }
  }
}

export default new MessageService()
