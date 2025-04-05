<template>
  <div class="ai-chat-container">
    <!-- 添加遮罩层，点击时关闭侧边栏 -->
    <div
      v-if="isSidebarOpen"
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>

    <div class="sessions-sidebar" :class="{ 'mobile-open': isSidebarOpen }">
      <div class="sidebar-header">
        <h2>我的对话</h2>
        <div class="sidebar-actions">
          <button class="new-session-btn" @click="createNewSession">
            <i class="fas fa-plus"></i> 新对话
          </button>
          <button class="settings-btn" @click="showSettings = !showSettings">
            <i class="fas fa-cog"></i>
          </button>
          <!-- 添加关闭按钮，在移动端显示 -->
          <button class="close-sidebar-btn" @click="toggleSidebar">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="settings-panel" v-if="showSettings">
        <div class="setting-item">
          <input type="checkbox" id="autoCreateSession" v-model="autoCreateOnEnter">
          <label for="autoCreateSession">每次进入自动创建新对话</label>
        </div>
        <div class="setting-item">
          <input type="checkbox" id="preserveMarkdown" v-model="preserveMarkdown">
          <label for="preserveMarkdown">实时渲染Markdown</label>
        </div>
        <div class="setting-item">
          <input type="checkbox" id="typingEffect" v-model="typingEnabled">
          <label for="typingEffect">打字机效果</label>
        </div>
        <div class="setting-item" v-if="typingEnabled">
          <label for="typingSpeed">打字速度</label>
          <select id="typingSpeed" v-model="typingBaseSpeed">
            <option value="5">极快</option>
            <option value="15">快速</option>
            <option value="30">适中</option>
            <option value="50">慢速</option>
          </select>
        </div>
      </div>

      <div class="sessions-list">
        <div v-if="sessions.length === 0" class="no-sessions">
          <p>暂无对话记录</p>
          <button class="start-btn" @click="createNewSession">开始新对话</button>
        </div>
        <div
          v-for="session in sessions"
          :key="session.sessionId"
          class="session-item"
          :class="{ 'active': currentSessionId === session.sessionId }"
          @click="switchSession(session.sessionId)"
        >
          <div class="session-info">
            <i class="fas fa-comments"></i>
            <span class="session-time">{{ formatDate(session.updatedAt) }}</span>
          </div>
          <div class="session-actions">
            <button class="action-btn" @click.stop="clearSessionMessages(session.sessionId)">
              <i class="fas fa-eraser"></i>
            </button>
            <button class="action-btn delete" @click.stop="deleteSession(session.sessionId)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <button class="toggle-sidebar-btn" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </button>
        <h1>农业知识助手</h1>
        <button class="clear-btn" @click="clearCurrentSession" :disabled="loading || !currentSessionId">
          <i class="fas fa-trash"></i> 清除历史
        </button>
      </div>

      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <template v-if="messages.length === 0">
          <div class="welcome-message">
            <h2>您好，我是农业知识助手</h2>
            <p>您可以向我咨询关于农业种植、养殖、病虫害防治等各类问题。</p>
            <div class="suggestions">
              <div class="suggestion-title">您可以尝试：</div>
              <button
                v-for="(question, index) in suggestedQuestions"
                :key="index"
                class="suggestion"
                @click="useQuestion(question)"
              >
                {{ question }}
              </button>
              <button class="refresh-suggestions" @click="loadRandomQuestions">
                <i class="fas fa-sync-alt"></i> 换一批
              </button>
            </div>
          </div>
        </template>

        <!-- 消息数量提醒 -->
        <div v-if="messages.length >= 15 && messages.length < 20" class="message-limit-alert">
          <div class="notification-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>开启新对话获得更好的结果</span>
          </div>
          <button @click="createNewSession">新建</button>
        </div>

        <!-- 消息数量警告 -->
        <div v-if="messages.length >= 20" class="message-limit-warning">
          <div class="notification-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>已达对话上限，请新建对话</span>
          </div>
          <button @click="createNewSession">新建</button>
        </div>

        <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
          <div class="message-avatar">
            <i :class="message.role === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
          </div>
          <div class="message-content">
            <pre v-if="message.role === 'user'">{{ message.content }}</pre>
            <div v-else class="markdown-content">
              <div v-if="index === messages.length - 1 && isTyping" class="typing-text">
                <div v-if="preserveMarkdown" v-html="formatMessage(message.content)"></div>
                <pre v-else class="plain-text">{{ message.content }}</pre>
                <span class="typing-cursor"></span>
              </div>
              <div v-else v-html="formatMessage(message.content)"></div>
            </div>
          </div>
        </div>

        <div ref="messagesEnd"></div>
      </div>

      <div class="chat-input-container" v-if="messages.length < 20">
        <textarea
          v-model="inputMessage"
          @keydown.enter.prevent="onEnterPress"
          placeholder="输入您的问题..."
          :disabled="loading"
          ref="inputField"
          rows="1"
        ></textarea>
        <button class="send-button" @click="sendMessage" :disabled="!canSend">
          <i :class="loading ? 'fas fa-circle-notch fa-spin' : 'fas fa-paper-plane'"></i>
        </button>
      </div>

      <div class="chat-limit-notice" v-if="messages.length >= 20">
        <span>已达对话上限</span>
        <button @click="createNewSession">新建对话</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { aiService } from '@/api'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { getRandomAgricultureQuestions } from '@/utils/agricultureQuestions'

