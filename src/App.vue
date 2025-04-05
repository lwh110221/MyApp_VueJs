<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 桌面端导航栏 -->
    <nav class="bg-highland-gradient from-highland-700 to-highland-600 shadow-highland hidden md:block">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex justify-between items-center py-3">
          <router-link
            to="/"
            class="flex items-center space-x-2 text-xl font-bold text-white hover:text-highland-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>云南高原农业</span>
          </router-link>
          <div class="flex items-center space-x-4">
            <!-- 主导航链接 - 桌面端 -->
            <div class="flex space-x-4 mr-4">
              <router-link to="/" class="text-white hover:text-highland-100 font-medium px-3 py-2 rounded-md hover:bg-highland-500 transition duration-200">首页</router-link>
              <router-link to="/products" class="text-white hover:text-highland-100 font-medium px-3 py-2 rounded-md hover:bg-highland-500 transition duration-200">农产品</router-link>
              <router-link to="/news" class="text-white hover:text-highland-100 font-medium px-3 py-2 rounded-md hover:bg-highland-500 transition duration-200">新闻</router-link>
              <router-link to="/community" class="text-white hover:text-highland-100 font-medium px-3 py-2 rounded-md hover:bg-highland-500 transition duration-200">社区</router-link>
              <router-link to="/help" class="text-white hover:text-highland-100 font-medium px-3 py-2 rounded-md hover:bg-highland-500 transition duration-200">专家求助</router-link>
              <router-link to="/ai-chat" class="text-white hover:text-highland-100 font-medium px-3 py-2 rounded-md hover:bg-highland-500 transition duration-200">AI助手</router-link>
            </div>

            <!-- 购物车图标 -->
            <router-link v-if="authStore.isLoggedIn" to="/cart" class="text-white hover:text-highland-100 relative group">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="absolute -bottom-1 -right-1 transform translate-x-1/2 bg-crop-400 text-highland-800 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center group-hover:bg-crop-300 transition duration-200">0</span>
            </router-link>

            <!-- 消息图标 -->
            <router-link v-if="authStore.isLoggedIn" to="/chat" class="text-white hover:text-highland-100 relative group">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span v-if="chatStore.unreadCount > 0" class="absolute -top-1 -right-1 bg-crop-400 text-highland-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center group-hover:bg-crop-300 transition duration-200">
                {{ chatStore.unreadCount > 99 ? '99+' : chatStore.unreadCount }}
              </span>
            </router-link>

            <template v-if="!authStore.isLoggedIn">
              <router-link
                to="/login"
                class="text-white bg-highland-500 hover:bg-highland-400 px-4 py-2 rounded-md font-medium transition duration-200"
              >
                登录
              </router-link>
              <router-link
                to="/register"
                class="text-highland-700 bg-white hover:bg-highland-50 px-4 py-2 rounded-md font-medium transition duration-200"
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
                <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
                  <img
                    :src="authStore.userAvatar"
                    class="w-full h-full object-cover"
                    alt="用户头像"
                  >
                </div>
                <span class="text-white font-medium">{{ authStore.user.username }}</span>
                <svg
                  class="w-4 h-4 text-white"
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
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-highland-100"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-highland-800 hover:bg-highland-50 flex items-center"
                  @click="showDropdown = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-highland-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  个人中心
                </router-link>
                <router-link
                  to="/orders"
                  class="block px-4 py-2 text-highland-800 hover:bg-highland-50 flex items-center"
                  @click="showDropdown = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-highland-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  我的订单
                </router-link>
                <router-link
                  to="/cart"
                  class="block px-4 py-2 text-highland-800 hover:bg-highland-50 flex items-center"
                  @click="showDropdown = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-highland-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  购物车
                </router-link>
                <router-link
                  to="/chat"
                  class="block px-4 py-2 text-highland-800 hover:bg-highland-50 flex items-center"
                  @click="showDropdown = false"
                >
                  <div class="flex items-center w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-highland-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>我的消息</span>
                    <span v-if="chatStore.unreadCount > 0" class="bg-crop-400 text-highland-800 text-xs font-bold rounded-full px-1.5 ml-auto">
                      {{ chatStore.unreadCount > 99 ? '99+' : chatStore.unreadCount }}
                    </span>
                  </div>
                </router-link>
                <router-link
                  to="/ai-chat"
                  class="block px-4 py-2 text-highland-800 hover:bg-highland-50 flex items-center"
                  @click="showDropdown = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-highland-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI助手
                </router-link>
                <router-link
                  to="/change-password"
                  class="block px-4 py-2 text-highland-800 hover:bg-highland-50 flex items-center"
                  @click="showDropdown = false"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-highland-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  修改密码
                </router-link>
                <div class="border-t border-highland-100 my-1"></div>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 移动端简化顶部导航栏 -->
    <nav class="bg-highland-gradient from-highland-700 to-highland-600 shadow-md md:hidden py-2">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex justify-between items-center">
          <router-link
            to="/"
            class="flex items-center space-x-2 text-lg font-bold text-white hover:text-highland-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>云南高原农业</span>
          </router-link>

          <template v-if="!authStore.isLoggedIn">
            <div class="flex space-x-2">
              <router-link
                to="/login"
                class="text-white bg-highland-500 hover:bg-highland-400 px-3 py-1 rounded-md text-sm font-medium transition duration-200"
              >
                登录
              </router-link>
              <router-link
                to="/register"
                class="text-highland-700 bg-white hover:bg-highland-50 px-3 py-1 rounded-md text-sm font-medium transition duration-200"
              >
                注册
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </nav>

    <!-- 路由视图，添加底部导航栏的padding -->
    <div class="pb-16 md:pb-0">
      <router-view @login-success="authStore.checkAuth"></router-view>
    </div>

    <!-- 移动端底部导航栏 -->
    <div v-if="!mobileMoreOpen" class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-highland-200 shadow-lg z-50">
      <div class="grid grid-cols-5 h-16">
        <!-- 农产品 -->
        <router-link to="/products" class="flex flex-col items-center justify-center text-highland-600 hover:text-highland-800">
          <i class="fas fa-store text-xl"></i>
          <span class="text-xs mt-1">农产品</span>
        </router-link>

        <!-- 新闻 -->
        <router-link to="/news" class="flex flex-col items-center justify-center text-highland-600 hover:text-highland-800">
          <i class="fas fa-newspaper text-xl"></i>
          <span class="text-xs mt-1">新闻</span>
        </router-link>

        <!-- 首页 -->
        <router-link to="/" class="flex flex-col items-center justify-center text-highland-600 hover:text-highland-800">
          <div class="bg-highland-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg -mt-4 border-4 border-white">
            <i class="fas fa-home text-xl"></i>
          </div>
          <span class="text-xs mt-1">首页</span>
        </router-link>

        <!-- 社区 -->
        <router-link to="/community" class="flex flex-col items-center justify-center text-highland-600 hover:text-highland-800">
          <i class="fas fa-users text-xl"></i>
          <span class="text-xs mt-1">社区</span>
        </router-link>

        <!-- 个人 -->
        <button @click="toggleMobileMore" class="flex flex-col items-center justify-center text-highland-600 hover:text-highland-800 w-full">
          <i class="fas fa-ellipsis-h text-xl"></i>
          <span class="text-xs mt-1">更多</span>
        </button>
      </div>
    </div>

    <!-- 更多菜单弹出层 -->
    <div v-if="mobileMoreOpen" class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div class="bg-white rounded-t-lg w-full p-4 animate-slide-up">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-highland-800">更多功能</h3>
          <button @click="toggleMobileMore" class="text-highland-600 p-2">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="grid grid-cols-4 gap-4 mb-6">
          <router-link to="/help" class="flex flex-col items-center justify-center p-3 bg-highland-50 rounded-lg text-highland-700" @click="mobileMoreOpen = false">
            <i class="fas fa-question-circle text-2xl mb-2"></i>
            <span class="text-xs">专家求助</span>
          </router-link>

          <router-link to="/ai-chat" class="flex flex-col items-center justify-center p-3 bg-highland-50 rounded-lg text-highland-700" @click="mobileMoreOpen = false">
            <i class="fas fa-robot text-2xl mb-2"></i>
            <span class="text-xs">AI助手</span>
          </router-link>

          <router-link v-if="authStore.isLoggedIn" to="/cart" class="flex flex-col items-center justify-center p-3 bg-highland-50 rounded-lg text-highland-700" @click="mobileMoreOpen = false">
            <i class="fas fa-shopping-cart text-2xl mb-2"></i>
            <span class="text-xs">购物车</span>
          </router-link>

          <router-link v-if="authStore.isLoggedIn" to="/chat" class="flex flex-col items-center justify-center p-3 bg-highland-50 rounded-lg text-highland-700 relative" @click="mobileMoreOpen = false">
            <i class="fas fa-comment text-2xl mb-2"></i>
            <span v-if="chatStore.unreadCount > 0" class="absolute top-1 right-2 bg-crop-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {{ chatStore.unreadCount > 99 ? '99+' : chatStore.unreadCount }}
            </span>
            <span class="text-xs">消息</span>
          </router-link>
        </div>

        <div v-if="authStore.isLoggedIn" class="border-t border-highland-100 pt-4">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 rounded-full overflow-hidden border border-highland-200 mr-3">
              <img :src="authStore.userAvatar" class="w-full h-full object-cover" alt="用户头像">
            </div>
            <span class="font-medium text-highland-800">{{ authStore.user.username }}</span>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <router-link to="/profile" class="flex flex-col items-center justify-center p-2 bg-highland-50 rounded-lg text-highland-700" @click="mobileMoreOpen = false">
              <i class="fas fa-user text-lg mb-1"></i>
              <span class="text-xs">个人中心</span>
            </router-link>

            <router-link to="/orders" class="flex flex-col items-center justify-center p-2 bg-highland-50 rounded-lg text-highland-700" @click="mobileMoreOpen = false">
              <i class="fas fa-clipboard-list text-lg mb-1"></i>
              <span class="text-xs">我的订单</span>
            </router-link>

            <button @click="handleLogoutMobile" class="flex flex-col items-center justify-center p-2 bg-red-50 rounded-lg text-red-600">
              <i class="fas fa-sign-out-alt text-lg mb-1"></i>
              <span class="text-xs">退出登录</span>
            </button>
          </div>
        </div>

        <div v-else class="border-t border-highland-100 pt-4">
          <div class="flex space-x-3">
            <router-link to="/login" class="flex-1 bg-highland-500 text-white py-2 rounded-md text-center font-medium" @click="mobileMoreOpen = false">
              登录
            </router-link>
            <router-link to="/register" class="flex-1 bg-white border border-highland-500 text-highland-600 py-2 rounded-md text-center font-medium" @click="mobileMoreOpen = false">
              注册
            </router-link>
          </div>
        </div>
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
      showMobileMenu: false,
      mobileMoreOpen: false
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
    handleLogoutMobile() {
      this.mobileMoreOpen = false
      this.authStore.logout()
    },
    toggleMobileMenu(event) {
      // 阻止事件冒泡
      if (event) {
        event.stopPropagation();
      }
      this.showMobileMenu = !this.showMobileMenu
    },
    toggleMobileMore() {
      this.mobileMoreOpen = !this.mobileMoreOpen
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

/* 底部菜单弹出动画 */
.animate-slide-up {
  animation: slide-up 0.3s ease-out forwards;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
