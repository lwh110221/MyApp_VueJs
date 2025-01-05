import API from '../http'
import { LOGGER_ENDPOINTS } from '../endpoints'

class LoggerService {
  constructor() {
    this.loggerUrl = LOGGER_ENDPOINTS.LOG_ERROR
  }

  /**
   * 格式化日志消息
   * @param {Error} error - 错误对象
   * @param {string} [context=''] - 错误上下文
   * @returns {Object} 格式化后的日志数据
   */
  formatMessage(error, context = '') {
    const timestamp = new Date().toISOString()
    const errorMessage = error.response?.data?.message || error.message
    const stack = error.stack || ''
    return {
      timestamp,
      context,
      message: errorMessage,
      stack
    }
  }

  /**
   * 记录错误日志
   * @param {Error} error - 错误对象
   * @param {string} [context=''] - 错误上下文
   * @returns {Promise}
   */
  async logError(error, context = '') {
    try {
      const logData = this.formatMessage(error, context)

      // 在控制台显示错误
      console.error(`${logData.timestamp} ${context}\nError: ${logData.message}\nStack: ${logData.stack}`)

      // 发送到本地日志服务器
      const response = await fetch(this.loggerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      })

      if (!response.ok) {
        console.error('Failed to write to log file')
      }
    } catch (err) {
      console.error('Error logging:', err)
    }
  }
}

export default new LoggerService()