export default {
  name: 'AiChat',
  setup() {
    const isSidebarOpen = ref(false)
    const sessions = ref([])
    const currentSessionId = ref(null)
    const showSettings = ref(false)
    const autoCreateOnEnter = ref(localStorage.getItem('ai_auto_create') === 'true')
    const typingEnabled = ref(localStorage.getItem('ai_typing_effect') !== 'false') // 默认启用
    const typingBaseSpeed = ref(parseInt(localStorage.getItem('ai_typing_speed')) || 15) // 基础打字速度
    const preserveMarkdown = ref(localStorage.getItem('ai_preserve_markdown') !== 'false') // 默认启用实时Markdown渲染
    const firstLoad = ref(true)

    // 聊天状态
    const messages = ref([])
    const inputMessage = ref('')
    const loading = ref(false)
    const abortController = ref(null)
    const messagesContainer = ref(null)
    const messagesEnd = ref(null)
    const inputField = ref(null)
    const isTyping = ref(false)
    const typingQueue = ref([])
    const isProcessingQueue = ref(false)
    const markdownCache = ref(new Map())
    const lastRenderTime = ref(0)

    const suggestedQuestions = ref([])

    const canSend = computed(() =>
      inputMessage.value.trim() !== '' && !loading.value
    )

    watch(autoCreateOnEnter, (newVal) => {
      localStorage.setItem('ai_auto_create', newVal)
    })

    watch(typingEnabled, (newVal) => {
      localStorage.setItem('ai_typing_effect', newVal)
    })

    watch(typingBaseSpeed, (newVal) => {
      localStorage.setItem('ai_typing_speed', newVal)
    })

    watch(preserveMarkdown, (newVal) => {
      localStorage.setItem('ai_preserve_markdown', newVal)
    })

    // ==== 会话管理方法 ====
    const loadSessions = async () => {
      try {
        sessions.value = await aiService.getSessions()

        // 判断是否首次加载且需要自动创建新会话
        if (firstLoad.value && autoCreateOnEnter.value) {
          // 创建新会话而不考虑是否已有会话
          await createNewSession()
          firstLoad.value = false
        } else if (sessions.value.length > 0) {
          // 如果有会话且不需要自动创建，则选择第一个
          await switchSession(sessions.value[0].sessionId)
          firstLoad.value = false
        } else if (sessions.value.length === 0) {
          // 如果没有会话，则创建新会话
          await createNewSession()
          firstLoad.value = false
        }
      } catch (error) {
        console.error('加载会话列表失败:', error)
        firstLoad.value = false
      }
    }

    const createNewSession = async () => {
      if (loading.value) return

      try {
        loading.value = true
        const sessionId = await aiService.createSession()
        // 添加到会话列表
        sessions.value.unshift({
          sessionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        // 切换到新会话
        await switchSession(sessionId)
        // 关闭移动端侧边栏
        isSidebarOpen.value = false
      } catch (error) {
        console.error('创建新会话失败:', error)
      } finally {
        loading.value = false
      }
    }

    const switchSession = async (sessionId) => {
      if (sessionId === currentSessionId.value) return

      try {
        loading.value = true
        currentSessionId.value = sessionId
        messages.value = []
        messages.value = await aiService.getSessionMessages(sessionId)
        scrollToBottom()
      } catch (error) {
        console.error('切换会话失败:', error)
      } finally {
        loading.value = false
      }
    }

    const deleteSession = async (sessionId) => {
      if (!window.confirm('确定要删除这个对话吗？此操作不可撤销。')) return

      try {
        const success = await aiService.deleteSession(sessionId)
        if (success) {
          // 从会话列表中移除
          sessions.value = sessions.value.filter(s => s.sessionId !== sessionId)

          // 如果删除的是当前会话
          if (sessionId === currentSessionId.value) {
            currentSessionId.value = null
            messages.value = []

            // 如果还有其他会话，切换到第一个
            if (sessions.value.length > 0) {
              await switchSession(sessions.value[0].sessionId)
            } else {
              // 如果没有其他会话，创建一个新会话
              await createNewSession()
            }
          }
        }
      } catch (error) {
        console.error('删除会话失败:', error)
      }
    }

    const clearSessionMessages = async (sessionId) => {
      if (!window.confirm('确定要清空这个对话的所有消息吗？此操作不可撤销。')) return

      try {
        const success = await aiService.clearSessionMessages(sessionId)
        if (success && sessionId === currentSessionId.value) {
          messages.value = []
        }
      } catch (error) {
        console.error('清空会话消息失败:', error)
      }
    }

    const clearCurrentSession = () => {
      if (currentSessionId.value) {
        clearSessionMessages(currentSessionId.value)
      }
    }

    // ==== 聊天相关方法 ====
    const scrollToBottom = async () => {
      await nextTick()
      messagesEnd.value?.scrollIntoView({ behavior: 'smooth' })
    }

    // 初始化markdown-it实例
    const md = MarkdownIt({
      html: false,           // 禁用HTML标签以避免XSS风险
      xhtmlOut: false,       // 使用'/'闭合单标签 (<br />)
      breaks: true,          // 将\n转换为<br>
      linkify: true,         // 自动转换URL为链接
      typographer: true      // 启用一些语言中性的替换和引号美化
    });

    const formatMessage = (content) => {
      if (!content) return '';

      if (markdownCache.value.has(content)) {
        return markdownCache.value.get(content);
      }

      try {
        // 使用markdown-it解析markdown内容
        const rendered = md.render(content);

        // 使用DOMPurify净化HTML以防止XSS攻击
        const sanitizedHtml = DOMPurify.sanitize(rendered, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a',
            'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'
          ],
          ALLOWED_ATTR: ['href', 'target', 'value', 'class']
        });

        markdownCache.value.set(content, sanitizedHtml);
        return sanitizedHtml;
      } catch (e) {
        console.error('Markdown格式化错误:', e);
        // 出现错误时，返回纯文本
        const fallbackText = content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');

        markdownCache.value.set(content, fallbackText);
        return fallbackText;
      }
    };

    // 加载随机问题
    const loadRandomQuestions = () => {
      suggestedQuestions.value = getRandomAgricultureQuestions(3)
    }

    // 使用建议的问题
    const useQuestion = (question) => {
      inputMessage.value = question
      if (canSend.value) {
        sendMessage()
      }
    }

    // 文本框自动调整高度
    const adjustTextareaHeight = () => {
      if (!inputField.value) return
      inputField.value.style.height = 'auto'
      inputField.value.style.height = Math.min(inputField.value.scrollHeight, 120) + 'px'
    }

    // 处理Enter键发送消息
    const onEnterPress = (e) => {
      if (e.shiftKey) return // Shift+Enter 允许换行
      sendMessage()
    }

    // 发送消息
    const sendMessage = async () => {
      const message = inputMessage.value.trim()
      if (!message || loading.value) return

      // 如果没有当前会话，先创建一个新会话
      if (!currentSessionId.value) {
        try {
          await createNewSession()
        } catch (error) {
          console.error('自动创建会话失败:', error)
          return
        }
      }

      // 如果切换了渲染设置，清除缓存
      markdownCache.value.clear()

      // 添加用户消息
      messages.value.push({ role: 'user', content: message })
      inputMessage.value = ''
      adjustTextareaHeight()
      scrollToBottom()

      loading.value = true

      try {
        // 使用会话ID发送消息
        const { eventSource, abort } = aiService.sendChatStream(message, currentSessionId.value)

        // 保存中止控制器引用
        abortController.value = { abort }

        // 添加助手消息占位符
        messages.value.push({ role: 'assistant', content: '' })
        const assistantMessageIndex = messages.value.length - 1

        // 处理事件流中的消息
        eventSource.onmessage = (event) => {
          try {
            const eventData = JSON.parse(event.data)

            if (eventData.type === 'start') {
              // 开始接收消息，重置助手消息内容
              messages.value[assistantMessageIndex].content = ''
              isTyping.value = true
              typingQueue.value = []
            } else if (eventData.type === 'update') {
              // 收到增量更新，将新内容直接追加到现有内容
              const newContent = eventData.content || ''

              // 直接添加内容，不再逐字添加，避免破坏Markdown格式
              if (newContent) {
                typingQueue.value.push(newContent)

                // 如果不在处理队列，开始模拟打字
                if (!isProcessingQueue.value) {
                  processTypingQueue(assistantMessageIndex)
                }

                // 滚动到底部
                nextTick(() => {
                  scrollToBottom()
                })
              }
            } else if (eventData.type === 'end') {
              // 消息接收完毕，确保完整内容已更新
              if (eventData.fullContent && messages.value[assistantMessageIndex].content !== eventData.fullContent) {
                // 确保队列中包含完整内容
                const currentContent = messages.value[assistantMessageIndex].content
                const remaining = eventData.fullContent.substring(currentContent.length)
                if (remaining) {
                  typingQueue.value.push(remaining)
                  if (!isProcessingQueue.value) {
                    processTypingQueue(assistantMessageIndex)
                  }
                }
              }

              scrollToBottom()

              const sessionIndex = sessions.value.findIndex(s => s.sessionId === currentSessionId.value)
              if (sessionIndex !== -1) {
                sessions.value[sessionIndex].updatedAt = new Date().toISOString()
              }

              eventSource.close()
              loading.value = false
              abortController.value = null
            }
          } catch (e) {
          }
        }

        // 处理错误
        eventSource.onerror = (error) => {
          eventSource.close()

          // 如果AI尚未回复，添加错误消息
          if (!messages.value[assistantMessageIndex].content) {
            messages.value[assistantMessageIndex].content = '很抱歉，连接出现问题。请稍后重试。'
          }

          loading.value = false
          abortController.value = null
        }
      } catch (error) {
        messages.value.push({
          role: 'assistant',
          content: '很抱歉，发生了一些错误。请稍后重试或联系管理员。'
        })
        scrollToBottom()
        loading.value = false
        abortController.value = null
      }
    }

    const processTypingQueue = async (messageIndex) => {
      if (isProcessingQueue.value) return

      isProcessingQueue.value = true

      while (typingQueue.value.length > 0) {
        const chunk = typingQueue.value.shift()

        if (!typingEnabled.value) {
          messages.value[messageIndex].content += chunk
          markdownCache.value.delete(messages.value[messageIndex].content)
          continue
        }

        let dynamicDelay = typingBaseSpeed.value;

        const isCodeBlock = chunk.includes('```') || chunk.includes('    ') || chunk.includes('\t');
        const isList = /^\s*[-*+]\s/.test(chunk) || /^\s*\d+\.\s/.test(chunk);
        const isQuote = chunk.trim().startsWith('>');

        if (chunk.length > 100) {
          dynamicDelay = Math.max(1, typingBaseSpeed.value / 3);
        } else if (isCodeBlock || isList || isQuote) {
          dynamicDelay = Math.max(2, typingBaseSpeed.value / 2);
        }

        if (preserveMarkdown.value) {
          const blockSize = 3;
          for (let i = 0; i < chunk.length; i += blockSize) {
            const subChunk = chunk.substring(i, Math.min(i + blockSize, chunk.length));

            messages.value[messageIndex].content += subChunk;

            markdownCache.value.delete(messages.value[messageIndex].content);

            await new Promise(resolve => setTimeout(resolve, dynamicDelay * Math.min(subChunk.length, 3)));
          }
        } else {
          for (let i = 0; i < chunk.length; i++) {
            messages.value[messageIndex].content += chunk[i];

            if (!/[\s\r\n.,!?;:'"(){}[\]<>]/.test(chunk[i])) {
              await new Promise(resolve => setTimeout(resolve, dynamicDelay));
            } else if (chunk[i] === '\n') {
              await new Promise(resolve => setTimeout(resolve, dynamicDelay * 2));
            }
          }
        }
      }

      isProcessingQueue.value = false

      // 如果队列已空且事件源关闭，完成打字动画
      if (typingQueue.value.length === 0 && !loading.value) {
        isTyping.value = false
      }
    }

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''

      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      // 今天
      if (diffDays === 0) {
        return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      }
      // 昨天
      else if (diffDays === 1) {
        return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      }
      // 一周内
      else if (diffDays < 7) {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        return `${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      }
      // 更早
      else {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      }
    }

    // 生命周期钩子
    onMounted(() => {
      loadSessions()
      adjustTextareaHeight()
      // 设置输入框自动调整高度
      watch(inputMessage, adjustTextareaHeight)
      // 加载随机问题
      loadRandomQuestions()
    })

    onUnmounted(() => {
      // 清理工作，如果请求还在进行中则中止
      if (abortController.value) {
        abortController.value.abort()
      }
    })

    // 监听preserveMarkdown的变化，当切换设置时清空缓存
    watch(preserveMarkdown, () => {
      // 清空Markdown缓存，确保渲染状态一致
      markdownCache.value.clear();
    });

    return {
      // 会话管理
      isSidebarOpen,
      sessions,
      currentSessionId,
      showSettings,
      autoCreateOnEnter,
      typingEnabled,
      typingBaseSpeed,
      preserveMarkdown,
      firstLoad,
      loadSessions,
      createNewSession,
      switchSession,
      deleteSession,
      clearSessionMessages,
      clearCurrentSession,
      toggleSidebar,
      formatDate,

      // 聊天相关
      messages,
      inputMessage,
      loading,
      messagesContainer,
      messagesEnd,
      inputField,
      canSend,
      sendMessage,
      formatMessage,
      useQuestion,
      onEnterPress,
      isTyping,

      // 随机问题
      suggestedQuestions,
      loadRandomQuestions
    }
  }
}
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  height: calc(100vh - 100px);
  max-width: 1200px;
  margin: 20px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 会话侧边栏样式 */
.sessions-sidebar {
  width: 280px;
  border-right: 1px solid rgba(224, 224, 224, 0.5);
  display: flex;
  flex-direction: column;
  background: rgba(249, 249, 249, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-actions {
  display: flex;
  gap: 8px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.new-session-btn, .settings-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.settings-btn {
  padding: 8px;
  background: #607d8b;
}

.new-session-btn:hover {
  background: #388E3C;
}

.settings-btn:hover {
  background: #455a64;
}

/* 设置面板 */
.settings-panel {
  padding: 16px;
  background: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.setting-item label {
  font-size: 0.9rem;
  color: #555;
}

.setting-item select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #fff;
  font-size: 0.9rem;
}

.setting-item select:focus {
  outline: none;
  border-color: #4CAF50;
}

.sessions-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.no-sessions {
  text-align: center;
  padding: 20px;
  color: #666;
}

.start-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}

.session-item {
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.25s ease;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(240, 240, 240, 0.5);
}

.session-item:hover {
  background: rgba(240, 240, 240, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.session-item.active {
  background: rgba(232, 245, 233, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-left: 3px solid rgba(76, 175, 80, 0.7);
  box-shadow: 0 3px 12px rgba(76, 175, 80, 0.1);
}

.session-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.session-info i {
  color: #4CAF50;
  font-size: 1.1rem;
}

.session-time {
  font-size: 0.85rem;
  color: #666;
}

.session-actions {
  display: flex;
  gap: 8px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #e0e0e0;
}

.action-btn.delete:hover {
  background: #ffebee;
  color: #f44336;
}

/* 主聊天区域样式 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toggle-sidebar-btn {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  box-shadow: 0 2px 10px rgba(76, 175, 80, 0.2);
}

.chat-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: none;
  color: white;
  padding: 7px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.25s;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.clear-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: rgba(248, 249, 250, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.welcome-message {
  text-align: center;
  margin: 40px auto;
  max-width: 600px;
  padding: 35px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.07);
  border: 1px solid rgba(240, 240, 240, 0.6);
}

.welcome-message h2 {
  color: #388E3C;
  margin-bottom: 16px;
}

.suggestions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-title {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.suggestion {
  background: rgba(241, 248, 233, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(220, 237, 200, 0.5);
  padding: 14px 18px;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s;
  color: #388E3C;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.05);
}

.suggestion:hover {
  background: rgba(220, 237, 200, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
}

.message {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #2196F3;
}

.message-content {
  margin: 0 12px;
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 70%;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow-wrap: break-word;  /* 确保长单词换行 */
  word-break: break-word;     /* 在适当的位置断开单词 */
  overflow: hidden;           /* 防止内容溢出 */
}

.message.user .message-content {
  background: rgba(227, 242, 253, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(187, 222, 251, 0.3);
}

.message.assistant .message-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-left: 3px solid rgba(232, 245, 233, 0.8);
  border: 1px solid rgba(232, 245, 233, 0.5);
}

.message.assistant:last-child .message-content {
  box-shadow: 0 4px 15px rgba(72, 154, 75, 0.12);
}

.message-content pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}

.chat-input-container {
  display: flex;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(238, 238, 238, 0.7);
  align-items: flex-end;
}

textarea {
  flex: 1;
  border: 1px solid rgba(221, 221, 221, 0.7);
  border-radius: 24px;
  padding: 12px 20px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  outline: none;
  max-height: 120px;
  transition: all 0.3s;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

textarea:focus {
  border-color: rgba(76, 175, 80, 0.8);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 15px rgba(76, 175, 80, 0.1);
}

.send-button {
  margin-left: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.125rem;
  transition: all 0.3s;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(76, 175, 80, 0.2);
}

.send-button:hover {
  background: rgba(56, 142, 60, 0.95);
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.send-button:disabled {
  background: rgba(204, 204, 204, 0.8);
  cursor: not-allowed;
  box-shadow: none;
  transform: scale(1);
}

/* Markdown内容的样式 */
.markdown-content {
  line-height: 1.6;
  min-height: 1.6em;
  overflow-anchor: none;
  word-break: break-word;
  overflow-wrap: break-word;
}

.markdown-content p {
  margin: 0.8em 0;
}

.markdown-content p:first-child {
  margin-top: 0;
}

.markdown-content p:last-child {
  margin-bottom: 0;
}

.markdown-content ul, .markdown-content ol {
  padding-left: 1.5em;
  margin: 0.8em 0;
}

.markdown-content ul li, .markdown-content ol li {
  margin-bottom: 6px;
}

.markdown-content pre {
  background: #f5f5f5;
  padding: 0.8em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
  position: relative;
  transition: background-color 0.2s ease;
  max-width: 100%;  /* 限制最大宽度 */
  white-space: pre-wrap; /* 允许代码换行 */
}

.markdown-content code {
  background: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-content pre code {
  padding: 0;
  background: transparent;
  white-space: pre-wrap; /* 允许代码换行 */
  word-break: break-word; /* 在适当的位置断开单词 */
}

.markdown-content h1, .markdown-content h2, .markdown-content h3 {
  margin: 1.5em 0 0.5em;
  font-weight: 600;
  color: #2E7D32;
  border-bottom: 1px solid #e8f5e9;
  padding-bottom: 5px;
}

.markdown-content h1:first-child, .markdown-content h2:first-child, .markdown-content h3:first-child {
  margin-top: 0;
}

.markdown-content strong {
  color: #1B5E20;
}

.markdown-content blockquote {
  border-left: 4px solid #A5D6A7;
  padding-left: 12px;
  color: #455A64;
  font-style: italic;
  margin: 12px 0;
}

.markdown-content a {
  color: #0288D1;
  text-decoration: none;
  border-bottom: 1px dotted #0288D1;
}

.markdown-content a:hover {
  border-bottom: 1px solid #0288D1;
}

.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #C8E6C9;
  border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #81C784;
}

.typing-text {
  display: inline-block;
  position: relative;
  width: 100%;
}

.typing-text div {
  display: inline;
}

.typing-text .typing-cursor {
  position: relative;
  display: inline-block;
  margin-left: 1px;
  top: 3px;
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  background-color: #4CAF50;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 响应式样式调整 */
@media screen and (max-width: 768px) {
  .ai-chat-container {
    height: calc(100vh - 80px);
    margin: 10px;
    border-radius: 8px;
    position: relative;
  }

  .sessions-sidebar {
    position: absolute;
    left: -280px;
    top: 0;
    bottom: 0;
    z-index: 100;
    transition: left 0.3s ease;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .sessions-sidebar.mobile-open {
    left: 0;
  }

  .toggle-sidebar-btn {
    display: block;
  }

  .message-content {
    max-width: 85%;
  }

  /* 在移动端显示关闭按钮 */
  .close-sidebar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* 消息数量提醒和警告样式 */
.message-limit-alert, .message-limit-warning {
  position: sticky;
  top: 10px;
  z-index: 10;
  margin: 0 auto 10px;
  width: fit-content;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.85rem;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  max-width: 90%;
  transition: all 0.3s ease;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.message-limit-alert {
  background-color: rgba(255, 243, 224, 0.65);
  border: 1px solid rgba(255, 224, 178, 0.2);
  color: #e65100;
}

.message-limit-warning {
  background-color: rgba(255, 235, 238, 0.65);
  border: 1px solid rgba(255, 205, 210, 0.2);
  color: #c62828;
}

.message-limit-alert i, .message-limit-warning i {
  font-size: 1rem;
}

.message-limit-alert button, .message-limit-warning button {
  background: rgba(76, 175, 80, 0.8);
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.message-limit-alert button:hover, .message-limit-warning button:hover {
  background: rgba(56, 142, 60, 0.9);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* 达到对话上限提示 */
.chat-limit-notice {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(238, 238, 238, 0.5);
  font-size: 0.9rem;
  color: #c62828;
}

.chat-limit-notice button {
  background: rgba(76, 175, 80, 0.85);
  color: white;
  border: none;
  padding: 7px 15px;
  border-radius: 18px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.chat-limit-notice button:hover {
  background: rgba(56, 142, 60, 0.95);
  transform: scale(1.05);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
}

/* 添加换一批按钮样式 */
.refresh-suggestions {
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(220, 237, 200, 0.5);
  padding: 10px 14px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  color: #2E7D32;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.refresh-suggestions:hover {
  background: rgba(232, 245, 233, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
}

.refresh-suggestions i {
  font-size: 0.85rem;
}

/* 列表样式完全重写 */
.markdown-content ol,
.markdown-content ul {
  display: block;
  list-style: revert !important;
  margin-top: 1em !important;
  margin-bottom: 1em !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 30px !important;
}

.markdown-content ol {
  list-style-type: decimal !important;
}

.markdown-content ol ol {
  list-style-type: lower-alpha !important;
}

.markdown-content ol ol ol {
  list-style-type: lower-roman !important;
}

.markdown-content ul {
  list-style-type: disc !important;
}

.markdown-content ul ul {
  list-style-type: circle !important;
}

.markdown-content ul ul ul {
  list-style-type: square !important;
}

.markdown-content li {
  display: list-item !important;
  margin-bottom: 0.5em !important;
  list-style-position: outside !important;
}

.markdown-content li p {
  margin: 0 !important;
}

/* 纯文本样式，移除绿色边框和特殊背景 */
.plain-text {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  color: inherit !important;
  white-space: pre-wrap !important;
  font-family: inherit !important;
  line-height: inherit !important;
}

.markdown-content table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
  overflow-x: auto;
  display: block;
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #ddd;
  padding: 6px 10px;
  text-align: left;
}

.markdown-content table th {
  background-color: #f0f0f0;
  font-weight: bold;
}

.markdown-content table tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* 添加遮罩层样式 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* 关闭按钮样式 */
.close-sidebar-btn {
  display: none;
  background: #e57373;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.close-sidebar-btn:hover {
  background: #ef5350;
}
</style>
