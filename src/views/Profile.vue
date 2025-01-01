<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center space-x-4">
            <div class="relative">
              <img
                :src="getImageUrl(profile.profile_picture)"
                class="w-20 h-20 rounded-full object-cover"
                alt="用户头像"
              >
              <button
                @click="$refs.fileInput.click()"
                class="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
                :disabled="loading"
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

          <div class="relative">
            <button
              @click="showSettings = !showSettings"
              class="text-gray-600 hover:text-gray-800"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </button>

            <div v-if="showSettings" class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-10">
              <button
                @click="showPasswordModal = true; showSettings = false"
                class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                修改密码
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">个人简介</h3>
          <div v-if="!isEditing" class="text-gray-600">
            {{ profile.bio || '暂无简介' }}
            <button
              @click="isEditing = true"
              class="text-blue-500 ml-2"
              :disabled="loading"
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
              :disabled="bioLoading"
            ></textarea>
            <div class="flex space-x-2">
              <button
                @click="updateBio"
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                :disabled="bioLoading"
              >
                {{ bioLoading ? '保存中...' : '保存' }}
              </button>
              <button
                @click="cancelEdit"
                class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                :disabled="bioLoading"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">我的动态</h3>
          <button
            @click="showCreateMoment = true"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            :disabled="loading"
          >
            发布动态
          </button>
        </div>

        <CreateMoment
          v-if="showCreateMoment"
          @moment-created="onMomentCreated"
          @close="showCreateMoment = false"
        />

        <MomentList
          v-if="profile.id"
          ref="momentList"
          :userId="profile.id"
          :currentUserId="profile.id"
        />
      </div>
    </div>

    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">修改密码</h3>
          <button @click="showPasswordModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <ChangePassword @password-changed="onPasswordChanged" />
      </div>
    </div>
  </div>
</template>

<script>
import { authService, messageService } from '../api'
import CreateMoment from '../components/CreateMoment.vue'
import MomentList from '../components/MomentList.vue'
import ChangePassword from '../components/ChangePassword.vue'

export default {
  name: 'Profile',
  components: {
    CreateMoment,
    MomentList,
    ChangePassword
  },
  data() {
    return {
      profile: {
        id: '',
        username: '',
        email: '',
        bio: '',
        points: 0,
        profile_picture: '',
        created_at: new Date().toISOString()
      },
      loading: true,
      isEditing: false,
      editedBio: '',
      bioLoading: false,
      showSettings: false,
      showPasswordModal: false,
      showCreateMoment: false,
      maxBioLength: 200
    }
  },
  computed: {
    bioCharCount() {
      return this.editedBio?.length || 0
    }
  },
  async created() {
    await this.fetchProfile()
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    async fetchProfile() {
      try {
        this.loading = true
        const userInfo = await authService.getProfile()
        console.log('Profile userInfo:', userInfo)

        if (!userInfo || !userInfo.id) {
          throw new Error('未获取到用户信息')
        }

        // 更新个人信息
        this.profile = {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          bio: userInfo.bio || '',
          points: userInfo.points || 0,
          profile_picture: userInfo.profile_picture || '',
          created_at: userInfo.created_at,
          status: userInfo.status
        }

        // 设置编辑状态的简介
        this.editedBio = this.profile.bio
      } catch (error) {
        console.error('获取个人信息失败:', error)

        // 如果是 API 错误
        if (error.response) {
          messageService.error(error.response.data?.message || '获取个人信息失败')
          if (error.response.status === 401) {
            this.$router.push('/login')
          }
        } else {
          // 如果是其他错误（如未获取到用户信息）
          messageService.error(error.message || '获取个人信息失败')
          this.$router.push('/login')
        }
      } finally {
        this.loading = false
      }
    },
    getImageUrl(path) {
      if (!path) return '/default-avatar.png'
      if (path.startsWith('http')) return path
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '')
      return `${baseUrl}${path}`
    },
    async handleAvatarChange(event) {
      const file = event.target.files[0]
      if (!file) return

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        messageService.error('请上传 JPG 或 PNG 格式的图片')
        event.target.value = ''
        return
      }

      // 验证文件大小（限制为 5MB）
      if (file.size > 5 * 1024 * 1024) {
        messageService.error('图片大小不能超过 5MB')
        event.target.value = ''
        return
      }

      try {
        const formData = new FormData()
        formData.append('avatar', file)

        this.loading = true
        console.log('Uploading avatar:', {
          name: file.name,
          type: file.type,
          size: file.size
        })

        const response = await authService.updateAvatar(formData)
        console.log('Upload response:', response)

        if (response.avatarUrl) {
          this.profile.profile_picture = response.avatarUrl
          this.$emit('avatar-updated', response.avatarUrl)
          messageService.success(response.message || '头像更新成功')
        } else {
          throw new Error('未获取到头像URL')
        }
      } catch (error) {
        console.error('头像更新失败:', error)
        if (error.response?.status === 404) {
          messageService.error('上传接口不存在，请联系管理员')
        } else {
          messageService.error(error.response?.data?.message || error.message || '头像更新失败')
        }
      } finally {
        this.loading = false
        event.target.value = '' // 重置 input
      }
    },
    async updateBio() {
      if (this.bioLoading) return
      if (this.bioCharCount > this.maxBioLength) {
        messageService.warning(`简介不能超过${this.maxBioLength}字`)
        return
      }

      try {
        this.bioLoading = true
        await authService.updateProfile({
          bio: this.editedBio?.trim() || ''
        })

        this.profile.bio = this.editedBio?.trim() || ''
        this.isEditing = false
        messageService.success('个人简介更新成功')
      } catch (error) {
        messageService.error(error.response?.data?.message || '更新个人简介失败')
      } finally {
        this.bioLoading = false
      }
    },
    cancelEdit() {
      this.editedBio = this.profile.bio || ''
      this.isEditing = false
    },
    handleClickOutside(event) {
      const settingsMenu = this.$el.querySelector('.relative')
      if (settingsMenu && !settingsMenu.contains(event.target)) {
        this.showSettings = false
      }
    },
    onPasswordChanged() {
      this.showPasswordModal = false
      messageService.success('密码修改成功')
    },
    onMomentCreated(newMoment) {
      if (this.$refs.momentList) {
        this.$refs.momentList.addNewMoment(newMoment)
      }
      this.showCreateMoment = false
    }
  }
}
</script>
