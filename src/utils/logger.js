class Logger {
  constructor() {
    this.maxLogLength = 1000 // 最大日志条数
    this.logPrefix = '[MyApp]'
  }

  formatMessage(error, context = '') {
    const timestamp = new Date().toISOString()
    const errorMessage = error.response?.data?.message || error.message
    const stack = error.stack || ''
    return `${this.logPrefix} [${timestamp}] ${context}\nError: ${errorMessage}\nStack: ${stack}\n\n`
  }

  async logError(error, context = '') {
    try {
      const message = this.formatMessage(error, context)

      // 在控制台显示错误
      console.error(message)

      // 获取现有日志
      let logs = JSON.parse(localStorage.getItem('error_logs') || '[]')

      // 添加新日志
      logs.unshift({
        timestamp: new Date().toISOString(),
        message: error.message,
        context,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent
      })

      // 限制日志数量
      if (logs.length > this.maxLogLength) {
        logs = logs.slice(0, this.maxLogLength)
      }

      // 保存到 localStorage
      localStorage.setItem('error_logs', JSON.stringify(logs))

      // 如果是生产环境，可以发送到服务器
      if (import.meta.env.PROD) {
        this.sendToServer({
          error: {
            message: error.message,
            stack: error.stack
          },
          context,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      }
    } catch (err) {
      console.error('Error writing log:', err)
    }
  }

  // 获取所有日志
  getLogs() {
    return JSON.parse(localStorage.getItem('error_logs') || '[]')
  }

  // 清除日志
  clearLogs() {
    localStorage.removeItem('error_logs')
  }

  // 发送日志到服务器（生产环境使用）
  async sendToServer(logData) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(logData)
      })

      if (!response.ok) {
        console.error('Failed to send log to server')
      }
    } catch (err) {
      console.error('Error sending log to server:', err)
    }
  }
}

export const logger = new Logger()
