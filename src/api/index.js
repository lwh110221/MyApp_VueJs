import authService from './services/auth.service'
import momentService from './services/moment.service'
import loggerService from './services/logger.service'
import messageService from './services/message.service'
import userService from './services/user.service'
import identityService from './services/identity.service'
import helpService from './services/help.service'
import productService from './services/product.service'
import cartService from './services/cart.service'
import orderService from './services/order.service'
import chatService from './services/chat.service'
import aiService from './services/ai.service'

// 导出服务
export {
  authService,
  momentService,
  loggerService,
  messageService,
  userService,
  identityService,
  helpService,
  productService,
  cartService,
  orderService,
  chatService,
  aiService
}

// 导出基础 API 实例，以便在特殊情况下直接使用
export { default as API } from './http'

// 导出常量
export const API_CONFIG = {
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
  TIMEOUT: 15000
}

