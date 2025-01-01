<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex justify-between items-center py-4">
          <router-link
            to="/"
            class="text-xl font-semibold text-gray-800 hover:text-gray-600"
          >
            我的应用
          </router-link>
          <div class="flex items-center space-x-4">
            <template v-if="!isLoggedIn">
              <router-link
                to="/login"
                class="text-gray-600 hover:text-gray-800"
              >
                登录
              </router-link>
              <router-link
                to="/register"
                class="text-gray-600 hover:text-gray-800"
              >
                注册
              </router-link>
            </template>

            <!-- 用户头像下拉菜单 -->
            <div v-else class="relative">
              <button
                @click="toggleDropdown"
                class="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  :src="userAvatar || '/default-avatar.png'"
                  class="w-8 h-8 rounded-full object-cover"
                  alt="用户头像"
                >
                <span class="text-gray-700">{{ username }}</span>
                <svg
                  class="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- 下拉菜单 -->
              <div
                v-show="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showDropdown = false"
                >
                  个人中心
                </router-link>
                <router-link
                  to="/change-password"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showDropdown = false"
                >
                  修改密码
                </router-link>
                <button
                  @click="logout"
                  class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <router-view @login-success="checkAuth"></router-view>
  </div>
</template>

<script>
import { authService, messageService } from './api'

export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,
      username: '',
      email: '',
      userAvatar: '',
      showDropdown: false,
      loading: false
    }
  },
  created() {
    this.checkAuth()
    window.addEventListener('storage', this.checkAuth)
    document.addEventListener('click', this.handleClickOutside)
  },
  mounted() {
    this.checkAuth()
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkAuth)
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async checkAuth() {
      const token = localStorage.getItem('token')
      this.isLoggedIn = !!token
      if (this.isLoggedIn) {
        await this.fetchUserInfo()
      } else {
        this.clearAuthData()
      }
    },
    async fetchUserInfo() {
      if (this.loading) return

      try {
        this.loading = true
        const userInfo = await authService.getProfile()
        console.log('App userInfo:', userInfo)

        if (!userInfo || !userInfo.id) {
          throw new Error('未获取到用户信息')
        }

        // 更新头像
        const avatarPath = userInfo.profile_picture
        this.userAvatar = avatarPath
          ? avatarPath.startsWith('http')
            ? avatarPath
            : `${import.meta.env.VITE_API_URL.replace('/api', '')}${avatarPath}`
          : '/default-avatar.png'

        // 更新用户信息
        this.username = userInfo.username
        this.email = userInfo.email

        // 更新本地存储
        localStorage.setItem('username', this.username)
        localStorage.setItem('email', this.email)
      } catch (error) {
        console.error('获取用户信息失败:', error)

        // 如果是 API 错误
        if (error.response) {
          if (error.response.status === 401) {
            this.clearAuthData()
            messageService.error('登录已过期，请重新登录')
            this.$router.push('/login')
          } else {
            messageService.error(error.response.data?.message || '获取用户信息失败')
          }
        } else {
          // 如果是其他错误（如未获取到用户信息）
          this.clearAuthData()
          messageService.error(error.message || '获取用户信息失败')
          this.$router.push('/login')
        }
      } finally {
        this.loading = false
      }
    },
    clearAuthData() {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('email')
      this.isLoggedIn = false
      this.username = ''
      this.email = ''
      this.userAvatar = ''
      this.showDropdown = false
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    handleClickOutside(event) {
      const dropdown = this.$el.querySelector('.relative')
      if (dropdown && !dropdown.contains(event.target)) {
        this.showDropdown = false
      }
    },
    logout() {
      // 清除本地存储和状态
      this.clearAuthData()
      messageService.success('退出登录成功')
      // 重定向到登录页
      this.$router.push('/login')
    }
  },
  watch: {
    '$route': {
      handler() {
        this.checkAuth()
      },
      immediate: true
    }
  }
}
</script>

<style>
.relative {
  position: relative;
}

.absolute {
  position: absolute;
  z-index: 50;
}
</style>
