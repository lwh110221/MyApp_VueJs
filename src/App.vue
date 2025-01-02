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
            <template v-if="!authStore.isLoggedIn">
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
                  :src="authStore.userAvatar"
                  class="w-8 h-8 rounded-full object-cover"
                  alt="用户头像"
                >
                <span class="text-gray-700">{{ authStore.user.username }}</span>
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
                  @click="handleLogout"
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
    <router-view @login-success="authStore.checkAuth"></router-view>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()

    // 组件挂载时检查认证状态
    authStore.checkAuth()

    return {
      authStore
    }
  },
  data() {
    return {
      showDropdown: false
    }
  },
  created() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
    handleClickOutside(event) {
      const dropdown = this.$el.querySelector('.relative')
      if (dropdown && !dropdown.contains(event.target)) {
        this.showDropdown = false
      }
    },
    handleLogout() {
      this.showDropdown = false
      this.authStore.logout()
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
