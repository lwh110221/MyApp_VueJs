<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">欢迎来到我的应用</h1>
      <div v-if="isLoggedIn" class="text-lg text-gray-600">
        欢迎回来，{{ username }}！
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      isLoggedIn: false,
      username: ''
    }
  },
  created() {
    this.checkAuth()
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      if (token && username) {
        this.isLoggedIn = true
        this.username = username
      }
    }
  }
}
</script> 