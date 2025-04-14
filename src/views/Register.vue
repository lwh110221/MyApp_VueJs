<template>
  <div class="min-h-screen flex items-center justify-center register-page-bg py-10">
    <!-- 桌面端内框 -->
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto md:w-[460px] relative overflow-hidden register-card">
      <!-- 顶部装饰条 -->
      <div class="absolute top-0 left-0 right-0 h-2 bg-highland-600"></div>

      <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span class="inline-block w-1 h-6 bg-highland-600 mr-2"></span>
        注册
      </h2>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-2 font-medium">用户名</label>
          <input
            v-model="username"
            type="text"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-highland-500 focus:border-transparent transition"
            required
            placeholder="请输入用户名"
          >
        </div>
        <div>
          <label class="block text-gray-700 mb-2 font-medium">邮箱</label>
          <div class="flex space-x-2">
            <input
              v-model="email"
              type="email"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-highland-500 focus:border-transparent transition"
              required
              placeholder="请输入邮箱"
            >
            <button
              type="button"
              @click="sendEmailCode"
              class="bg-highland-600 text-white px-3 py-3 rounded-lg hover:bg-highland-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-md font-medium min-w-[108px] transition-all"
              :disabled="emailCodeLoading || emailCodeSent"
            >
              {{ emailCodeButtonText }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-gray-700 mb-2 font-medium">邮箱验证码</label>
          <input
            v-model="emailVerificationCode"
            type="text"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-highland-500 focus:border-transparent transition"
            required
            maxlength="6"
            placeholder="请输入6位邮箱验证码"
          >
        </div>
        <div>
          <label class="block text-gray-700 mb-2 font-medium">密码</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-highland-500 focus:border-transparent transition"
            required
            placeholder="请输入密码(至少6位)"
          >
        </div>
        <div>
          <label class="block text-gray-700 mb-2 font-medium">确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-highland-500 focus:border-transparent transition"
            required
            placeholder="请再次输入密码"
          >
        </div>

        <!-- 图形验证码 -->
        <div>
          <label class="block text-gray-700 mb-2 font-medium">图形验证码</label>
          <div class="flex space-x-2">
            <input
              v-model="captcha"
              type="text"
              class="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-highland-500 focus:border-transparent transition"
              required
              maxlength="4"
              placeholder="请输入验证码"
            >
            <div
              class="h-12 bg-gray-50 flex items-center justify-center cursor-pointer rounded-lg overflow-hidden border border-gray-200"
              @click="refreshCaptcha"
            >
              <img
                :src="captchaUrl"
                alt="验证码"
                class="h-full"
              >
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-highland-600 text-white py-3 rounded-lg hover:bg-highland-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg mt-6 font-medium"
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <div class="mt-6 text-center">
        <router-link to="/login" class="text-highland-600 hover:text-highland-700 font-medium">
          已有账号？立即登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { authService, messageService } from '../api'

export default {
  name: 'Register',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      captcha: '',
      captchaUrl: '',
      emailVerificationCode: '',
      loading: false,
      emailCodeLoading: false,
      emailCodeSent: false,
      emailCodeCountdown: 0,
      emailCodeTimer: null
    }
  },
  computed: {
    emailCodeButtonText() {
      if (this.emailCodeLoading) return '发送中...'
      if (this.emailCodeSent) return `${this.emailCodeCountdown}s后重发`
      return '获取验证码'
    }
  },
  created() {
    this.refreshCaptcha()
  },
  beforeUnmount() {
    // 清除计时器
    if (this.emailCodeTimer) {
      clearInterval(this.emailCodeTimer)
    }
  },
  methods: {
    refreshCaptcha() {
      this.captchaUrl = authService.getCaptchaUrl()
      this.captcha = ''
    },
    async sendEmailCode() {
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        messageService.error('请输入有效的邮箱地址')
        return
      }

      try {
        this.emailCodeLoading = true
        await authService.sendEmailVerificationCode(this.email)

        // 发送成功，开始倒计时
        this.emailCodeSent = true
        this.emailCodeCountdown = 60
        this.emailCodeTimer = setInterval(() => {
          if (this.emailCodeCountdown <= 1) {
            clearInterval(this.emailCodeTimer)
            this.emailCodeSent = false
          } else {
            this.emailCodeCountdown--
          }
        }, 1000)

        messageService.success('验证码已发送至您的邮箱')
      } catch (error) {
        messageService.error(error.response?.data?.message || '验证码发送失败')
      } finally {
        this.emailCodeLoading = false
      }
    },
    async handleRegister() {
      if (this.loading) return

      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        messageService.error('请输入有效的邮箱地址')
        return
      }

      // 密码长度验证
      if (this.password.length < 6) {
        messageService.error('密码至少需要6个字符')
        return
      }

      // 验证两次密码是否一致
      if (this.password !== this.confirmPassword) {
        messageService.error('两次输入的密码不一致')
        return
      }

      // 验证邮箱验证码
      if (!this.emailVerificationCode || this.emailVerificationCode.length !== 6) {
        messageService.error('请输入6位邮箱验证码')
        return
      }

      // 验证图形验证码
      if (!this.captcha || this.captcha.length !== 4) {
        messageService.error('请输入4位图形验证码')
        this.refreshCaptcha()
        return
      }

      try {
        this.loading = true
        const registerData = {
          username: this.username,
          email: this.email,
          password: this.password,
          captcha: this.captcha,
          verificationCode: this.emailVerificationCode
        }

        console.log('注册请求参数:', registerData)

        await authService.register(registerData)

        messageService.success('注册成功，请登录')
        this.$router.push('/login')
      } catch (error) {
        const errorMsg = error.response?.data?.message || '注册失败'
        messageService.error(errorMsg)

        // 根据错误信息提供更具体的指导
        if (errorMsg.includes('验证码无效') || errorMsg.includes('验证码已过期')) {
          messageService.error('邮箱验证码已失效，请重新获取')
          // 重置验证码状态
          this.emailCodeSent = false
          this.emailCodeCountdown = 0
          if (this.emailCodeTimer) {
            clearInterval(this.emailCodeTimer)
          }
        }

        this.refreshCaptcha()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-page-bg {
  background: linear-gradient(135deg, #f0f9f0 0%, #ffffff 100%);
  position: relative;
}

.register-page-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to bottom, var(--color-highland-700), var(--color-highland-600));
  z-index: 0;
}

.register-card {
  z-index: 1;
  border-top: 4px solid var(--color-highland-600);
}

@media (max-width: 640px) {
  .register-card {
    box-shadow: none;
    border-radius: 0;
    background-color: transparent;
    padding: 10px 16px;
    width: 100%;
    max-width: 100%;
  }

  .register-page-bg::before {
    height: 120px;
  }

  form {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .register-page-bg {
    padding-top: 0;
    padding-bottom: 0;
  }

  h2 {
    color: white;
    margin-top: 10px;
  }

  h2 .inline-block {
    background-color: white;
  }
}
</style>
