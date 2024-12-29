const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const app = express()

// 启用 CORS 和 JSON 解析
app.use(cors())
app.use(express.json())

// 确保日志目录存在
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir)
}

// 写入错误日志的接口
app.post('/log', (req, res) => {
  const { message, context, stack, timestamp } = req.body
  const logPath = path.join(logsDir, 'error.log')

  const logEntry = `[${timestamp}] ${context}\nError: ${message}\nStack: ${stack || 'No stack trace'}\n\n`

  fs.appendFile(logPath, logEntry, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to log file:', err)
      res.status(500).json({ error: 'Failed to write log' })
      return
    }
    res.json({ success: true })
  })
})

const PORT = 3030
app.listen(PORT, () => {
  console.log(`Logger server running on port ${PORT}`)
})

