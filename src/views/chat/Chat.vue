<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex flex-col md:flex-row h-[650px]">
          <!-- 左侧会话列表 - 桌面端显示，移动端在未选择会话时显示 -->
          <div class="w-full md:w-1/3 border-r" v-show="!isMobile || (isMobile && !currentSession)">
            <div class="p-4 border-b bg-gray-50">
              <h2 class="text-lg font-semibold text-gray-800">我的消息</h2>
            </div>

            <!-- 会话列表 -->
            <div class="h-[602px] md:h-[602px] overflow-y-auto">
              <div v-if="chatStore.loading && chatStore.sessions.length === 0" class="flex justify-center items-center h-full">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
              <div v-else-if="chatStore.sessions.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>没有聊天记录</p>
                <p class="text-center text-sm mt-2">开始与其他用户交流吧</p>
              </div>
              <div v-else>
                <div
                  v-for="session in chatStore.sortedSessions"
                  :key="session.sessionId"
                  @click="selectSession(session)"
                  class="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  :class="{'bg-blue-50': currentSession && session.partnerId === currentSession.partnerId}"
                >
                  <div class="flex items-center">
                    <div class="relative">
                      <img
                        :src="getUserAvatar(session.partnerAvatar)"
                        class="w-12 h-12 rounded-full object-cover"
                        alt="用户头像"
                      >
                      <div v-if="session.unreadCount" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
                      </div>
                    </div>
                    <div class="ml-3 flex-1 overflow-hidden">
                      <div class="flex justify-between items-center">
                        <h3 class="font-medium text-gray-800">{{ session.partnerName }}</h3>
                        <span class="text-xs text-gray-500">{{ formatMessageTime(session.lastTime) }}</span>
                      </div>
                      <p class="text-gray-600 text-sm truncate">{{ session.lastMessage }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧聊天区域 - 移动端在选择会话后显示 -->
          <div class="w-full md:w-2/3 flex flex-col" v-show="!isMobile || (isMobile && currentSession)">
            <div v-if="!currentSession && !isMobile" class="flex flex-col items-center justify-center h-full text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>选择一个会话开始聊天</p>
              <p class="text-center text-sm mt-2">或者访问用户主页发起新对话</p>
            </div>

            <template v-else-if="currentSession">
              <!-- 聊天头部 -->
              <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
                <!-- 移动端返回按钮 -->
                <button
                  v-if="isMobile"
                  @click="goBackToList"
                  class="mr-2 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <h2 class="text-lg font-semibold text-gray-800">{{ currentSession.partnerName }}</h2>
                <button
                  @click="deleteCurrentSession"
                  class="text-gray-500 hover:text-red-500 transition-colors"
                  v-if="currentSession && currentSession.sessionId"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <!-- 聊天记录 -->
              <div class="flex-1 p-4 overflow-y-auto" ref="messagesContainer">
                <div v-if="chatStore.loading" class="flex justify-center items-center h-24">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>

                <div v-if="chatStore.hasMoreHistory" class="text-center mb-4">
                  <button
                    @click="loadMoreHistory"
                    class="text-blue-500 text-sm hover:text-blue-700"
                    :disabled="chatStore.loading"
                  >
                    加载更多消息
                  </button>
                </div>

                <div v-if="chatStore.chatHistory.length === 0 && !chatStore.loading" class="text-center text-gray-500 py-10">
                  还没有聊天记录，发送一条消息开始对话吧
                </div>

                <div v-else>
                  <div v-for="(message, index) in sortedChatHistory" :key="index" class="mb-4">
                    <div class="flex" :class="message.sender_id === currentUserId ? 'justify-end' : 'justify-start'">
                      <div
                        class="max-w-[75%] md:max-w-md rounded-lg px-4 py-2"
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
              <div class="border-t p-4">
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
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick, onUnmounted, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore, useAuthStore } from '../../stores'

