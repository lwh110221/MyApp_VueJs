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

// 用户相关接口
export const USER_ENDPOINTS = {
  GET_POINTS: '/users/points',
  GET_POINT_RECORDS: '/users/points/records',
  GET_USER_PROFILE: (userId) => `/users/${userId}/profile`,
  FOLLOW_USER: (userId) => `/users/${userId}/follow`,
  UNFOLLOW_USER: (userId) => `/users/${userId}/unfollow`,
  GET_FOLLOWING_LIST: (userId) => `/users/${userId}/following`,
  GET_FOLLOWERS_LIST: (userId) => `/users/${userId}/followers`
}

// 身份认证相关接口
export const IDENTITY_ENDPOINTS = {
  GET_TYPES: '/identity/types',
  GET_MY_IDENTITIES: '/identity/my',
  APPLY_CERTIFICATION: '/identity/apply'
}

// 动态相关接口
export const MOMENT_ENDPOINTS = {
  CREATE: '/moments',
  GET_USER_MOMENTS: (userId = '') => `/moments/user/${userId}`,
  DELETE: (momentId) => `/moments/${momentId}`
}

// 专家求助相关接口
export const HELP_ENDPOINTS = {
  GET_CATEGORIES: '/help/categories',
  GET_POSTS: '/help/posts',
  GET_POST_DETAIL: (postId) => `/help/posts/${postId}`,
  CREATE_POST: '/help/posts',
  UPDATE_POST_STATUS: (postId) => `/help/posts/${postId}/status`,
  GET_ANSWERS: (postId) => `/help/posts/${postId}/answers`,
  CREATE_ANSWER: (postId) => `/help/posts/${postId}/answers`,
  ACCEPT_ANSWER: (postId, answerId) => `/help/posts/${postId}/answers/${answerId}/accept`,
  DELETE_ANSWER: (postId, answerId) => `/help/posts/${postId}/answers/${answerId}`,
  UPLOAD_IMAGES: '/help/upload'
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
  USER: USER_ENDPOINTS,
  IDENTITY: IDENTITY_ENDPOINTS,
  MOMENT: MOMENT_ENDPOINTS,
  HELP: HELP_ENDPOINTS,
  LOGGER: LOGGER_ENDPOINTS
}
