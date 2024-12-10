<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">修改密码</h3>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-gray-700 mb-2">原密码</label>
        <input 
          v-model="form.oldPassword" 
          type="password" 
          class="w-full px-3 py-2 border rounded-lg"
          required
        >
      </div>
      <div>
        <label class="block text-gray-700 mb-2">新密码</label>
        <input 
          v-model="form.newPassword" 
          type="password" 
          class="w-full px-3 py-2 border rounded-lg"
          required
        >
      </div>
      <button 
        type="submit" 
        class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        修改密码
      </button>
    </form>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'ChangePassword',
  data() {
    return {
      form: {
        oldPassword: '',
        newPassword: ''
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
        await api.put('/api/users/password', this.form)
        this.$emit('password-changed')
        this.form.oldPassword = ''
        this.form.newPassword = ''
      } catch (error) {
        alert(error.response?.data?.message || '修改密码失败')
      }
    }
  }
}
</script> 