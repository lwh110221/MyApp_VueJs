import http from '../http'
import { CHAT_ENDPOINTS } from '../endpoints'

/**
 * 聊天服务
 */
class ChatService {
  /**
   * 获取聊天会话列表
   * @returns {Promise<Object>} 聊天会话列表
   */
  async getSessions() {
    try {
      const response = await http.get(CHAT_ENDPOINTS.GET_SESSIONS)
      return response
    } catch (error) {
      console.error('获取聊天会话列表失败:', error)
      throw error
    }
  }

  /**
   * 获取与特定用户的聊天历史
   * @param {number|string} partnerId 对话伙伴的用户ID
   * @param {Object} params 查询参数
   * @param {number} [params.page=1] 页码
   * @param {number} [params.limit=20] 每页数量
   * @returns {Promise<Object>} 聊天历史记录
   */
  async getChatHistory(partnerId, params = { page: 1, limit: 20 }) {
    try {
      const response = await http.get(CHAT_ENDPOINTS.GET_HISTORY(partnerId), params)
      return response
    } catch (error) {
      console.error('获取聊天历史失败:', error)
      throw error
    }
  }

  /**
   * 发送消息
   * @param {Object} messageData 消息数据
   * @param {number} messageData.receiverId 接收者ID
   * @param {string} messageData.content 消息内容
   * @param {number} [messageData.contentType=0] 消息类型：0-文本(默认)，1-图片
   * @param {string} [messageData.mediaUrl] 媒体文件URL，仅当contentType不为0时需要
   * @returns {Promise<Object>} 发送结果
   */
  async sendMessage(messageData) {
    try {
      const response = await http.post(CHAT_ENDPOINTS.SEND_MESSAGE, messageData)
      return response
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  /**
   * 上传聊天图片
   * @param {FormData} formData 包含图片的FormData对象
   * @returns {Promise<Object>} 上传结果
   */
  async uploadImage(formData) {
    try {
      const response = await http.upload(CHAT_ENDPOINTS.UPLOAD_IMAGE, formData)
      return response
    } catch (error) {
      console.error('上传图片失败:', error)
      throw error
    }
  }

  /**
   * 标记会话消息为已读
   * @param {number|string} sessionId 会话ID
   * @returns {Promise<Object>} 标记结果
   */
  async markSessionAsRead(sessionId) {
    try {
      const response = await http.put(CHAT_ENDPOINTS.MARK_READ(sessionId))
      return response
    } catch (error) {
      console.error('标记消息已读失败:', error)
      throw error
    }
  }

  /**
   * 获取未读消息数量
   * @returns {Promise<Object>} 未读消息数量
   */
  async getUnreadCount() {
    try {
      const response = await http.get(CHAT_ENDPOINTS.GET_UNREAD)
      return response
    } catch (error) {
      console.error('获取未读消息数量失败:', error)
      throw error
    }
  }

  /**
   * 删除会话
   * @param {number|string} sessionId 会话ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteSession(sessionId) {
    try {
      const response = await http.delete(CHAT_ENDPOINTS.DELETE_SESSION(sessionId))
      return response
    } catch (error) {
      console.error('删除会话失败:', error)
      throw error
    }
  }

  /**
   * 搜索聊天记录
   * @param {Object} params 搜索参数
   * @param {string} params.keyword 搜索关键词
   * @param {number} [params.page=1] 页码
   * @param {number} [params.limit=20] 每页数量
   * @returns {Promise<Object>} 搜索结果
   */
  async searchMessages(params) {
    try {
      const response = await http.get(CHAT_ENDPOINTS.SEARCH_MESSAGES, params)
      return response
    } catch (error) {
      console.error('搜索聊天记录失败:', error)
      throw error
    }
  }
}

export default new ChatService()
