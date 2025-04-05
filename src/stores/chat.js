import { defineStore } from 'pinia'
import { chatService } from '../api'
import { ref, computed } from 'vue'
import io from 'socket.io-client'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const sessions = ref([])
  const currentSession = ref(null)
  const currentPartnerId = ref(null)
  const chatHistory = ref([])
  const loading = ref(false)
  const error = ref(null)
  const unreadCount = ref(0)
  const socket = ref(null)
  const historyPagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // 已回复用户ID集合，用于判断是否首次收到消息
  const repliedUserIds = ref(new Set())

  // 计算属性
  const sortedSessions = computed(() => {
    return [...sessions.value].sort((a, b) => {
      const timeA = new Date(a.lastTime).getTime()
      const timeB = new Date(b.lastTime).getTime()
      return timeB - timeA
    })
  })

  const currentPartnerName = computed(() => {
    if (!currentSession.value) return ''
    return currentSession.value.partnerName
  })

  const hasMoreHistory = computed(() => {
    return historyPagination.value.page * historyPagination.value.pageSize < historyPagination.value.total
  })

  // 用户是否已回复过消息
  const isPartnerReplied = computed(() => {
    if (!currentPartnerId.value) return false
    return repliedUserIds.value.has(Number(currentPartnerId.value))
  })

  // 方法
  // 初始化WebSocket连接
  const initSocketConnection = () => {
    // 如果已经有连接，先断开
    if (socket.value) {
      console.log('WebSocket已连接，断开重连')
      socket.value.disconnect()
      socket.value = null
    }

    const token = localStorage.getItem('token')
    if (!token) {
      console.log('未找到token，无法建立WebSocket连接')
      return
    }

    console.log('初始化WebSocket连接...')
    // 使用环境变量或后端API基础URL推导WebSocket URL
    const apiBaseUrl = import.meta.env.VITE_BASE_API_URL || 'http://localhost:3000/api'
    let wsBaseUrl = import.meta.env.VITE_WS_URL

    if (!wsBaseUrl) {
      // 如果没有设置VITE_WS_URL，则从API URL推导
      // 先尝试替换HTTPS/HTTP为WSS/WS
      wsBaseUrl = apiBaseUrl.replace('/api', '').replace('https://', 'wss://').replace('http://', 'ws://')
      console.log('使用从API URL推导的WebSocket URL:', wsBaseUrl)
    }

    try {
      // 更可靠的Socket.IO配置
      socket.value = io(wsBaseUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'], // 尝试WebSocket，回退到轮询
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        path: '/socket.io', // 确保路径正确
        withCredentials: true, // 允许跨域请求发送凭证
        extraHeaders: {
          'Authorization': `Bearer ${token}`
        }
      })

      // 连接成功
      socket.value.on('connect', () => {
        console.log('WebSocket连接成功，socket ID:', socket.value.id)
      })

      // 连接错误
      socket.value.on('connect_error', (error) => {
        console.error('WebSocket连接失败:', error.message || error)
        console.error('错误详情:', error.description || '无详细信息')
        console.error('错误上下文:', error.context || '无上下文信息')

        // 在错误时尝试使用纯轮询模式重连
        if (socket.value.io.opts.transports.includes('websocket')) {
          console.log('尝试仅使用polling传输方式重连...')
          socket.value.io.opts.transports = ['polling']
          socket.value.connect()
        }
      })

      // 连接超时
      socket.value.io.on('reconnect_attempt', (attempt) => {
        console.log(`WebSocket尝试重连 (${attempt})...`)
      })

      // 监听新消息
      socket.value.on('new_message', (message) => {
        console.log('收到新消息:', message)

        // 将发送给我的消息发送者添加到已回复用户集合，确保可以回复
        if (message.sender_id) {
          repliedUserIds.value.add(Number(message.sender_id))
        }

        // 确保消息有正确的content_type字段
        if (message.content_type === undefined) {
          message.content_type = 0 // 默认为文本类型
        }

        // 如果是当前会话，添加到聊天历史并标记为已读
        if (currentPartnerId.value &&
           (message.sender_id === Number(currentPartnerId.value) ||
            message.receiver_id === Number(currentPartnerId.value))) {
          // 添加消息到当前聊天历史中，创建新数组以确保响应式更新
          chatHistory.value = [...chatHistory.value, message]

          // 如果是当前会话收到的新消息，立即标记为已读
          if (message.session_id && currentSession.value?.sessionId === message.session_id) {
            markSessionAsRead(message.session_id)
          }
        }

        // 更新会话列表
        updateSessionsAfterNewMessage(message)
      })

      // 监听消息已读通知
      socket.value.on('message_read', (data) => {
        console.log('消息已读通知:', data)
        if (data && data.sessionId) {
          // 更新会话列表中的未读数量
          const session = sessions.value.find(s => s.sessionId === data.sessionId)
          if (session) {
            session.unreadCount = 0
          }
          // 更新总未读数
          fetchUnreadCount()
        }
      })

      // 断开连接
      socket.value.on('disconnect', (reason) => {
        console.log('WebSocket断开连接, 原因:', reason)
      })
    } catch (error) {
      console.error('初始化WebSocket失败:', error)
    }

    // 返回一个清理函数，用于断开连接
    return () => {
      console.log('执行WebSocket清理函数')
      if (socket.value) {
        socket.value.disconnect()
        socket.value = null
      }
    }
  }

  // 新消息后更新会话列表
  const updateSessionsAfterNewMessage = (message) => {
    const partnerId = message.sender_id
    const existingSessionIndex = sessions.value.findIndex(s => s.partnerId === partnerId)

    if (existingSessionIndex !== -1) {
      // 更新现有会话
      const session = sessions.value[existingSessionIndex]
      session.lastMessage = message.content
      session.contentType = message.content_type
      session.lastTime = message.send_time
      session.unreadCount += 1
    } else {
      // 创建新会话
      sessions.value.push({
        sessionId: message.session_id,
        partnerId: partnerId,
        partnerName: message.sender_name,
        partnerAvatar: message.sender_avatar,
        lastMessage: message.content,
        contentType: message.content_type,
        lastTime: message.send_time,
        unreadCount: 1
      })
    }
  }

  // 获取聊天会话列表
  const fetchSessions = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await chatService.getSessions()
      sessions.value = response.data || []

      // 更新已回复用户ID集合
      sessions.value.forEach(session => {
        // 如果这个会话有回复（不是空对话，或者不是我发的最后一条），则加入已回复集合
        if (session.lastMessage && session.partnerId) {
          repliedUserIds.value.add(session.partnerId)
        }
      })

      return response
    } catch (err) {
      error.value = err.message || '获取聊天会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取与特定用户的聊天历史
  const fetchChatHistory = async (partnerId, reset = true) => {
    if (!partnerId) return

    try {
      loading.value = true
      error.value = null
      currentPartnerId.value = partnerId

      // 重置分页或获取下一页
      const page = reset ? 1 : historyPagination.value.page + 1

      const response = await chatService.getChatHistory(partnerId, {
        page,
        limit: historyPagination.value.pageSize
      })

      // 更新分页信息
      historyPagination.value = {
        page,
        pageSize: response.data.pagination.pageSize,
        total: response.data.pagination.total
      }

      // 更新消息列表
      if (reset) {
        chatHistory.value = response.data.list || []
      } else {
        // 加载更多时，将新消息添加到开头
        chatHistory.value = [...response.data.list, ...chatHistory.value]
      }

      // 从历史记录中检查用户是否已回复
      checkForRepliesInHistory(partnerId, chatHistory.value)

      // 查找并设置当前会话
      const session = sessions.value.find(s => s.partnerId === Number(partnerId))
      if (session) {
        currentSession.value = session

        // 如果当前session有未读消息，则标记为已读
        if (session.unreadCount > 0 && session.sessionId) {
          markSessionAsRead(session.sessionId)
        }
      }

      return response
    } catch (err) {
      error.value = err.message || '获取聊天历史失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 检查历史记录中是否有对方的回复
  const checkForRepliesInHistory = (partnerId, messages) => {
    const partnerIdNum = Number(partnerId)
    const hasReply = messages.some(msg => msg.sender_id === partnerIdNum)

    if (hasReply) {
      repliedUserIds.value.add(partnerIdNum)
    }
  }

  // 发送消息
  const sendMessage = async (content, contentType = 0, mediaUrl = null) => {
    if (!currentPartnerId.value) return null

    // 检查是否是首次发送且对方未回复
    const isFirstUnrepliedMessage = !isPartnerReplied.value &&
                                  chatHistory.value.filter(msg =>
                                    msg.receiver_id === Number(currentPartnerId.value)
                                  ).length > 0

    // 如果是第一条以后的消息，且对方未回复，则前端拦截
    if (isFirstUnrepliedMessage) {
      return {
        error: true,
        message: '对方尚未回复，暂时无法发送更多消息'
      }
    }

    try {
      loading.value = true
      error.value = null

      const messageData = {
        receiverId: currentPartnerId.value,
        content,
        contentType,
        mediaUrl
      }

      const response = await chatService.sendMessage(messageData)
      console.log('发送消息响应:', response)

      // 将新消息添加到历史记录
      if (response.data) {
        // 创建新数组以确保响应式更新
        chatHistory.value = [...chatHistory.value, response.data]

        // 更新或创建会话
        updateSessionsAfterSent(response.data)
      }

      return response
    } catch (err) {
      error.value = err.message || '发送消息失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新发送消息后的会话列表
  const updateSessionsAfterSent = (message) => {
    if (!message) return

    const partnerId = message.receiver_id
    const existingSessionIndex = sessions.value.findIndex(s => s.partnerId === partnerId)

    if (existingSessionIndex !== -1) {
      // 更新现有会话
      const session = sessions.value[existingSessionIndex]
      session.lastMessage = message.content
      session.contentType = message.content_type
      session.lastTime = message.send_time
    } else if (currentSession.value) {
      // 创建新会话
      sessions.value.push({
        sessionId: message.session_id,
        partnerId: partnerId,
        partnerName: currentSession.value.partnerName || '未知用户',
        partnerAvatar: currentSession.value.partnerAvatar,
        lastMessage: message.content,
        contentType: message.content_type,
        lastTime: message.send_time,
        unreadCount: 0
      })
    }
  }

  // 上传聊天图片
  const uploadChatImage = async (file) => {
    try {
      loading.value = true
      error.value = null

      const formData = new FormData()
      formData.append('image', file)

      const response = await chatService.uploadImage(formData)
      return response
    } catch (err) {
      error.value = err.message || '上传图片失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 标记会话消息为已读
  const markSessionAsRead = async (sessionId) => {
    if (!sessionId) return

    try {
      const response = await chatService.markSessionAsRead(sessionId)

      // 更新本地会话的未读数量
      const session = sessions.value.find(s => s.sessionId === sessionId)
      if (session) {
        session.unreadCount = 0
      }

      return response
    } catch (err) {
      console.error('标记消息已读失败:', err)
    }
  }

  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const response = await chatService.getUnreadCount()
      unreadCount.value = response.data?.total || 0

      // 更新会话列表中的未读数量
      if (response.data?.sessions) {
        response.data.sessions.forEach(item => {
          const session = sessions.value.find(s => s.sessionId === item.sessionId)
          if (session) {
            session.unreadCount = item.unreadCount
          }
        })
      }

      return response
    } catch (err) {
      console.error('获取未读消息数量失败:', err)
    }
  }

  // 删除会话
  const deleteSession = async (sessionId) => {
    try {
      loading.value = true
      error.value = null

      const response = await chatService.deleteSession(sessionId)

      // 从本地会话列表中移除
      sessions.value = sessions.value.filter(s => s.sessionId !== sessionId)

      // 如果当前会话被删除，则清空当前会话
      if (currentSession.value && currentSession.value.sessionId === sessionId) {
        currentSession.value = null
        currentPartnerId.value = null
        chatHistory.value = []
      }

      return response
    } catch (err) {
      error.value = err.message || '删除会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 初始化聊天会话 - 用于与指定用户开始聊天
  const initChatSession = async (partnerId, partnerName, partnerAvatar) => {
    if (!partnerId) {
      console.error('初始化聊天会话失败: 未提供partnerId')
      return null
    }

    console.log(`正在初始化与用户${partnerId}(${partnerName})的聊天会话`)

    try {
      loading.value = true
      error.value = null

      // 先检查是否已存在此会话
      const existingSession = sessions.value.find(s => s.partnerId === Number(partnerId))
      if (existingSession) {
        console.log('已找到现有会话:', existingSession)
        currentPartnerId.value = Number(partnerId)
        currentSession.value = existingSession

        // 获取聊天历史
        await fetchChatHistory(partnerId, true)
        return existingSession
      }

      // 如果不存在，创建临时会话对象
      const tempSession = {
        sessionId: null, // 实际sessionId将在发送第一条消息后获得
        partnerId: Number(partnerId),
        partnerName: partnerName || '用户',
        partnerAvatar: partnerAvatar || '',
        lastMessage: '',
        lastTime: new Date().toISOString(),
        unreadCount: 0
      }

      console.log('创建临时会话:', tempSession)
      currentPartnerId.value = Number(partnerId)
      currentSession.value = tempSession

      // 获取聊天历史，可能为空
      await fetchChatHistory(partnerId, true)

      return tempSession
    } catch (err) {
      console.error('初始化聊天会话失败:', err)
      error.value = err.message || '初始化聊天会话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 清除当前会话
  const clearCurrentSession = () => {
    currentSession.value = null
    currentPartnerId.value = null
    chatHistory.value = []
  }

  // 关闭WebSocket连接
  const closeSocket = () => {
    console.log('关闭WebSocket连接')
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
  }

  // 处理新消息
  const handleNewMessage = (message) => {
    console.log('收到新消息:', message)

    // 查找或创建会话
    let session = findOrCreateSession(message.senderId, message.senderName, message.senderAvatar)

    // 将消息添加到聊天历史
    if (currentSession.value?.partnerId === message.senderId) {
      // 如果是当前会话的消息，直接添加到历史记录
      chatHistory.value.push(message)
      // 立即标记为已读
      if (session.sessionId) {
        markSessionAsRead(session.sessionId)
      }
    } else {
      // 如果不是当前会话，增加未读计数
      session.unreadCount++
    }

    // 更新会话列表中的最新消息
    session.lastMessage = message.content
    session.lastTime = message.timestamp

    // 将会话移到列表顶部
    moveSessionToTop(session)

    // 获取总未读消息数
    fetchUnreadCount()
  }

  // 处理消息已读通知
  const handleMessageRead = (data) => {
    console.log('收到消息已读通知:', data)
    const { sessionId } = data

    // 查找并更新会话的未读计数
    const session = sessions.value.find(s => s.sessionId === sessionId)
    if (session) {
      session.unreadCount = 0
      // 更新总未读消息数
      fetchUnreadCount()
    }
  }

  // 将会话移到列表顶部
  const moveSessionToTop = (session) => {
    const index = sessions.value.findIndex(s => s.partnerId === session.partnerId)
    if (index > -1) {
      sessions.value.splice(index, 1)
    }
    sessions.value.unshift(session)
  }

  return {
    // 状态
    sessions,
    currentSession,
    currentPartnerId,
    chatHistory,
    loading,
    error,
    unreadCount,
    historyPagination,
    repliedUserIds,
    socket,

    // 计算属性
    sortedSessions,
    currentPartnerName,
    hasMoreHistory,
    isPartnerReplied,

    // 方法
    initSocketConnection,
    fetchSessions,
    fetchChatHistory,
    sendMessage,
    uploadChatImage,
    markSessionAsRead,
    fetchUnreadCount,
    deleteSession,
    initChatSession,
    clearCurrentSession,
    closeSocket,
    handleNewMessage,
    handleMessageRead,
    moveSessionToTop
  }
})
