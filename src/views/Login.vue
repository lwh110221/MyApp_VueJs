<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">登录</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-2">邮箱</label>
          <input
            v-model="email"
            type="email"
            class="w-full px-3 py-2 border rounded-lg"
            required
            :disabled="loading"
            placeholder="请输入邮箱"
          >
        </div>
        <div>
          <label class="block text-gray-700 mb-2">密码</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-3 py-2 border rounded-lg"
            required
            :disabled="loading"
            placeholder="请输入密码"
          >
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="mt-4 text-center">
        <router-link to="/register" class="text-blue-500 hover:text-blue-600">
          还没有账号？立即注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { authService, messageService } from '../api'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      if (this.loading) return
      this.errorMessage = ''

      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.errorMessage = '请输入有效的邮箱地址'
        return
      }

      try {
        this.loading = true
        const response = await authService.login({
          email: this.email,
          password: this.password
        })

        // 保存认证信息
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('username', response.data.username)
        localStorage.setItem('email', response.data.email)

        // 显示成功消息
        messageService.success('登录成功')

        // 通知父组件登录成功
        this.$emit('login-success')

        // 延迟跳转，确保token已经保存
        setTimeout(() => {
          this.$router.push('/')
        }, 100)
      } catch (error) {
        this.errorMessage = error.response?.data?.message || '登录失败'
        messageService.error(this.errorMessage)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
