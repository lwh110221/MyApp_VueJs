// 用户认证相关接口
export const AUTH_ENDPOINTS = {
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  CHANGE_PASSWORD: '/users/password',
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  UPDATE_AVATAR: '/users/profile/avatar',
  GENERATE_CAPTCHA: '/captcha/generate'
}

// 动态相关接口
export const MOMENT_ENDPOINTS = {
  CREATE: '/moments',
  GET_USER_MOMENTS: (userId = '') => `/moments/user/${userId}`,
  DELETE: (momentId) => `/moments/${momentId}`
}

// 日志相关接口
export const LOGGER_ENDPOINTS = {
  LOG_ERROR: 'http://localhost:3030/log'
}

// API 版本
export const API_VERSION = 'v1'

// 导出所有端点
export const ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  MOMENT: MOMENT_ENDPOINTS,
  LOGGER: LOGGER_ENDPOINTS
}
