<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- 用户资料卡片 -->
      <div v-else-if="userProfile" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center space-x-4">
            <img
              :src="getUserAvatar(userProfile.profile_picture)"
              class="w-20 h-20 rounded-full object-cover"
              alt="用户头像"
            >
            <div>
              <div class="flex items-center">
                <h2 class="text-2xl font-bold text-gray-800">{{ userProfile.username }}</h2>
                <!-- 用户身份标识 -->
                <UserIdentities
                  v-if="userProfile.identities && userProfile.identities.length > 0"
                  :identities="userProfile.identities"
                  class="ml-3"
                />
              </div>
              <p v-if="userProfile.bio" class="text-gray-600 mt-1">{{ userProfile.bio }}</p>
              <p class="text-gray-500 text-sm mt-1">注册时间：{{ formatDate(userProfile.created_at) }}</p>

              <!-- 粉丝和关注数 -->
              <div class="flex space-x-3 mt-2 text-sm">
                <span class="text-gray-600">关注：{{ userProfile.following_count || 0 }}</span>
                <span class="text-gray-600">粉丝：{{ userProfile.follower_count || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- 关注按钮 -->
          <div>
            <button
              v-if="isLoggedIn && !isCurrentUser && !userProfile.is_followed"
              @click="followUser"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-2"
              :disabled="followLoading"
            >
              {{ followLoading ? '处理中...' : '关注' }}
            </button>
            <button
              v-if="isLoggedIn && !isCurrentUser && userProfile.is_followed"
              @click="unfollowUser"
              class="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 mr-2"
              :disabled="unfollowLoading"
            >
              {{ unfollowLoading ? '处理中...' : '已关注' }}
            </button>

            <!-- 发送消息按钮 -->
            <button
              v-if="isLoggedIn && !isCurrentUser"
              @click="redirectToChat"
              class="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              <i class="fas fa-comment mr-1"></i> 发送消息
            </button>
          </div>
        </div>

        <!-- 用户积分 -->
        <div class="mb-6 p-3 bg-blue-50 rounded-lg">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-blue-800">用户积分：{{ userProfile.points || 0 }}</h3>
            <router-link
              v-if="isCurrentUser"
              to="/points/history"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              积分明细 →
            </router-link>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="border-t pt-6">
          <h3 class="text-xl font-semibold mb-4">最近动态</h3>
          <MomentList :user-id="userId" :key="'moments_' + userId" />

          <!-- 关注和粉丝列表 -->
          <div class="mt-8">
            <h3 class="text-xl font-semibold mb-4">关注信息</h3>
            <UserFollowCard :user-id="userId" :key="'follows_' + userId" />
          </div>
        </div>
      </div>

      <!-- 用户不存在或已被禁用 -->
      <div v-else class="bg-white rounded-lg shadow-md p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">用户不存在或已被禁用</h3>
        <p class="mt-1 text-gray-500">该用户可能已被删除或禁用，请返回首页。</p>
        <div class="mt-6">
          <router-link to="/" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            返回首页
          </router-link>
        </div>
      </div>
    </div>

    <!-- 聊天模态框 -->
    <div v-if="showChatModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <!-- 模态框头部 -->
        <div class="flex justify-between items-center border-b px-6 py-4">
          <h3 class="text-lg font-semibold">发送消息给 {{ userProfile.username }}</h3>
          <button @click="closeChatModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- 聊天消息列表 -->
        <div class="px-6 py-4 h-64 overflow-y-auto" ref="chatHistory">
          <div v-if="chatStore.loading" class="flex justify-center items-center h-full">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <div v-else-if="chatStore.chatHistory.length === 0" class="text-center text-gray-500 py-10">
            还没有聊天记录，发送一条消息开始对话吧
          </div>
          <div v-else>
            <div v-for="(message, index) in sortedChatHistory" :key="index" class="mb-4">
              <div class="flex" :class="message.sender_id === currentUserId ? 'justify-end' : 'justify-start'">
                <div
                  class="max-w-xs rounded-lg px-4 py-2"
                  :class="message.sender_id === currentUserId
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'"
                >
                  <p>{{ message.content }}</p>
                  <div
                    class="text-xs mt-1"
                    :class="message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'"
                  >
                    {{ formatMessageTime(message.send_time) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="border-t px-6 py-4">
          <div class="flex">
            <input
              v-model="messageContent"
              type="text"
              placeholder="输入消息..."
              class="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="sendMessage"
              :disabled="chatStore.loading"
            />
            <button
              @click="sendMessage"
              class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
              :disabled="!messageContent.trim() || chatStore.loading"
            >
              发送
            </button>
          </div>
          <p v-if="messageError" class="text-red-500 text-sm mt-2">{{ messageError }}</p>
          <p v-if="!chatStore.isPartnerReplied && chatStore.chatHistory.length > 0" class="text-orange-500 text-sm mt-2">
            对方尚未回复，暂时只能发送一条消息
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watchEffect, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore, useChatStore } from '../../stores'
import { useAuthStore } from '../../stores/auth'
import MomentList from '../../components/MomentList.vue'
import UserFollowCard from '../../components/UserFollowCard.vue'
import UserIdentities from '../../components/UserIdentities.vue'

export default {
  name: 'UserProfile',
  components: {
    MomentList,
    UserFollowCard,
    UserIdentities
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const chatStore = useChatStore()

    const loading = ref(true)
    const followLoading = ref(false)
    const unfollowLoading = ref(false)
    const showChatModal = ref(false)
    const messageContent = ref('')
    const messageError = ref('')
    const chatHistory = ref(null)

    // 获取路由参数中的用户ID
    const userId = computed(() => route.params.id)

    // 当前登录用户ID
    const currentUserId = computed(() => authStore.user?.id)

    // 判断是否为当前用户自己的页面
    const isCurrentUser = computed(() => userId.value === currentUserId.value)

    // 判断是否已登录
    const isLoggedIn = computed(() => authStore.isLoggedIn)

    // 用户资料
    const userProfile = computed(() => userStore.userProfile)

    // 获取用户资料
    const fetchUserProfile = async () => {
      if (!userId.value) return

      try {
        loading.value = true
        await userStore.fetchUserProfile(userId.value)
        console.log('获取到的用户资料:', userProfile.value)
      } catch (error) {
        console.error('获取用户资料失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 关注用户
    const followUser = async () => {
      if (followLoading.value) return

      try {
        followLoading.value = true
        await userStore.followUser(userId.value)

        // 手动更新当前用户资料中的关注状态，无需重新获取全部数据
        if (userProfile.value) {
          userProfile.value.is_followed = true
          userProfile.value.follower_count += 1
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message === '已经关注过该用户') {
          // 如果已经关注过，强制更新状态为已关注
          if (userProfile.value) {
            userProfile.value.is_followed = true
          }
        } else {
          console.error('关注用户失败:', error)
        }
      } finally {
        followLoading.value = false
      }
    }

    // 取消关注
    const unfollowUser = async () => {
      if (unfollowLoading.value) return

      try {
        unfollowLoading.value = true
        await userStore.unfollowUser(userId.value)

        // 手动更新当前用户资料中的关注状态，无需重新获取全部数据
        if (userProfile.value) {
          userProfile.value.is_followed = false
          userProfile.value.follower_count = Math.max(0, userProfile.value.follower_count - 1)
        }
      } catch (error) {
        console.error('取消关注失败:', error)
      } finally {
        unfollowLoading.value = false
      }
    }

    // 打开聊天模态框
    const openChatModal = async () => {
      if (!userProfile.value) return

      try {
        console.log('打开聊天模态框，初始化聊天会话')
        // 初始化 socket 连接
        chatStore.initSocketConnection()

        // 初始化聊天会话
        await chatStore.initChatSession(
          userId.value,
          userProfile.value.username,
          userProfile.value.profile_picture
        )

        showChatModal.value = true

        // 滚动到最新消息
        await nextTick()
        scrollToBottom()
      } catch (error) {
        console.error('初始化聊天失败:', error)
      }
    }

    // 关闭聊天模态框
    const closeChatModal = () => {
      console.log('关闭聊天模态框')
      showChatModal.value = false
    }

    // 发送消息
    const sendMessage = async () => {
      if (!messageContent.value.trim() || chatStore.loading) return

      // 清除之前的错误
      messageError.value = ''

      try {
        const response = await chatStore.sendMessage(messageContent.value)

        // 如果是发送失败（对方未回复且不是第一条消息）
        if (response && response.error) {
          messageError.value = response.message
          return
        }

        // 发送成功，清空输入框
        messageContent.value = ''

        // 滚动到最新消息
        await nextTick()
        scrollToBottom()
      } catch (error) {
        messageError.value = error.message || '发送消息失败，请稍后再试'
        console.error('发送消息失败:', error)
      }
    }

    // 滚动到聊天记录底部
    const scrollToBottom = () => {
      if (chatHistory.value) {
        chatHistory.value.scrollTop = chatHistory.value.scrollHeight
      }
    }

    // 格式化消息时间
    const formatMessageTime = (time) => {
      if (!time) return ''

      const date = new Date(time)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()

      if (isToday) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // 获取用户头像
    const getUserAvatar = (profilePicture) => {
      if (!profilePicture) return '/default-avatar.png'
      if (profilePicture.startsWith('http')) {
        return profilePicture
      }
      return `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${profilePicture}`
    }

    // 监听聊天历史变化，自动滚动到底部
    watch(() => chatStore.chatHistory, () => {
      nextTick(() => scrollToBottom())
    }, { deep: true })

    // 监听用户ID变化，重新获取用户资料
    watchEffect(() => {
      if (userId.value) {
        fetchUserProfile()
      }
    })

    // 组件卸载时清理
    onUnmounted(() => {
      console.log('UserProfile组件卸载，清理聊天会话')
      // 如果聊天模态框是打开的，关闭它
      if (showChatModal.value) {
        closeChatModal()
      }
      // 清理当前会话
      chatStore.clearCurrentSession()
    })

    // 在组件挂载时记录一下用户资料信息
    onMounted(() => {
      fetchUserProfile()
        .then(() => {
          console.log('用户资料加载完成：', userProfile.value)
          console.log('关注状态:', userProfile.value ? userProfile.value.is_followed : 'N/A')
          console.log('粉丝数:', userProfile.value ? userProfile.value.follower_count : 'N/A')
        })
    })

    // 获取排序后的聊天历史
    const sortedChatHistory = computed(() => {
      if (!chatStore.chatHistory) return []
      return [...chatStore.chatHistory].sort((a, b) => new Date(a.send_time) - new Date(b.send_time))
    })

    // 重定向到聊天页面
    const redirectToChat = () => {
      if (!userProfile.value) return

      console.log('重定向到聊天页面，用户ID:', userId.value)

      // 确保使用数值类型的用户ID
      const partnerIdNum = Number(userId.value)

      router.push({
        name: 'ChatWithUser',
        params: { partnerId: partnerIdNum.toString() },
        query: {
          partnerName: userProfile.value.username,
          partnerAvatar: userProfile.value.profile_picture
        }
      })
    }

    return {
      userId,
      userProfile,
      isCurrentUser,
      isLoggedIn,
      loading,
      followLoading,
      unfollowLoading,
      followUser,
      unfollowUser,
      formatDate,
      getUserAvatar,
      currentUserId,

      // 聊天相关
      showChatModal,
      messageContent,
      messageError,
      chatHistory,
      chatStore,
      openChatModal,
      closeChatModal,
      sendMessage,
      formatMessageTime,
      sortedChatHistory,
      redirectToChat
    }
  }
}
</script>

<style scoped>
/* 如果有任何样式，可以在这里添加 */
</style>
