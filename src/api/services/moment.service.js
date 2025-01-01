import API from '../API'

class MomentService {
  /**
   * 发布动态
   * @param {Object} data - 动态数据
   * @param {string} data.content - 动态内容
   * @param {File[]} [data.images] - 动态图片文件列表
   * @returns {Promise<Object>} 返回发布结果
   */
  async createMoment(data) {
    try {
      console.log('Creating moment with data:', data)  // 添加日志

      // 如果有图片，使用 FormData
      if (data.images && data.images.length > 0) {
        const formData = new FormData()
        formData.append('content', data.content || '')
        data.images.forEach(image => {
          formData.append('images', image)
        })
        return API.upload('/moments', formData)
      }

      // 如果没有图片，直接发送 JSON
      return API.post('/moments', {
        content: data.content || ''
      })
    } catch (error) {
      console.error('Create moment error:', error)
      throw error
    }
  }

  /**
   * 获取用户动态列表
   * @param {string} [userId] - 用户ID，不传则获取当前用户的动态
   * @param {number} [page=1] - 页码
   * @param {number} [limit=10] - 每页条数
   * @returns {Promise<Array>} 动态列表
   */
  async getMoments(userId, page = 1, limit = 10) {
    try {
      const response = await API.get(`/moments/user/${userId || ''}`, {
        page,
        limit
      })
      // API.js 的响应拦截器已经返回了 response.data
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Get moments error:', error)
      throw error
    }
  }

  /**
   * 删除动态
   * @param {string|number} momentId - 动态ID
   * @returns {Promise<Object>} 返回删除结果
   */
  async deleteMoment(momentId) {
    try {
      const response = await API.delete(`/moments/${momentId}`)
      return response || { message: '动态已删除' }
    } catch (error) {
      console.error('Delete moment error:', error)
      throw error
    }
  }
}

export default new MomentService()

