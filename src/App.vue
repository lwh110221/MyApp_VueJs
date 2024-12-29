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
import api from './services/api'

export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,
      username: '',
      email: '',
      userAvatar: '',
      showDropdown: false
    }
  },
  created() {
    this.checkAuth()
    window.addEventListener('storage', this.checkAuth)
    document.addEventListener('click', this.handleClickOutside)
  },
  mounted() {
    this.checkAuth()
    if (this.isLoggedIn) {
      this.fetchUserInfo()
    }
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkAuth)
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    async checkAuth() {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      const email = localStorage.getItem('email')
      this.isLoggedIn = !!token
      if (this.isLoggedIn && username && email) {
        this.username = username
        this.email = email
        await this.fetchUserInfo()
      } else {
        this.clearAuthData()
      }
    },
    async fetchUserInfo() {
      try {
        const response = await api.get('/users/profile')
        const avatarPath = response.data.profile_picture
        this.userAvatar = avatarPath
          ? avatarPath.startsWith('http')
            ? avatarPath
            : `${import.meta.env.VITE_API_URL}${avatarPath}`
          : '/default-avatar.png'

        // 更新用户信息
        if (response.data.username) {
          this.username = response.data.username
          localStorage.setItem('username', response.data.username)
        }
        if (response.data.email) {
          this.email = response.data.email
          localStorage.setItem('email', response.data.email)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        if (error.response?.status === 401) {
          this.clearAuthData()
        }
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
      this.clearAuthData()
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
