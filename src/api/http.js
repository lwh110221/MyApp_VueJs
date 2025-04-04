import axios from 'axios'
import router from '../router'
import { logger } from '../utils/logger'
import { API_CONFIG, RETRY_CONFIG, HTTP_STATUS, CONTENT_TYPES, getApiBaseUrl } from './axiosConfig'

class API {
  constructor() {
    this.instance = axios.create(API_CONFIG)
    this.setupInterceptors()
  }

  setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      config => {
        // 添加请求时间戳
        config.metadata = { startTime: new Date() }

        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token.trim()}`
        }

        return config
      },
      error => {
        logger.logError(error, 'Request Interceptor Error')
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      response => {
        // 记录请求耗时
        const duration = new Date() - response.config.metadata.startTime
        if (duration > 1000) {
          logger.logError(
            new Error('Slow API Response'),
            `URL: ${response.config.url}, Duration: ${duration}ms`
          )
        }

        // 处理 DELETE 请求的特殊情况
        if (response.config.method === 'delete') {
          return response.data || { message: '操作成功' }
        }

        // 直接返回响应数据，不再解析data字段
        return response.data
      },
      async error => {
        const originalRequest = error.config

        // 记录API错误
        logger.logError(error, `API Error: ${originalRequest.url}`)

        // 处理401错误
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          localStorage.removeItem('email')

          if (!originalRequest.url.includes('/login')) {
            router.push({
              path: '/login',
              query: { redirect: router.currentRoute.value.fullPath }
            })
          }
          return Promise.reject(error)
        }

        // 请求重试逻辑
        if (!originalRequest._retryCount) {
          originalRequest._retryCount = 0
        }

        if (originalRequest._retryCount < RETRY_CONFIG.MAX_RETRIES &&
            (error.code === 'ECONNABORTED' || error.response?.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR)) {
          originalRequest._retryCount++

          logger.logError(
            error,
            `Retrying request (${originalRequest._retryCount}/${RETRY_CONFIG.MAX_RETRIES}): ${originalRequest.url}`
          )

          await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.RETRY_DELAY))
          return this.instance(originalRequest)
        }

        // 处理特定错误状态码
        switch (error.response?.status) {
          case HTTP_STATUS.FORBIDDEN:
            router.push('/403')
            break
          case HTTP_STATUS.NOT_FOUND:
            router.push('/404')
            break
          case HTTP_STATUS.INTERNAL_SERVER_ERROR:
            router.push('/500')
            break
        }

        return Promise.reject(error)
      }
    )
  }

  // 基础请求方法
  async request(method, url, data = null, config = {}) {
    try {
      const requestConfig = {
        method,
        url,
        headers: {
          'Content-Type': CONTENT_TYPES.JSON,
          'Accept': CONTENT_TYPES.JSON,
          ...config.headers
        },
        ...config
      }

      // 根据请求方法处理数据
      if (method.toLowerCase() === 'get') {
        requestConfig.params = data
      } else if (data !== null) {
        requestConfig.data = data
      }

      const response = await this.instance(requestConfig)
      return response
    } catch (error) {
      throw error
    }
  }

  // GET 请求
  get(url, params = {}, config = {}) {
    return this.request('get', url, params, config)
  }

  // POST 请求
  post(url, data = {}, config = {}) {
    return this.request('post', url, data, config)
  }

  // PUT 请求
  put(url, data = {}, config = {}) {
    // 检查是否是 FormData
    const isFormData = data instanceof FormData
    return this.request('put', url, data, {
      ...config,
      headers: {
        'Content-Type': isFormData ? CONTENT_TYPES.FORM_DATA : CONTENT_TYPES.JSON,
        ...config.headers
      }
    })
  }

  // PATCH 请求
  patch(url, data = {}, config = {}) {
    return this.request('patch', url, data, {
      ...config,
      headers: {
        'Content-Type': CONTENT_TYPES.JSON,
        ...config.headers
      }
    })
  }

  // DELETE 请求
  delete(url, config = {}) {
    return this.request('delete', url, null, {
      ...config,
      headers: {
        'Content-Type': CONTENT_TYPES.JSON,
        ...config.headers
      }
    })
  }

  // 文件上传
  upload(url, formData, config = {}) {
    return this.request('post', url, formData, {
      ...config,
      headers: {
        'Content-Type': CONTENT_TYPES.FORM_DATA,
        ...config.headers
      }
    })
  }
}

export default new API()
