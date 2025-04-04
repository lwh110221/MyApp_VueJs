<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">找回密码</h2>

      <!-- 步骤 1: 输入邮箱并获取验证码 -->
      <div v-if="step === 1" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-2">邮箱</label>
          <div class="flex space-x-2">
            <input
              v-model="email"
              type="email"
              class="flex-1 px-3 py-2 border rounded-lg"
              required
              placeholder="请输入注册邮箱"
            >
            <button
              type="button"
              @click="sendResetCode"
              class="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              :disabled="emailCodeLoading || emailCodeSent"
            >
              {{ emailCodeButtonText }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-gray-700 mb-2">验证码</label>
          <input
            v-model="verificationCode"
            type="text"
            class="w-full px-3 py-2 border rounded-lg"
            required
            maxlength="6"
            placeholder="请输入6位验证码"
          >
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
        <button
          @click="nextStep"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!email || !verificationCode || loading"
        >
          {{ loading ? '验证中...' : '下一步' }}
        </button>
      </div>

      <!-- 步骤 2: 设置新密码 -->
      <div v-if="step === 2" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-2">新密码</label>
          <input
            v-model="newPassword"
            type="password"
            class="w-full px-3 py-2 border rounded-lg"
            required
            minlength="6"
            placeholder="请输入新密码，至少6个字符"
          >
        </div>
        <div>
          <label class="block text-gray-700 mb-2">确认密码</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="请再次输入新密码"
          >
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
        <button
          @click="resetPassword"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!newPassword || !confirmPassword || loading"
        >
          {{ loading ? '提交中...' : '重置密码' }}
        </button>
      </div>

      <!-- 步骤 3: 重置成功 -->
      <div v-if="step === 3" class="space-y-4 text-center">
        <div class="flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-gray-700">密码重置成功！</p>
        <button
          @click="goToLogin"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          返回登录
        </button>
      </div>

      <div class="mt-4 text-center">
        <router-link to="/login" class="text-blue-500 hover:text-blue-600">
          记起密码了？返回登录
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { authService, messageService } from '../api'

export default {
  name: 'ForgotPassword',
  data() {
    return {
      step: 1,
      email: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: '',
      loading: false,
      errorMessage: '',
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
  beforeUnmount() {
    // 清除计时器
    if (this.emailCodeTimer) {
      clearInterval(this.emailCodeTimer)
    }
  },
  methods: {
    async sendResetCode() {
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.errorMessage = '请输入有效的邮箱地址'
        return
      }

      try {
        this.emailCodeLoading = true
        this.errorMessage = ''
        await authService.sendPasswordResetCode(this.email)

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
        console.error('发送重置码错误:', error.response?.data || error.message)
        this.errorMessage = error.response?.data?.message || '验证码发送失败'
        messageService.error(this.errorMessage)
      } finally {
        this.emailCodeLoading = false
      }
    },
    async nextStep() {
      // 验证输入
      if (!this.email || !this.verificationCode) {
        this.errorMessage = '请填写所有必填项'
        return
      }

      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.errorMessage = '请输入有效的邮箱地址'
        return
      }

      // 验证码格式检查
      if (this.verificationCode.length !== 6) {
        this.errorMessage = '请输入6位验证码'
        return
      }

      // 验证码正确性由后端验证，这里只验证格式
      this.errorMessage = ''
      this.step = 2
    },
    async resetPassword() {
      if (!this.newPassword || !this.confirmPassword) {
        this.errorMessage = '请填写所有必填项'
        return
      }

      if (this.newPassword.length < 6) {
        this.errorMessage = '密码至少需要6个字符'
        return
      }

      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = '两次输入的密码不一致'
        return
      }

      try {
        this.loading = true
        this.errorMessage = ''
        const resetData = {
          email: this.email,
          verificationCode: this.verificationCode,
          newPassword: this.newPassword
        }

        console.log('发送密码重置数据:', resetData)

        await authService.resetPasswordWithCode(resetData)

        // 重置成功，显示成功页面
        this.step = 3
        messageService.success('密码重置成功')
      } catch (error) {
        console.error('密码重置错误:', error.response?.data || error.message)
        this.errorMessage = error.response?.data?.message || '密码重置失败'
        messageService.error(this.errorMessage)

        // 如果是验证码错误，提供更明确的提示
        if (this.errorMessage.includes('验证码无效') || this.errorMessage.includes('验证码已过期')) {
          this.step = 1 // 返回第一步重新获取验证码
          messageService.error('验证码已失效，请重新获取')
          // 重置验证码状态
          this.emailCodeSent = false
          this.emailCodeCountdown = 0
          if (this.emailCodeTimer) {
            clearInterval(this.emailCodeTimer)
          }
        }
      } finally {
        this.loading = false
      }
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>
