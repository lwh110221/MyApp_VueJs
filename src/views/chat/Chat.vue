<template>
  <div :class="['min-h-screen', isMobile ? 'mobile-chat-container' : 'bg-gray-100']">
    <div :class="['max-w-6xl mx-auto', isMobile ? 'px-0 py-0' : 'px-2 md:px-4 py-4 md:py-8']">
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
          <!-- 左侧会话列表 - 带收起功能(仅在非移动端显示) -->
          <div
            :class="[
              'border-r transition-all duration-300 bg-white z-10',
              isSidebarOpen ? 'md:w-1/4 w-full' : 'w-0 md:w-16 overflow-hidden',
              !isMobile || (isMobile && !currentSession) ? 'block' : 'hidden md:block'
            ]"
          >
            <div class="p-3 border-b bg-gray-50 flex justify-between items-center">
              <h2 :class="['font-semibold text-gray-800 transition-opacity', isSidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden']">我的消息</h2>
              <!-- 侧边栏折叠按钮，仅在非移动端显示 -->
              <button
                v-if="!isMobile"
                @click="toggleSidebar"
                class="mr-2 text-gray-500 hover:text-gray-700 md:block hidden"
              >
                <i :class="['fas', isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right']"></i>
              </button>
            </div>

            <!-- 会话列表 -->
            <div :class="['overflow-y-auto', isSidebarOpen ? 'h-[calc(100vh-8rem)]' : 'h-[calc(100vh-8rem)]']">
              <div v-if="chatStore.loading && chatStore.sessions.length === 0" class="flex justify-center items-center h-full">
                <i class="fas fa-spinner fa-spin text-blue-500 text-xl"></i>
              </div>
              <div v-else-if="chatStore.sessions.length === 0" :class="['flex flex-col items-center justify-center h-full text-gray-500 p-3', isSidebarOpen ? '' : 'hidden md:flex']">
                <i class="fas fa-comments h-12 w-12 mb-3 text-gray-400 text-4xl"></i>
                <p>没有聊天记录</p>
                <p class="text-center text-xs mt-1">开始与其他用户交流吧</p>
              </div>
              <div v-else>
                <div
                  v-for="session in chatStore.sortedSessions"
                  :key="session.sessionId"
                  @click="selectSession(session)"
                  :class="[
                    'py-3 px-2 border-b hover:bg-gray-50 cursor-pointer transition-colors',
                    {'bg-blue-50': currentSession && session.partnerId === currentSession.partnerId},
                    isSidebarOpen ? '' : 'hidden md:block'
                  ]"
                >
                  <div :class="['flex items-center', isSidebarOpen ? '' : 'justify-center']">
                    <div class="relative">
                      <img
                        :src="getUserAvatar(session.partnerAvatar)"
                        class="w-10 h-10 rounded-full object-cover"
                        alt="用户头像"
                      >
                      <div v-if="session.unreadCount" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
                      </div>
                    </div>
                    <div :class="['ml-2 flex-1 overflow-hidden transition-opacity', isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden']">
                      <div class="flex justify-between items-center">
                        <h3 class="font-medium text-gray-800 text-sm">{{ session.partnerName }}</h3>
                        <span class="text-xs text-gray-500">{{ formatMessageTime(session.lastTime) }}</span>
                      </div>
                      <p class="text-gray-600 text-xs truncate">
                        <span v-if="session.contentType === 1">[图片]</span>
                        <span v-else>{{ session.lastMessage }}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧聊天区域 -->
          <div
            :class="[
              'flex flex-col transition-all duration-300',
              isSidebarOpen ? 'md:w-3/4 w-full' : 'w-full md:w-[calc(100%-4rem)]',
              isMobile && currentSession ? 'h-screen' : ''
            ]"
            v-show="!isMobile || (isMobile && currentSession)"
          >
            <div v-if="!currentSession && !isMobile" class="flex flex-col items-center justify-center h-full text-gray-500">
              <i class="fas fa-comments h-16 w-16 mb-4 text-gray-400 text-5xl"></i>
              <p>选择一个会话开始聊天</p>
              <p class="text-center text-sm mt-2">或者访问用户主页发起新对话</p>
            </div>

            <template v-else-if="currentSession">
              <!-- 聊天头部 -->
              <div class="p-3 border-b bg-gray-50 flex justify-between items-center">
                <div class="flex items-center">
                  <!-- 移动端返回按钮 -->
                  <button
                    v-if="isMobile"
                    @click="goBackToList"
                    class="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    <i class="fas fa-arrow-left h-5 w-5"></i>
                  </button>

                  <div class="flex items-center">
                    <img
                      :src="getUserAvatar(currentSession.partnerAvatar)"
                      class="w-8 h-8 rounded-full object-cover mr-2"
                      alt="用户头像"
                    >
                    <h2 class="text-base font-semibold text-gray-800">{{ currentSession.partnerName }}</h2>
                  </div>
                </div>

                <button
                  @click="deleteCurrentSession"
                  class="text-gray-500 hover:text-red-500 transition-colors"
                  v-if="currentSession && currentSession.sessionId"
                >
                  <i class="fas fa-trash-can h-5 w-5"></i>
                </button>
              </div>

              <!-- 聊天记录 -->
              <div class="flex-1 p-3 overflow-y-auto" ref="messagesContainer">
                <div v-if="chatStore.loading" class="flex justify-center items-center h-24">
                  <i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
                </div>

                <div v-if="chatStore.chatHistory.length === 0 && !chatStore.loading" class="text-center text-gray-500 py-10">
                  还没有聊天记录，发送一条消息开始对话吧
                </div>

                <div v-else class="space-y-3">
                  <div v-for="(message, index) in sortedChatHistory" :key="index" class="message-item">
                    <div class="flex" :class="message.sender_id === currentUserId ? 'justify-end' : 'justify-start'">
                      <!-- 显示发送者头像，仅当是对方发送的消息 -->
                      <div v-if="message.sender_id !== currentUserId" class="flex-shrink-0 mr-2">
                        <img
                          :src="getUserAvatar(currentSession.partnerAvatar)"
                          class="w-8 h-8 rounded-full object-cover"
                          alt="用户头像"
                        >
                      </div>

                      <div
                        class="max-w-[75%] md:max-w-md rounded-lg px-3 py-2"
                        :class="message.sender_id === currentUserId
                          ? 'bg-blue-500 text-white rounded-br-none shadow-sm'
                          : 'bg-gray-200 text-gray-800 rounded-bl-none shadow-sm'"
                      >
                        <!-- 图片消息 -->
                        <div v-if="message.content_type === 1" class="mb-1">
                          <div v-if="!message.media_url" class="text-sm text-gray-500">图片加载失败</div>
                          <img
                            v-else
                            :src="getImageUrl(message.media_url)"
                            class="max-w-full rounded cursor-pointer"
                            @click="previewImageHandler(message.media_url)"
                            @error="handleImageError($event, message)"
                            alt="聊天图片"
                          />
                        </div>
                        <!-- 文本消息 -->
                        <p v-else class="break-words">{{ message.content }}</p>
                        <div
                          class="text-xs mt-1 text-right"
                          :class="message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'"
                        >
                          {{ formatMessageTime(message.send_time) }}
                        </div>
                      </div>

                      <!-- 显示自己的头像，仅当是自己发送的消息 -->
                      <div v-if="message.sender_id === currentUserId" class="flex-shrink-0 ml-2">
                        <img
                          :src="authStore.userAvatar"
                          class="w-8 h-8 rounded-full object-cover"
                          alt="我的头像"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 输入区域 -->
              <div class="border-t p-3 bg-white">
                <div class="flex flex-col">
                  <div class="flex">
                    <input
                      v-model="messageContent"
                      type="text"
                      placeholder="输入消息..."
                      class="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      @keyup.enter="sendMessage"
                      :disabled="chatStore.loading || imageUploading"
                    />
                    <div class="flex">
                      <button
                        @click="toggleEmojiPicker"
                        class="emoji-toggle-btn bg-gray-200 text-gray-700 px-3 py-2 hover:bg-gray-300 transition-colors flex items-center justify-center"
                        :class="{'bg-blue-100': showEmojiPicker}"
                        :disabled="chatStore.loading || imageUploading"
                      >
                        <i class="fas fa-smile"></i>
                      </button>
                      <label class="bg-gray-200 text-gray-700 px-3 py-2 hover:bg-gray-300 cursor-pointer transition-colors flex items-center justify-center">
                        <input
                          type="file"
                          class="hidden"
                          accept="image/*"
                          @change="handleImageUpload"
                          :disabled="chatStore.loading || imageUploading"
                        />
                        <i class="fas fa-image"></i>
                      </label>
                      <button
                        @click="sendMessage"
                        class="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                        :disabled="(!messageContent.trim() && !selectedImage) || chatStore.loading || imageUploading"
                      >
                        <i class="fas fa-paper-plane"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Emoji 选择器 -->
                  <div v-if="showEmojiPicker" class="emoji-picker mt-2 p-2 bg-white border rounded-lg shadow-lg">
                    <div class="grid grid-cols-8 gap-1">
                      <button
                        v-for="emoji in emojiList"
                        :key="emoji"
                        @click="addEmoji(emoji)"
                        class="emoji-btn p-1 text-xl hover:bg-gray-100 rounded"
                      >
                        {{ emoji }}
                      </button>
                    </div>
                    <div class="mt-2 border-t pt-2 flex justify-between">
                      <div class="flex space-x-2">
                        <button
                          v-for="(category, idx) in emojiCategories"
                          :key="idx"
                          @click="changeEmojiCategory(idx)"
                          class="p-1 text-sm text-gray-500 hover:text-blue-500 rounded"
                          :class="{'text-blue-500': currentEmojiCategory === idx}"
                        >
                          <i :class="['fas', category.icon]"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-if="selectedImage" class="mt-2 relative">
                    <img :src="selectedImagePreview" class="h-20 object-contain rounded" />
                    <button
                      @click="cancelImageUpload"
                      class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <i class="fas fa-xmark text-xs"></i>
                    </button>
                  </div>
                  <div class="mt-2">
                    <p v-if="uploadError" class="text-red-500 text-xs">{{ uploadError }}</p>
                    <p v-if="messageError" class="text-red-500 text-xs">{{ messageError }}</p>
                    <p v-if="!chatStore.isPartnerReplied && chatStore.chatHistory.length > 0" class="text-orange-500 text-xs">
                      对方尚未回复，暂时只能发送一条消息
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <div v-if="previewImage.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4" @click="closeImagePreview">
      <div class="relative max-w-full max-h-full" @click.stop>
        <img
          :src="previewImage.url"
          class="max-w-full max-h-[90vh] object-contain"
          :class="{'cursor-zoom-in': previewImage.scale < 2, 'cursor-zoom-out': previewImage.scale >= 2, 'transition-transform duration-300': true}"
          :style="`transform: scale(${previewImage.scale})`"
          @click="toggleImageZoom"
          alt="图片预览"
        />
        <button
          @click="closeImagePreview"
          class="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-100 transition-opacity"
        >
          <i class="fas fa-xmark"></i>
        </button>
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
    const isSidebarOpen = ref(true) // 控制左侧栏的展开/收起

    // Emoji相关状态和数据
    const showEmojiPicker = ref(false)
    const currentEmojiCategory = ref(0)

    // Emoji分类
    const emojiCategories = [
      { name: '常用', icon: 'fa-clock', emojis: ['😀', '😂', '😊', '😍', '🥰', '😘', '😎', '🙄', '😏', '😒', '😢', '😭', '😱', '😡', '🤔', '👍', '👎', '👌', '✌️', '🤝', '👏', '🙏', '💪', '🧠', '👀', '👄', '❤️', '💔', '💯', '🔥', '✨'] },
      { name: '表情', icon: 'fa-face-smile', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸'] },
      { name: '手势', icon: 'fa-hand', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻'] },
      { name: '动物', icon: 'fa-cat', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺'] },
      { name: '食物', icon: 'fa-utensils', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯'] },
      { name: '物品', icon: 'fa-gift', emojis: ['💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬'] }
    ]

    // 根据当前分类获取emoji列表
    const emojiList = computed(() => {
      return emojiCategories[currentEmojiCategory.value].emojis
    })

    // 切换emoji选择器显示状态
    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value
    }

    // 切换emoji分类
    const changeEmojiCategory = (categoryIndex) => {
      currentEmojiCategory.value = categoryIndex
    }

    // 添加emoji到消息
    const addEmoji = (emoji) => {
      messageContent.value += emoji
    }

    // 图片上传相关
    const selectedImage = ref(null)
    const selectedImagePreview = ref('')
    const imageUploading = ref(false)
    const uploadError = ref('')

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

    // 图片预览状态
    const previewImage = ref({
      show: false,
      url: '',
      scale: 1
    })

    // 切换左侧栏展开/收起
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value
    }

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
      // 在移动设备上默认收起侧边栏
      if (isMobile.value && currentSession.value) {
        isSidebarOpen.value = false
      }
    }

    // 返回会话列表（移动端）
    const goBackToList = () => {
      currentSession.value = null
      // 确保在移动端返回时展开侧边栏
      isSidebarOpen.value = true
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

    // 处理图片上传
    const handleImageUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        uploadError.value = '只支持JPG、PNG和GIF格式的图片'
        return
      }

      // 验证文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        uploadError.value = '图片大小不能超过10MB'
        return
      }

      // 清除错误信息
      uploadError.value = ''

      // 设置选中的图片和预览
      selectedImage.value = file
      selectedImagePreview.value = URL.createObjectURL(file)
    }

    // 取消图片上传
    const cancelImageUpload = () => {
      selectedImage.value = null
      selectedImagePreview.value = ''
      uploadError.value = ''
    }

    // 获取图片完整URL
    const getImageUrl = (url) => {
      if (!url) return '';

      // 如果已经是完整URL则直接返回
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }

      // 获取API基础URL
      const apiBaseUrl = import.meta.env.VITE_BASE_API_URL || '';
      // 从API URL中提取基础服务器URL (去掉/api)
      const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');

      // 确保URL以/开头
      const imageUrl = url.startsWith('/') ? url : `/${url}`;

      return `${baseUrl}${imageUrl}`;
    }

    // 预览图片处理
    const previewImageHandler = (imageUrl) => {
      previewImage.value = {
        show: true,
        url: getImageUrl(imageUrl),
        scale: 1
      }
      // 阻止页面滚动
      document.body.style.overflow = 'hidden'
    }

    // 关闭图片预览
    const closeImagePreview = () => {
      previewImage.value.show = false
      previewImage.value.scale = 1
      // 恢复页面滚动
      document.body.style.overflow = ''
    }

    // 切换图片缩放
    const toggleImageZoom = () => {
      previewImage.value.scale = previewImage.value.scale === 1 ? 2 : 1
    }

    // 发送消息
    const sendMessage = async () => {
      if ((!messageContent.value.trim() && !selectedImage.value) || chatStore.loading || imageUploading.value) return

      if (!currentSession.value) {
        messageError.value = '请先选择一个聊天对象'
        return
      }

      try {
        messageError.value = ''

        // 如果有图片，先上传图片
        let mediaUrl = null
        if (selectedImage.value) {
          imageUploading.value = true
          try {
            const uploadResponse = await chatStore.uploadChatImage(selectedImage.value)

            if (uploadResponse.code === 200 && uploadResponse.data?.url) {
              mediaUrl = uploadResponse.data.url
              console.log("上传图片成功，URL:", mediaUrl)
            } else {
              throw new Error(uploadResponse.message || '图片上传失败')
            }
          } catch (error) {
            uploadError.value = error.message || '图片上传失败'
            imageUploading.value = false
            return
          }
        }

        // 发送消息
        const content = messageContent.value.trim()
        const contentType = selectedImage.value ? 1 : 0 // 1表示图片，0表示文本

        const response = await chatStore.sendMessage(
          content,
          contentType,
          mediaUrl
        )

        if (response && response.error) {
          messageError.value = response.message
        } else {
          // 清空输入
          messageContent.value = ''
          cancelImageUpload()

          // 滚动到底部
          await nextTick()
          scrollToBottom()
        }
      } catch (error) {
        messageError.value = error.message || '发送消息失败'
      } finally {
        imageUploading.value = false
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

    // 处理图片加载错误
    const handleImageError = (event, message) => {
      console.error('图片加载失败:', message.media_url)
      // 可以在这里设置一个默认图片或显示错误提示
      event.target.src = '/images/image-error.png'
      event.target.classList.add('img-error')
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

      // 添加点击外部关闭emoji选择器的事件
      document.addEventListener('click', closeEmojiPickerOnOutsideClick)

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
        // 移除点击外部关闭emoji选择器的事件
        document.removeEventListener('click', closeEmojiPickerOnOutsideClick)
        // 关闭WebSocket连接
        chatStore.closeSocket()
        // 清理会话数据
        console.log('清理当前聊天会话')
        chatStore.clearCurrentSession()

        // 确保恢复正常滚动
        document.body.style.overflow = ''
      })
    })

    // 点击外部关闭emoji选择器
    const closeEmojiPickerOnOutsideClick = (event) => {
      // 如果emoji选择器已打开且点击的不是选择器或表情按钮
      if (showEmojiPicker.value) {
        const isEmojiButton = event.target.closest('.emoji-toggle-btn')
        const isEmojiPicker = event.target.closest('.emoji-picker')

        if (!isEmojiButton && !isEmojiPicker) {
          showEmojiPicker.value = false
        }
      }
    }

    return {
      chatStore,
      authStore,
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
      checkSocketConnection,
      selectedImage,
      selectedImagePreview,
      imageUploading,
      uploadError,
      handleImageUpload,
      cancelImageUpload,
      getImageUrl,
      previewImage,
      previewImageHandler,
      closeImagePreview,
      toggleImageZoom,
      handleImageError,
      isSidebarOpen,
      toggleSidebar,
      showEmojiPicker,
      currentEmojiCategory,
      emojiCategories,
      emojiList,
      toggleEmojiPicker,
      changeEmojiCategory,
      addEmoji,
      closeEmojiPickerOnOutsideClick,
    }
  }
}
</script>

