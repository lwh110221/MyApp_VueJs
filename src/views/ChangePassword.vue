<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">修改密码</h2>
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
          <div>
            <label class="block text-gray-700 mb-2">确认新密码</label>
            <input 
              v-model="form.confirmPassword" 
              type="password" 
              class="w-full px-3 py-2 border rounded-lg"
              required
            >
            <p v-if="!passwordsMatch" class="text-red-500 text-sm mt-1">
              两次输入的密码不一致
            </p>
          </div>
          
          <!-- 图形验证码 -->
          <div>
            <label class="block text-gray-700 mb-2">验证码</label>
            <div class="flex space-x-2">
              <input 
                v-model="form.captcha" 
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

          <div class="flex space-x-4">
            <button 
              type="submit" 
              class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              :disabled="!passwordsMatch"
            >
              确认修改
            </button>
            <button 
              type="button"
              @click="$router.back()"
              class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              返回
            </button>
          </div>
        </form>
      </div>
    </div>
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
        newPassword: '',
        confirmPassword: '',
        captcha: ''
      },
      captchaUrl: ''
    }
  },
  computed: {
    passwordsMatch() {
      return !this.form.confirmPassword || 
        this.form.newPassword === this.form.confirmPassword
    }
  },
  created() {
    this.refreshCaptcha()
  },
  methods: {
    refreshCaptcha() {
      // 生成随机参数避免缓存
      const timestamp = new Date().getTime()
      this.captchaUrl = `${import.meta.env.VITE_API_URL}/api/captcha/generate?t=${timestamp}`
      this.form.captcha = ''
    },
    async handleSubmit() {
      if (!this.passwordsMatch) {
        return
      }

      try {
        await api.put('/api/users/password', {
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword,
          captcha: this.form.captcha
        })
        alert('密码修改成功')
        this.$router.back()
      } catch (error) {
        alert(error.response?.data?.message || '修改密码失败')
        // 刷新验证码
        this.refreshCaptcha()
      }
    }
  }
}
</script> 