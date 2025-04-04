// Axios 基础配置
export const getApiBaseUrl = () => {
  // 如果是本地开发环境，使用环境变量中的API URL
  const configuredUrl = import.meta.env.VITE_BASE_API_URL;

  // 检查是否为localhost地址
  if (configuredUrl.includes('localhost') && window.location.hostname !== 'localhost') {
    // 如果当前不是在localhost访问，则替换为当前主机名
    const currentHost = window.location.hostname;
    const port = configuredUrl.split(':')[2].split('/')[0]; // 提取端口号
    return `http://${currentHost}:${port}/api`;
  }

  return configuredUrl;
};

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// 请求重试配置
export const RETRY_CONFIG = {
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000
}

// 响应状态码配置
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

// 请求方法配置
export const REQUEST_METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete'
}

// 内容类型配置
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded'
}
