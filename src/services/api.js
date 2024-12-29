import axios from 'axios'
import router from '../router'

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
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // 如果是401错误且不是重试请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 清除本地存储的认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      // 跳转到登录页
      router.push('/login')
      return Promise.reject(error)
    }

    // 如果请求失败且未超过最大重试次数
    if (error.code === 'ECONNABORTED' && !originalRequest._retryCount) {
      originalRequest._retryCount = 0
    }

    if (originalRequest._retryCount < MAX_RETRIES &&
        (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
      originalRequest._retryCount++

      // 延迟重试
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return api(originalRequest)
    }

    // 处理其他错误
    const errorMessage = error.response?.data?.message || '服务器错误'
    console.error('API Error:', errorMessage)
    return Promise.reject(error)
  }
)

export default api
