<template>
  <div class="min-h-screen flex items-center justify-center login-page-bg">
    <!-- 桌面端内框 -->
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto md:w-96 relative overflow-hidden login-card">
      <!-- 顶部装饰条 -->
      <div class="absolute top-0 left-0 right-0 h-2 bg-highland-600"></div>

      <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span class="inline-block w-1 h-6 bg-highland-600 mr-2"></span>
        登录
      </h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-2 font-medium">邮箱</label>
          <input
            v-model="email"
            type="email"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-highland-500 focus:border-transparent transition"
            required
            :disabled="loading"
            placeholder="请输入邮箱"
          >
        </div>
        <div>
          <label class="block text-gray-700 mb-2 font-medium">密码</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-highland-500 focus:border-transparent transition"
            required
            :disabled="loading"
            placeholder="请输入密码"
          >
          <div class="text-right mt-1">
            <router-link to="/forgot-password" class="text-sm text-highland-600 hover:text-highland-700">
              忘记密码？
            </router-link>
          </div>
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>
        <button
          type="submit"
          class="w-full bg-highland-600 text-white py-3 rounded-lg hover:bg-highland-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="mt-6 text-center">
        <router-link to="/register" class="text-highland-600 hover:text-highland-700 font-medium">
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

<style scoped>
.login-page-bg {
  background: linear-gradient(135deg, #f0f9f0 0%, #ffffff 100%);
  position: relative;
}

.login-page-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to bottom, var(--color-highland-700), var(--color-highland-600));
  z-index: 0;
}

.login-card {
  z-index: 1;
  border-top: 4px solid var(--color-highland-600);
}

@media (max-width: 640px) {
  .login-card {
    box-shadow: none;
    border-radius: 0;
    background-color: transparent;
    padding: 10px 16px;
    margin-top: 20px;
    width: 100%;
    max-width: 100%;
  }

  .login-page-bg::before {
    height: 140px;
  }

  form {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
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
