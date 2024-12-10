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
          <input 
            v-model="email" 
            type="email" 
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
          注册
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
import api from '../services/api'

export default {
  name: 'Register',
  data() {
    return {
      username: '',
      email: '',
      password: ''
    }
  },
  methods: {
    async handleRegister() {
      try {
        await api.post('/api/users/register', {
          username: this.username,
          email: this.email,
          password: this.password
        })
        
        this.$router.push('/login')
      } catch (error) {
        alert(error.response?.data?.message || '注册失败')
      }
    }
  }
}
</script> 