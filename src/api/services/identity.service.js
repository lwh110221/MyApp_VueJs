import http from '../http'
import { IDENTITY_ENDPOINTS } from '../endpoints'

/**
 * 身份认证服务
 */
class IdentityService {
  /**
   * 获取所有可用的身份类型
   * @returns {Promise<Array>} 身份类型列表
   */
  async getIdentityTypes() {
    try {
      const response = await http.get(IDENTITY_ENDPOINTS.GET_TYPES)
      return response
    } catch (error) {
      console.error('获取身份类型失败:', error)
      throw error
    }
  }

  /**
   * 获取当前用户的所有身份
   * @returns {Promise<Array>} 用户身份列表
   */
  async getMyIdentities() {
    try {
      const response = await http.get(IDENTITY_ENDPOINTS.GET_MY_IDENTITIES)
      return response
    } catch (error) {
      console.error('获取用户身份失败:', error)
      throw error
    }
  }

  /**
   * 申请身份认证
   * @param {Object} data 认证数据
   * @param {string} data.identityType 身份类型编码
   * @param {Object} data.certificationData 认证资料
   * @returns {Promise<Object>} 申请结果
   */
  async applyCertification(data) {
    try {
      const response = await http.post(IDENTITY_ENDPOINTS.APPLY_CERTIFICATION, data)
      return response
    } catch (error) {
      console.error('申请身份认证失败:', error)
      throw error
    }
  }
}

export default new IdentityService()
