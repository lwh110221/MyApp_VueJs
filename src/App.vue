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
            <!-- 主导航链接 - 桌面端 -->
            <div class="hidden md:flex space-x-4 mr-4">
              <router-link to="/" class="text-gray-600 hover:text-gray-800">首页</router-link>
              <router-link to="/products" class="text-gray-600 hover:text-gray-800">农产品</router-link>
              <router-link to="/news" class="text-gray-600 hover:text-gray-800">新闻</router-link>
              <router-link to="/community" class="text-gray-600 hover:text-gray-800">社区</router-link>
              <router-link to="/help" class="text-gray-600 hover:text-gray-800">专家求助</router-link>
              <router-link to="/ai-chat" class="text-gray-600 hover:text-gray-800">AI助手</router-link>
            </div>

            <!-- 购物车图标 -->
            <router-link v-if="authStore.isLoggedIn" to="/cart" class="text-gray-600 hover:text-gray-800 relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </router-link>

            <!-- 消息图标 -->
            <router-link v-if="authStore.isLoggedIn" to="/chat" class="text-gray-600 hover:text-gray-800 relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span v-if="chatStore.unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {{ chatStore.unreadCount > 99 ? '99+' : chatStore.unreadCount }}
              </span>
            </router-link>

            <!-- 移动端菜单按钮 -->
            <button
              @click="toggleMobileMenu($event)"
              class="md:hidden text-gray-600 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

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
            <div v-else class="relative" ref="userDropdown">
              <button
                @click="toggleDropdown($event)"
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
                  to="/orders"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showDropdown = false"
                >
                  我的订单
                </router-link>
                <router-link
                  to="/cart"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showDropdown = false"
                >
                  购物车
                </router-link>
                <router-link
                  to="/chat"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showDropdown = false"
                >
                  <div class="flex items-center justify-between">
                    <span>我的消息</span>
                    <span v-if="chatStore.unreadCount > 0" class="bg-red-500 text-white text-xs rounded-full px-1.5 ml-2">
                      {{ chatStore.unreadCount > 99 ? '99+' : chatStore.unreadCount }}
                    </span>
                  </div>
                </router-link>
                <router-link
                  to="/ai-chat"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  @click="showDropdown = false"
                >
                  AI助手
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

    <!-- 移动端菜单 -->
    <div v-if="showMobileMenu" class="md:hidden bg-white shadow-lg rounded-lg absolute top-16 right-0 left-0 z-50">
      <div class="flex flex-col p-4 space-y-3">
        <router-link to="/" class="text-gray-600 hover:text-gray-800 py-2" @click="showMobileMenu = false">首页</router-link>
        <router-link to="/products" class="text-gray-600 hover:text-gray-800 py-2" @click="showMobileMenu = false">农产品</router-link>
        <router-link to="/news" class="text-gray-600 hover:text-gray-800 py-2" @click="showMobileMenu = false">新闻</router-link>
        <router-link to="/community" class="text-gray-600 hover:text-gray-800 py-2" @click="showMobileMenu = false">社区</router-link>
        <router-link to="/help" class="text-gray-600 hover:text-gray-800 py-2" @click="showMobileMenu = false">专家求助</router-link>
        <router-link to="/ai-chat" class="text-gray-600 hover:text-gray-800 py-2" @click="showMobileMenu = false">AI助手</router-link>
        <router-link v-if="authStore.isLoggedIn" to="/cart" class="text-gray-600 hover:text-gray-800 py-2 flex items-center" @click="showMobileMenu = false">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          购物车
        </router-link>
        <router-link v-if="authStore.isLoggedIn" to="/chat" class="text-gray-600 hover:text-gray-800 py-2 flex items-center" @click="showMobileMenu = false">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          消息
          <span v-if="chatStore.unreadCount > 0" class="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            {{ chatStore.unreadCount > 99 ? '99+' : chatStore.unreadCount }}
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'
import { useChatStore } from './stores/chat'
import { onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const chatStore = useChatStore()

    // 组件挂载时检查认证状态
    authStore.checkAuth()

    // 组件挂载时初始化聊天相关
    onMounted(() => {
      if (authStore.isLoggedIn) {
        console.log('初始化聊天WebSocket连接')
        // 初始化WebSocket连接
        const cleanupSocket = chatStore.initSocketConnection()

        // 获取未读消息数量
        chatStore.fetchUnreadCount()

        // 定时获取未读消息数量
        const intervalId = setInterval(() => {
          if (authStore.isLoggedIn) {
            chatStore.fetchUnreadCount()
          }
        }, 60000) // 每60秒查询一次

        // 在组件销毁时清除计时器和WebSocket连接
        onBeforeUnmount(() => {
          console.log('清理App.vue中的计时器和WebSocket连接')
          clearInterval(intervalId)

          // 使用返回的清理函数断开WebSocket连接
          if (typeof cleanupSocket === 'function') {
            cleanupSocket()
          }
        })
      }
    })

    return {
      authStore,
      chatStore
    }
  },
  data() {
    return {
      showDropdown: false,
      showMobileMenu: false
    }
  },
  created() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    toggleDropdown(event) {
      // 阻止事件冒泡，避免立即触发handleClickOutside
      if (event) {
        event.stopPropagation();
      }
      this.showDropdown = !this.showDropdown
    },
    handleClickOutside(event) {
      const dropdown = this.$refs.userDropdown
      if (dropdown && !dropdown.contains(event.target)) {
        this.showDropdown = false
      }
    },
    handleLogout() {
      this.showDropdown = false
      this.authStore.logout()
    },
    toggleMobileMenu(event) {
      // 阻止事件冒泡
      if (event) {
        event.stopPropagation();
      }
      this.showMobileMenu = !this.showMobileMenu
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
