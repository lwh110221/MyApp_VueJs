<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">欢迎来到我的应用</h1>
      <div v-if="isLoggedIn" class="text-lg text-gray-600">
        <p>欢迎回来，{{ username }}！</p>
        <p class="text-sm text-gray-500 mt-2">{{ email }}</p>
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
      username: '',
      email: ''
    }
  },
  created() {
    this.checkAuth()
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      const email = localStorage.getItem('email')
      if (token && username && email) {
        this.isLoggedIn = true
        this.username = username
        this.email = email
      }
    }
  }
}
</script>
