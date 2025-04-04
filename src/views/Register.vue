<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">注册</h2>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-2">用户名</label>
          <input
            v-model="username"
            type="text"
            class="w-full px-3 py-2 border rounded-lg"
            required
          >
        </div>
        <div>
          <label class="block text-gray-700 mb-2">邮箱</label>
          <div class="flex space-x-2">
            <input
              v-model="email"
              type="email"
              class="flex-1 px-3 py-2 border rounded-lg"
              required
            >
            <button
              type="button"
              @click="sendEmailCode"
              class="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              :disabled="emailCodeLoading || emailCodeSent"
            >
              {{ emailCodeButtonText }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-gray-700 mb-2">邮箱验证码</label>
          <input
            v-model="emailVerificationCode"
            type="text"
            class="w-full px-3 py-2 border rounded-lg"
            required
            maxlength="6"
            placeholder="请输入6位邮箱验证码"
          >
        </div>
        <div>
          <label class="block text-gray-700 mb-2">密码</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-3 py-2 border rounded-lg"
            required
          >
        </div>

        <!-- 图形验证码 -->
        <div>
          <label class="block text-gray-700 mb-2">图形验证码</label>
          <div class="flex space-x-2">
            <input
              v-model="captcha"
              type="text"
              class="flex-1 px-3 py-2 border rounded-lg"
              required
              maxlength="4"
            >
            <div
              class="w-32 h-10 bg-gray-100 flex items-center justify-center cursor-pointer"
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
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          :disabled="loading"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <div class="mt-4 text-center">
        <router-link to="/login" class="text-blue-500 hover:text-blue-600">
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