export default {
  name: 'Chat',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const chatStore = useChatStore()
    const authStore = useAuthStore()

    const messageContent = ref('')
    const messageError = ref('')
    const messagesContainer = ref(null)
    const isMobile = ref(false)
    const socketStatus = ref('disconnected') // socket连接状态

    // 当前会话
    const currentSession = ref(null)

    // 当前用户ID
    const currentUserId = computed(() => authStore.user?.id)

    // 对聊天历史按时间排序
    const sortedChatHistory = computed(() => {
      return [...chatStore.chatHistory].sort((a, b) => {
        return new Date(a.send_time) - new Date(b.send_time)
      })
    })

    // 检查WebSocket连接状态
    const checkSocketConnection = () => {
      // 确保chatStore和socket都已初始化
      if (!chatStore.socket) {
        console.log('WebSocket未初始化，正在尝试初始化连接...')
        socketStatus.value = 'connecting'
        chatStore.initSocketConnection()
        return false
      }

      if (!chatStore.socket.connected) {
        console.log('WebSocket已初始化但未连接，尝试重新连接...')
        socketStatus.value = 'connecting'

        // 尝试断开并重新连接
        chatStore.socket.disconnect()
        setTimeout(() => {
          chatStore.initSocketConnection()
        }, 1000)

        return false
      }

      console.log('WebSocket已连接，状态正常')
      socketStatus.value = 'connected'
      return true
    }

    // 检查是否是移动设备
    const checkIfMobile = () => {
      isMobile.value = window.innerWidth < 768
    }

    // 返回会话列表（移动端）
    const goBackToList = () => {
      currentSession.value = null
    }

    // 初始化数据
    const initData = async () => {
      // 初始化WebSocket连接
      chatStore.initSocketConnection()

      // 获取会话列表
      await chatStore.fetchSessions()

      // 如果URL中有partnerId参数，打开对应会话
      const partnerId = route.params.partnerId || route.query.partnerId
      if (partnerId) {
        console.log('检测到partnerId参数:', partnerId)
        // 确保partnerId是数值
        const partnerIdNum = Number(partnerId)
        const session = chatStore.sessions.find(s => s.partnerId === partnerIdNum)
        if (session) {
          console.log('找到现有会话，选择会话', session)
          selectSession(session)
        } else {
          // 如果没有找到会话，可能是新会话，需要创建
          const partnerName = route.query.partnerName || '用户'
          const partnerAvatar = route.query.partnerAvatar || ''

          console.log('创建新会话:', { partnerId: partnerIdNum, partnerName, partnerAvatar })
          try {
            // 创建临时会话
            const newSession = await chatStore.initChatSession(partnerIdNum, partnerName, partnerAvatar)
            console.log('创建的新会话:', newSession)
            if (newSession) {
              currentSession.value = newSession
            }
          } catch (error) {
            console.error('初始化新会话失败:', error)
          }
        }
      } else if (chatStore.sessions.length > 0) {
        // 否则选择第一个会话
        selectSession(chatStore.sessions[0])
      }
    }

    // 选择会话
    const selectSession = async (session) => {
      if (!session) return

      // 设置当前会话
      currentSession.value = session

      // 获取聊天历史
      await chatStore.fetchChatHistory(session.partnerId)

      // 如果有未读消息，立即标记为已读
      if (session.unreadCount > 0 && session.sessionId) {
        await chatStore.markSessionAsRead(session.sessionId)
      }

      // 滚动到底部
      await nextTick()
      scrollToBottom()
    }

    // 加载更多历史消息
    const loadMoreHistory = async () => {
      if (!currentSession.value || chatStore.loading) return

      await chatStore.fetchChatHistory(currentSession.value.partnerId, false)
    }

    // 发送消息
    const sendMessage = async () => {
      if (!messageContent.value.trim() || chatStore.loading || !currentSession.value) return

      // 确保WebSocket已连接
      checkSocketConnection()

      // 清除之前的错误
      messageError.value = ''

      try {
        const message = messageContent.value.trim()
        console.log('发送消息:', message, '到用户:', currentSession.value.partnerId)

        const response = await chatStore.sendMessage(message)

        // 如果是发送失败（对方未回复且不是第一条消息）
        if (response && response.error) {
          messageError.value = response.message
          return
        }

        // 发送成功，清空输入框
        messageContent.value = ''

        // 滚动到底部
        await nextTick()
        scrollToBottom()
      } catch (error) {
        messageError.value = error.message || '发送消息失败，请稍后再试'
        console.error('发送消息失败:', error)
      }
    }

    // 删除当前会话
    const deleteCurrentSession = async () => {
      if (!currentSession.value || !currentSession.value.sessionId) return

      try {
        await chatStore.deleteSession(currentSession.value.sessionId)
        currentSession.value = null

        // 如果还有其他会话，选择第一个
        if (chatStore.sessions.length > 0) {
          selectSession(chatStore.sessions[0])
        }
      } catch (error) {
        console.error('删除会话失败:', error)
      }
    }

    // 滚动到聊天记录底部
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    // 获取用户头像
    const getUserAvatar = (profilePicture) => {
      if (!profilePicture) return '/default-avatar.png'
      if (profilePicture.startsWith('http')) {
        return profilePicture
      }
      return `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${profilePicture}`
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

    // 监听聊天历史变化，自动滚动到底部
    watch(() => chatStore.chatHistory, () => {
      nextTick(() => scrollToBottom())
    }, { deep: true })

    // 组件挂载后初始化数据
    onMounted(() => {
      console.log('聊天组件挂载，开始初始化数据')
      initData()

      // 检查设备类型
      checkIfMobile()
      // 添加窗口大小变化的监听
      window.addEventListener('resize', checkIfMobile)

      // 初始检查socket连接状态
      checkSocketConnection()

      // 定时获取未读消息数量（每15秒）
      const intervalId = setInterval(() => {
        if (authStore.isLoggedIn) {
          chatStore.fetchUnreadCount()
        }
      }, 15000)

      // 组件卸载时清理
      onUnmounted(() => {
        console.log('聊天组件卸载，清理资源')
        clearInterval(intervalId)
        // 移除窗口大小变化的监听
        window.removeEventListener('resize', checkIfMobile)
        // 关闭WebSocket连接
        chatStore.closeSocket()
        // 清理会话数据
        console.log('清理当前聊天会话')
        chatStore.clearCurrentSession()
      })
    })

    return {
      chatStore,
      currentSession,
      currentUserId,
      messageContent,
      messageError,
      messagesContainer,
      selectSession,
      sendMessage,
      deleteCurrentSession,
      loadMoreHistory,
      getUserAvatar,
      formatMessageTime,
      sortedChatHistory,
      checkIfMobile,
      goBackToList,
      isMobile,
      socketStatus,
      checkSocketConnection
    }
  }
}
</script>