<style scoped>
/* 添加一些过渡动画效果 */
.transition-transform {
  transition: transform 0.3s ease;
}

/* 消息气泡的阴影效果 */
.message-item {
  transition: opacity 0.3s ease;
}

.message-item img {
  max-height: 200px;
}

/* 为文本消息添加过渡动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-item {
  animation: fadeIn 0.3s ease-in-out;
}

/* 优化滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Font Awesome 图标样式 */
.fas {
  display: inline-block;
  text-align: center;
}

button .fas,
label .fas {
  font-size: 1rem;
  width: 1rem;
  height: 1rem;
  line-height: 1;
}

/* 移动端样式优化 */
@media (max-width: 768px) {
  .min-h-screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 0 !important;
    margin: 0 !important;
    background-color: white !important;
  }

  .max-w-6xl {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    width: 100%;
  }

  .bg-white.rounded-lg {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .flex.flex-col.md\:flex-row {
    flex: 1;
  }

  [v-show="!isMobile || (isMobile && currentSession)"] {
    display: flex;
    flex-direction: column;
    height: 100vh !important;
  }

  .flex-1.p-3.overflow-y-auto {
    flex: 1;
    overflow-y: auto;
  }

  .p-3.border-b.bg-gray-50.flex.justify-between.items-center {
    padding: 10px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .border-t.p-3.bg-white {
    padding: 10px;
    position: sticky;
    bottom: 0;
    z-index: 10;
  }

  .border-t.p-3.bg-white button .fas,
  .border-t.p-3.bg-white label .fas {
    font-size: 1.125rem;
  }

  .message-item .max-w-\[75\%\] {
    max-width: 85%;
  }
}

/* Emoji选择器样式 */
.emoji-picker {
  margin-bottom: 8px;
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease-out;
  position: relative;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.emoji-btn {
  transition: all 0.15s ease;
  cursor: pointer;
  border-radius: 8px;
}

.emoji-btn:hover {
  transform: scale(1.2);
  background-color: #F0F2F5;
}

.emoji-btn:active {
  transform: scale(0.95);
}

/* TikTok风格-暗色模式选项 */
@media (prefers-color-scheme: dark) {
  .emoji-picker {
    background-color: #282828;
    border-color: #444;
  }

  .emoji-btn:hover {
    background-color: #383838;
  }

  .emoji-picker button {
    color: #eee;
  }
}
</style>

