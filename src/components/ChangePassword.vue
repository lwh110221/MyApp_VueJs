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
          :disabled="loading"
        >
      </div>
      <div>
        <label class="block text-gray-700 mb-2">新密码</label>
        <input
          v-model="form.newPassword"
          type="password"
          class="w-full px-3 py-2 border rounded-lg"
          required
          :disabled="loading"
        >
      </div>
      <div>
        <label class="block text-gray-700 mb-2">确认新密码</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          class="w-full px-3 py-2 border rounded-lg"
          required
          :disabled="loading"
        >
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
            :disabled="loading"
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
        class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!passwordsMatch || loading"
      >
        {{ loading ? '修改中...' : '修改密码' }}
      </button>
    </form>
  </div>
</template>

<script>
import { authService, messageService } from '../api'

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
      captchaUrl: '',
      loading: false
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
      this.captchaUrl = authService.getCaptchaUrl()
      this.form.captcha = ''
    },
    async handleSubmit() {
      if (!this.passwordsMatch || this.loading) {
        return
      }

      if (this.form.newPassword.length < 6) {
        messageService.warning('新密码长度不能少于6位')
        return
      }

      try {
        this.loading = true
        await authService.changePassword({
          oldPassword: this.form.oldPassword,
          newPassword: this.form.newPassword,
          captcha: this.form.captcha
        })

        messageService.success('密码修改成功')
        this.$emit('password-changed')

        // 重置表单
        this.form.oldPassword = ''
        this.form.newPassword = ''
        this.form.confirmPassword = ''
        this.refreshCaptcha()
      } catch (error) {
        messageService.error(error.response?.data?.message || '修改密码失败')
        this.refreshCaptcha()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
