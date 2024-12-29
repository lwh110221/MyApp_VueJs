import axios from 'axios'
import router from '../router'
import { logger } from '../utils/logger'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // 15秒超时
  withCredentials: true
})

// 请求重试配置
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1秒

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`
  }

  // 添加请求时间戳
  config.metadata = { startTime: new Date() }

  return config
}, error => {
  logger.logError(error, 'Request Interceptor Error')
  return Promise.reject(error)
})

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 记录请求耗时
    const duration = new Date() - response.config.metadata.startTime
    if (duration > 1000) { // 如果请求超过1秒，记录到日志
      logger.logError(
        new Error('Slow API Response'),
        `URL: ${response.config.url}, Duration: ${duration}ms`
      )
    }
    return response
  },
  async error => {
    const originalRequest = error.config

    // 记录API错误
    logger.logError(error, `API Error: ${originalRequest.url}`)

    // 如果是401错误且不是重试请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 清除本地存储的认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('email')

      // 如果不是登录页面，则跳转到登录页
      if (!originalRequest.url.includes('/login')) {
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }
      return Promise.reject(error)
    }

    // 如果请求失败且未超过最大重试次数
    if (error.code === 'ECONNABORTED' && !originalRequest._retryCount) {
      originalRequest._retryCount = 0
    }

    if (originalRequest._retryCount < MAX_RETRIES &&
        (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
      originalRequest._retryCount++

      // 记录重试信息
      logger.logError(
        error,
        `Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}): ${originalRequest.url}`
      )

      // 延迟重试
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return api(originalRequest)
    }

    // 处理特定的错误状态码
    switch (error.response?.status) {
      case 403:
        router.push('/403')
        break
      case 404:
        router.push('/404')
        break
      case 500:
        router.push('/500')
        break
    }

    return Promise.reject(error)
  }
)

export default api
