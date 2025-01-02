import { defineStore } from 'pinia'
import { authService, messageService } from '../api'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {
      id: '',
      username: '',
      email: '',
      profile_picture: '',
      bio: '',
      points: 0,
      created_at: '',
      status: 1
    },
    isLoggedIn: !!localStorage.getItem('token'),
    loading: false
  }),

  getters: {
    userAvatar: (state) => {
      if (!state.user.profile_picture) return '/default-avatar.png'
      if (state.user.profile_picture.startsWith('http')) {
        return state.user.profile_picture
      }
      return `${import.meta.env.VITE_API_URL.replace('/api', '')}${state.user.profile_picture}`
    },

    // 用于表单显示的用户信息
    userProfile: (state) => ({
      ...state.user,
      points: state.user.points || 0,
      bio: state.user.bio || ''
    })
  },

  actions: {
    // 检查认证状态
    async checkAuth() {
      const token = localStorage.getItem('token')
      this.isLoggedIn = !!token
      if (this.isLoggedIn) {
        await this.fetchUserInfo()
      } else {
        this.clearAuth()
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      if (this.loading) return

      try {
        this.loading = true
        const userInfo = await authService.getProfile()
        if (!userInfo || !userInfo.id) {
          throw new Error('未获取到用户信息')
        }
        this.setUser(userInfo)
      } catch (error) {
        console.error('获取用户信息失败:', error)
        if (error.response?.status === 401) {
          this.handleUnauthorized()
        } else {
          messageService.error(error.response?.data?.message || error.message || '获取用户信息失败')
        }
      } finally {
        this.loading = false
      }
    },

    // 登录
    async login(credentials) {
      try {
        this.loading = true
        const response = await authService.login(credentials)
        this.setAuthData(response.data)
        messageService.success('登录成功')
        return response
      } finally {
        this.loading = false
      }
    },

    // 注册
    async register(userData) {
      try {
        this.loading = true
        const response = await authService.register(userData)
        messageService.success('注册成功，请登录')
        return response
      } finally {
        this.loading = false
      }
    },

    // 更新用户信息
    async updateProfile(profileData) {
      try {
        this.loading = true
        const response = await authService.updateProfile(profileData)
        if (profileData.bio !== undefined) {
          this.user.bio = profileData.bio
        }
        return response
      } finally {
        this.loading = false
      }
    },

    // 更新头像
    async updateAvatar(formData) {
      try {
        this.loading = true
        const response = await authService.updateAvatar(formData)
        if (response.avatarUrl) {
          this.user.profile_picture = response.avatarUrl
        }
        return response
      } finally {
        this.loading = false
      }
    },

    // 设置用户信息
    setUser(user) {
      this.user = {
        ...this.user,
        ...user
      }
      this.isLoggedIn = true
      localStorage.setItem('username', user.username)
      localStorage.setItem('email', user.email)
    },

    // 设置认证数据
    setAuthData(data) {
      localStorage.setItem('token', data.token)
      this.setUser(data)
    },

    // 清除认证数据
    clearAuth() {
      this.user = {
        id: '',
        username: '',
        email: '',
        profile_picture: '',
        bio: '',
        points: 0,
        created_at: '',
        status: 1
      }
      this.isLoggedIn = false
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('email')
    },

    // 处理未授权错误
    handleUnauthorized() {
      this.clearAuth()
      messageService.error('登录已过期，请重新登录')
      router.push('/login')
    },

    // 退出登录
    logout() {
      this.clearAuth()
      messageService.success('退出登录成功')
      router.push('/login')
    }
  }
})
