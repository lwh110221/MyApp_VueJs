class Logger {
  constructor() {
    this.loggerUrl = 'http://localhost:3030/log'
  }

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

export const logger = new Logger()
