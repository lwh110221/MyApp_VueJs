import api from './index.js'

export const momentApi = {
  // 发布动态
  createMoment(data) {
    const formData = new FormData()
    if (data.content) {
      formData.append('content', data.content)
    }
    if (data.images && data.images.length > 0) {
      data.images.forEach(image => {
        formData.append('images', image)
      })
    }
    return api.post('/api/moments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取用户动态列表
  getMoments(userId, page = 1, limit = 10) {
    return api.get(`/api/moments/user/${userId || ''}`, {
      params: { page, limit }
    })
  },

  // 删除动态
  deleteMoment(momentId) {
    return api.delete(`/api/moments/${momentId}`)
  }
} 