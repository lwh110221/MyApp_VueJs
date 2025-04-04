import API from '../http'

class AiService {
  /**
   * 创建新会话
   * @returns {Promise<string>} 返回创建的会话ID
   */
  async createSession() {
    try {
      const response = await API.post('/ai/sessions')
      return response.data.sessionId
    } catch (error) {
      throw new Error('创建会话失败: ' + (error.message || '未知错误'))
    }
  }

  /**
   * 获取用户所有会话列表
   * @returns {Promise<Array>} 会话列表
   */
  async getSessions() {
    try {
      const response = await API.get('/ai/sessions')
      return response.data.sessions || []
    } catch (error) {
      console.error('获取会话列表失败:', error)
      return []
    }
  }

  /**
   * 获取指定会话的聊天记录
   * @param {string} sessionId 会话ID
   * @returns {Promise<Array>} 聊天消息数组
   */
  async getSessionMessages(sessionId) {
    try {
      const response = await API.get(`/ai/sessions/${sessionId}/messages`)
      return response.data.messages || []
    } catch (error) {
      console.error('获取会话消息失败:', error)
      return []
    }
  }

  /**
   * 删除指定会话
   * @param {string} sessionId 会话ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteSession(sessionId) {
    try {
      await API.delete(`/ai/sessions/${sessionId}`)
      return true
    } catch (error) {
      console.error('删除会话失败:', error)
      return false
    }
  }

  /**
   * 清空指定会话的消息
   * @param {string} sessionId 会话ID
   * @returns {Promise<boolean>} 是否成功
   */
  async clearSessionMessages(sessionId) {
    try {
      await API.post(`/ai/sessions/${sessionId}/clear`)
      return true
    } catch (error) {
      console.error('清空会话消息失败:', error)
      return false
    }
  }

  /**
   * 发送聊天消息并获取流式响应
   * @param {string} message 用户消息
   * @param {string} sessionId 会话ID（可选，不提供则创建新会话）
   * @returns {Object} 包含EventSource实例和中止方法的对象
   */
  sendChatStream(message, sessionId = null) {
    // 获取JWT令牌
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未授权，请先登录')
    }

    // 构建请求参数
    const messages = [{ role: 'user', content: message }]
    const encodedMessages = encodeURIComponent(JSON.stringify(messages))

    // 创建EventSource URL
    const baseApiUrl = import.meta.env.VITE_BASE_API_URL || ''
    let url = `${baseApiUrl}/ai/chat/stream?messages=${encodedMessages}&token=${token}`

    // 如果提供了会话ID，添加到URL
    if (sessionId) {
      url += `&sessionId=${sessionId}`
    }

    // 创建EventSource实例
    const eventSource = new EventSource(url)

    // 提供中止方法
    const abort = () => {
      if (eventSource) {
        eventSource.close()
      }
    }

    // 返回EventSource实例和中止方法
    return {
      eventSource,
      abort
    }
  }
}

export default new AiService()
