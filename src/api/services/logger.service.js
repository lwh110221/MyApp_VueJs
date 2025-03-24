import API from '../http'
import { LOGGER_ENDPOINTS } from '../endpoints'
import { isAuthenticated } from '@/stores'

class LoggerService {
  constructor() {
    this.loggerUrl = LOGGER_ENDPOINTS.LOG_ERROR
  }

  /**
   * 格式化日志消息
   * @param {Error|Object} error - 错误对象
   * @param {string} [context=''] - 错误上下文
   * @returns {Object} 格式化后的日志数据
   */
  formatMessage(error, context = '') {
    const timestamp = new Date().toISOString()
    const errorMessage = error.response?.data?.message || error.message || '未知错误'
    const stack = error.stack || ''
    const source = error.fileName || error.sourceURL || ''
    const lineNo = error.lineNumber || error.line || 0
    const colNo = error.columnNumber || error.column || 0

    // 获取当前页面URL
    const url = window.location.href

    // 获取用户浏览器信息
    const userAgent = window.navigator.userAgent

    // 获取必要的应用状态（不包含敏感信息）
    const state = {
      route: window.location.pathname,
      authenticated: isAuthenticated() || false
    }

    return {
      timestamp,
      context,
      message: errorMessage,
      stack,
      source,
      lineNo,
      colNo,
      url,
      userAgent,
      state
    }
  }

  /**
   * 记录错误日志
   * @param {Error|Object} error - 错误对象
   * @param {string} [context=''] - 错误上下文
   * @returns {Promise}
   */
  async logError(error, context = '') {
    try {
      const logData = this.formatMessage(error, context)

      // 在控制台显示错误
      console.error(`${logData.timestamp} ${context}\nError: ${logData.message}\nStack: ${logData.stack}`)

      // 发送到API服务器
      try {
        await API.post(this.loggerUrl, logData)
      } catch (fetchError) {
        // 如果API客户端失败，尝试使用原生fetch作为备选
        console.warn('API客户端发送日志失败，尝试使用原生fetch')
        const response = await fetch(this.loggerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(logData)
        })

        if (!response.ok) {
          console.error('发送日志失败:', response.statusText)
        }
      }
    } catch (err) {
      console.error('记录日志时出错:', err)
    }
  }
}

export default new LoggerService()

