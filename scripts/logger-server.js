const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const app = express()

app.use(cors())
app.use(express.json())

const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir)
}

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

