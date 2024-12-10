<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">登录</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
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
          <label class="block text-gray-700 mb-2">密码</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-3 py-2 border rounded-lg"
            required
          >
        </div>
        <button 
          type="submit" 
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          登录
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
import api from '../services/api'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await api.post('/api/users/login', {
          username: this.username,
          password: this.password
        })
        
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('username', response.data.username)
        
        this.$emit('login-success')
        
        this.$router.push('/')
      } catch (error) {
        alert(error.response?.data?.message || '登录失败')
      }
    }
  }
}
</script> 