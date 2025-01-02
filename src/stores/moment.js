import { defineStore } from 'pinia'
import { momentService, messageService } from '../api'

export const useMomentStore = defineStore('moment', {
  state: () => ({
    moments: [],
    currentPage: 1,
    hasMore: true,
    loading: false,
    pageSize: 10
  }),

  actions: {
    // 获取动态列表
    async fetchMoments(userId, page = 1) {
      if (this.loading) return

      try {
        this.loading = true
        console.log('Fetching moments:', { userId, page })

        const newMoments = await momentService.getMoments(userId, page)
        if (!Array.isArray(newMoments)) {
          throw new Error('获取动态数据格式错误')
        }

        // 更新动态列表
        if (page === 1) {
          this.moments = newMoments
        } else {
          this.moments = [...this.moments, ...newMoments]
        }

        // 更新分页信息
        this.currentPage = page
        this.hasMore = newMoments.length === this.pageSize
      } catch (error) {
        console.error('获取动态失败:', error)
        messageService.error(error.message || '获取动态失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 创建动态
    async createMoment(data) {
      if (this.loading) return

      try {
        this.loading = true
        console.log('Creating moment:', data)

        const response = await momentService.createMoment(data)
        console.log('Create moment response:', response)

        // 添加新动态到列表开头
        if (response.moment) {
          this.moments.unshift(response.moment)
        }

        messageService.success(response.message || '动态发布成功')
        return response
      } catch (error) {
        console.error('发布动态失败:', error)
        messageService.error(error.response?.data?.message || error.message || '发布动态失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 删除动态
    async deleteMoment(momentId) {
      if (this.loading) return

      try {
        this.loading = true
        console.log('Deleting moment:', momentId)

        const response = await momentService.deleteMoment(momentId)
        console.log('Delete moment response:', response)

        // 从列表中移除动态
        this.moments = this.moments.filter(m => m.id !== momentId)
        messageService.success(response.message || '动态已删除')
      } catch (error) {
        console.error('删除动态失败:', error)
        if (error.response?.status === 404) {
          messageService.error('动态不存在或已被删除')
          // 从列表中移除不存在的动态
          this.moments = this.moments.filter(m => m.id !== momentId)
        } else {
          messageService.error(error.response?.data?.message || '删除动态失败')
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    // 重置状态
    reset() {
      this.moments = []
      this.currentPage = 1
      this.hasMore = true
      this.loading = false
    }
  }
})
