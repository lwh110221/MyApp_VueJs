import { defineStore } from 'pinia'
import { userService, messageService } from '../api'

export const useUserStore = defineStore('user', {
  state: () => ({
    points: {
      total: 0,
      records: []
    },
    pointsLoading: false,
    pointRecordsLoading: false,

    // 用户关系
    following: [],
    followers: [],
    followingLoading: false,
    followersLoading: false,

    // 用户资料
    userProfile: null,
    userProfileLoading: false,

    // 分页信息
    pagination: {
      pointRecords: {
        total: 0,
        page: 1,
        limit: 10
      },
      following: {
        total: 0,
        page: 1,
        limit: 10
      },
      followers: {
        total: 0,
        page: 1,
        limit: 10
      }
    }
  }),

  actions: {
    /**
     * 获取用户积分
     */
    async fetchPoints() {
      try {
        this.pointsLoading = true
        const response = await userService.getPoints()
        this.points.total = response.points || 0
        return response
      } catch (error) {
        messageService.error('获取积分失败')
        throw error
      } finally {
        this.pointsLoading = false
      }
    },

    /**
     * 获取用户积分记录
     * @param {Object} params 分页参数
     */
    async fetchPointRecords(params = { page: 1, limit: 10 }) {
      try {
        this.pointRecordsLoading = true
        const response = await userService.getPointRecords(params)

        this.points.records = response.records || []
        this.pagination.pointRecords = {
          total: response.total || 0,
          page: params.page,
          limit: params.limit
        }

        return response
      } catch (error) {
        messageService.error('获取积分记录失败')
        throw error
      } finally {
        this.pointRecordsLoading = false
      }
    },

    /**
     * 获取用户资料
     * @param {number|string} userId 用户ID
     */
    async fetchUserProfile(userId) {
      try {
        this.userProfileLoading = true
        const response = await userService.getUserProfile(userId)
        this.userProfile = response
        return response
      } catch (error) {
        messageService.error('获取用户资料失败')
        throw error
      } finally {
        this.userProfileLoading = false
      }
    },

    /**
     * 关注用户
     * @param {number|string} userId 要关注的用户ID
     */
    async followUser(userId) {
      try {
        const response = await userService.followUser(userId)
        messageService.success('关注成功')
        return response
      } catch (error) {
        messageService.error('关注失败')
        throw error
      }
    },

    /**
     * 取消关注用户
     * @param {number|string} userId 要取消关注的用户ID
     */
    async unfollowUser(userId) {
      try {
        const response = await userService.unfollowUser(userId)
        messageService.success('已取消关注')
        return response
      } catch (error) {
        messageService.error('取消关注失败')
        throw error
      }
    },

    /**
     * 获取关注列表
     * @param {number|string} userId 用户ID
     * @param {Object} params 分页参数
     */
    async fetchFollowingList(userId, params = { page: 1, limit: 10 }) {
      try {
        this.followingLoading = true
        const response = await userService.getFollowingList(userId, params)

        this.following = response.following || []
        this.pagination.following = {
          total: response.total || 0,
          page: params.page,
          limit: params.limit
        }

        return response
      } catch (error) {
        messageService.error('获取关注列表失败')
        throw error
      } finally {
        this.followingLoading = false
      }
    },

    /**
     * 获取粉丝列表
     * @param {number|string} userId 用户ID
     * @param {Object} params 分页参数
     */
    async fetchFollowersList(userId, params = { page: 1, limit: 10 }) {
      try {
        this.followersLoading = true
        const response = await userService.getFollowersList(userId, params)

        this.followers = response.followers || []
        this.pagination.followers = {
          total: response.total || 0,
          page: params.page,
          limit: params.limit
        }

        return response
      } catch (error) {
        messageService.error('获取粉丝列表失败')
        throw error
      } finally {
        this.followersLoading = false
      }
    },

    // 清除用户资料（切换用户时）
    clearUserProfile() {
      this.userProfile = null
    }
  }
})
