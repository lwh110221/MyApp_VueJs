import authService from './services/auth.service'
import momentService from './services/moment.service'
import loggerService from './services/logger.service'
import messageService from './services/message.service'

// 导出服务
export {
  authService,
  momentService,
  loggerService,
  messageService
}

// 导出基础 API 实例，以便在特殊情况下直接使用
export { default as API } from './http'

// 导出常量
export const API_CONFIG = {
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
  TIMEOUT: 15000
}

