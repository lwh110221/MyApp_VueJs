import http from '../http'
import { USER_ENDPOINTS } from '../endpoints'

/**
 * 用户服务
 */
class UserService {
  /**
   * 获取用户积分
   * @returns {Promise<Object>} 积分信息
   */
  async getPoints() {
    try {
      const response = await http.get(USER_ENDPOINTS.GET_POINTS)
      return response
    } catch (error) {
      console.error('获取积分失败:', error)
      throw error
    }
  }

  /**
   * 获取用户积分记录
   * @param {Object} params 查询参数
   * @param {number} [params.page=1] 页码
   * @param {number} [params.limit=10] 每页数量
   * @returns {Promise<Object>} 积分记录列表和分页信息
   */
  async getPointRecords(params = { page: 1, limit: 10 }) {
    try {
      const response = await http.get(USER_ENDPOINTS.GET_POINT_RECORDS, params)
      return response
    } catch (error) {
      console.error('获取积分记录失败:', error)
      throw error
    }
  }

  /**
   * 获取用户主页资料
   * @param {number|string} userId 用户ID
   * @returns {Promise<Object>} 用户公开资料
   */
  async getUserProfile(userId) {
    try {
      const response = await http.get(USER_ENDPOINTS.GET_USER_PROFILE(userId))
      return response
    } catch (error) {
      console.error('获取用户资料失败:', error)
      throw error
    }
  }

  /**
   * 关注用户
   * @param {number|string} userId 要关注的用户ID
   * @returns {Promise<Object>} 关注结果
   */
  async followUser(userId) {
    try {
      const response = await http.post(USER_ENDPOINTS.FOLLOW_USER(userId))
      return response
    } catch (error) {
      console.error('关注用户失败:', error)
      throw error
    }
  }

  /**
   * 取消关注用户
   * @param {number|string} userId 要取消关注的用户ID
   * @returns {Promise<Object>} 取消关注结果
   */
  async unfollowUser(userId) {
    try {
      const response = await http.post(USER_ENDPOINTS.UNFOLLOW_USER(userId))
      return response
    } catch (error) {
      console.error('取消关注失败:', error)
      throw error
    }
  }

  /**
   * 获取用户关注列表
   * @param {number|string} userId 用户ID
   * @param {Object} params 查询参数
   * @param {number} [params.page=1] 页码
   * @param {number} [params.limit=10] 每页数量
   * @returns {Promise<Object>} 关注列表和分页信息
   */
  async getFollowingList(userId, params = { page: 1, limit: 10 }) {
    try {
      const response = await http.get(USER_ENDPOINTS.GET_FOLLOWING_LIST(userId), params)
      return response
    } catch (error) {
      console.error('获取关注列表失败:', error)
      throw error
    }
  }

  /**
   * 获取用户粉丝列表
   * @param {number|string} userId 用户ID
   * @param {Object} params 查询参数
   * @param {number} [params.page=1] 页码
   * @param {number} [params.limit=10] 每页数量
   * @returns {Promise<Object>} 粉丝列表和分页信息
   */
  async getFollowersList(userId, params = { page: 1, limit: 10 }) {
    try {
      const response = await http.get(USER_ENDPOINTS.GET_FOLLOWERS_LIST(userId), params)
      return response
    } catch (error) {
      console.error('获取粉丝列表失败:', error)
      throw error
    }
  }
}

export default new UserService()
