<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center space-x-4 mb-6">
          <div class="relative">
            <img 
              :src="getImageUrl(profile.profile_picture)" 
              class="w-20 h-20 rounded-full object-cover"
              alt="用户头像"
            >
            <button 
              @click="$refs.fileInput.click()" 
              class="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <input 
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarChange"
            >
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-800">{{ profile.username }}</h2>
            <p class="text-gray-600">{{ profile.email }}</p>
            <p class="text-gray-600">积分：{{ profile.points || 0 }}</p>
            <p class="text-gray-600">注册时间：{{ formatDate(profile.created_at) }}</p>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">个人简介</h3>
          <div v-if="!isEditing" class="text-gray-600">
            {{ profile.bio || '暂无简介' }}
            <button 
              @click="isEditing = true" 
              class="text-blue-500 ml-2"
            >
              编辑
            </button>
          </div>
          <div v-else class="space-y-2">
            <textarea 
              v-model="editedBio" 
              class="w-full px-3 py-2 border rounded-lg"
              rows="3"
              placeholder="请输入个人简介"
            ></textarea>
            <div class="flex space-x-2">
              <button 
                @click="updateBio" 
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                保存
              </button>
              <button 
                @click="cancelEdit" 
                class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>

        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">修改密码</h3>
          <form @submit.prevent="changePassword" class="space-y-4 max-w-md">
            <div>
              <label class="block text-gray-700 mb-2">原密码</label>
              <input 
                v-model="passwordForm.oldPassword" 
                type="password" 
                class="w-full px-3 py-2 border rounded-lg"
                required
              >
            </div>
            <div>
              <label class="block text-gray-700 mb-2">新密码</label>
              <input 
                v-model="passwordForm.newPassword" 
                type="password" 
                class="w-full px-3 py-2 border rounded-lg"
                required
              >
            </div>
            <button 
              type="submit" 
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              修改密码
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Profile',
  data() {
    return {
      profile: {},
      isEditing: false,
      editedBio: '',
      passwordForm: {
        oldPassword: '',
        newPassword: ''
      }
    }
  },
  async created() {
    await this.fetchProfile()
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    async fetchProfile() {
      try {
        const response = await api.get('/api/users/profile')
        this.profile = response.data
        this.editedBio = this.profile.bio
      } catch (error) {
        alert(error.response?.data?.message || '获取个人信息失败')
      }
    },
    getImageUrl(path) {
      if (!path) return '/default-avatar.png'
      if (path.startsWith('http')) return path
      return `${import.meta.env.VITE_API_URL}${path}`
    },
    async handleAvatarChange(event) {
      const file = event.target.files[0]
      if (!file) return

      try {
        const formData = new FormData()
        formData.append('avatar', file)
        
        const response = await api.put('/api/users/profile/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        this.profile.profile_picture = response.data.avatarUrl
        alert('头像更新成功')
      } catch (error) {
        alert(error.response?.data?.message || '头像更新失败')
      }
    },
    async updateBio() {
      try {
        await api.put('/api/users/profile', {
          bio: this.editedBio
        })
        this.profile.bio = this.editedBio
        this.isEditing = false
      } catch (error) {
        alert(error.response?.data?.message || '更新简介失败')
      }
    },
    cancelEdit() {
      this.editedBio = this.profile.bio
      this.isEditing = false
    },
    async changePassword() {
      try {
        await api.put('/api/users/password', this.passwordForm)
        alert('密码修改成功')
        this.passwordForm.oldPassword = ''
        this.passwordForm.newPassword = ''
      } catch (error) {
        alert(error.response?.data?.message || '修改密码失败')
      }
    }
  }
}
</script> 