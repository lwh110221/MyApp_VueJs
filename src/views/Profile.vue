<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center space-x-4">
            <div class="relative">
              <img
                :src="authStore.userAvatar"
                class="w-20 h-20 rounded-full object-cover"
                alt="用户头像"
              >
              <button
                @click="$refs.fileInput.click()"
                class="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
                :disabled="authStore.loading"
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
              <div class="flex items-center">
                <h2 class="text-2xl font-bold text-gray-800">{{ authStore.user.username }}</h2>
                <!-- 身份标记 -->
                <UserIdentities v-if="identityStore.userIdentities.length > 0" :identities="identityStore.userIdentities" class="ml-3" />
              </div>
              <p class="text-gray-600">{{ authStore.user.email }}</p>
              <p class="text-gray-600">积分：{{ authStore.user.points || 0 }}</p>
              <p class="text-gray-600">注册时间：{{ formatDate(authStore.user.created_at) }}</p>
              <!-- 添加关注和粉丝信息的按钮 -->
              <button
                v-if="authStore.user.id"
                @click="showFollowModal = true"
                class="text-blue-500 hover:text-blue-600 mt-2"
              >
                查看关注/粉丝
              </button>
            </div>
          </div>

          <div class="relative" ref="settingsDropdown">
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
              <button
                @click="showIdentityModal = true; showSettings = false"
                class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                身份认证
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">个人简介</h3>
          <div v-if="!isEditing" class="text-gray-600">
            {{ authStore.user.bio || '暂无简介' }}
            <button
              @click="startEdit"
              class="text-blue-500 ml-2"
              :disabled="authStore.loading"
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

      <!-- 用户订单卡片 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">我的订单</h3>
          <router-link
            to="/orders"
            class="text-blue-500 hover:text-blue-600 flex items-center"
          >
            查看全部
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
        <div class="grid grid-cols-4 gap-4 text-center">
          <router-link to="/orders?status=0" class="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg">
            <div class="text-orange-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-gray-700">待付款</span>
          </router-link>
          <router-link to="/orders?status=1" class="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg">
            <div class="text-blue-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <span class="text-gray-700">待发货</span>
          </router-link>
          <router-link to="/orders?status=2" class="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg">
            <div class="text-purple-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <span class="text-gray-700">待收货</span>
          </router-link>
          <router-link to="/orders" class="flex flex-col items-center p-3 hover:bg-gray-50 rounded-lg">
            <div class="text-gray-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span class="text-gray-700">全部订单</span>
          </router-link>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">我的动态</h3>
          <button
            @click="showCreateMoment = true"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            :disabled="momentStore.loading"
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
          v-if="authStore.user.id"
          ref="momentList"
          :userId="authStore.user.id"
          :currentUserId="authStore.user.id"
        />
      </div>
    </div>

    <!-- 修改密码模态框 -->
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

    <!-- 关注/粉丝模态框 -->
    <div v-if="showFollowModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">关注与粉丝</h3>
          <button @click="showFollowModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <UserFollowCard
          v-if="authStore.user.id"
          :userId="authStore.user.id"
        />
      </div>
    </div>

    <!-- 身份认证模态框 -->
    <div v-if="showIdentityModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96 max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">身份认证</h3>
          <button @click="showIdentityModal = false" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <IdentityCard />
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import { useMomentStore } from '../stores/moment'
import { useIdentityStore } from '../stores/identity'
import { messageService } from '../api'
import CreateMoment from '../components/CreateMoment.vue'
import MomentList from '../components/MomentList.vue'
import ChangePassword from '../components/ChangePassword.vue'
import UserFollowCard from '../components/UserFollowCard.vue'
import IdentityCard from '../components/IdentityCard.vue'
import UserIdentities from '../components/UserIdentities.vue'

export default {
  name: 'Profile',
  components: {
    CreateMoment,
    MomentList,
    ChangePassword,
    UserFollowCard,
    IdentityCard,
    UserIdentities
  },
  setup() {
    const authStore = useAuthStore()
    const momentStore = useMomentStore()
    const identityStore = useIdentityStore()

    return {
      authStore,
      momentStore,
      identityStore
    }
  },
  data() {
    return {
      isEditing: false,
      editedBio: '',
      bioLoading: false,
      showSettings: false,
      showPasswordModal: false,
      showCreateMoment: false,
      showFollowModal: false,
      showIdentityModal: false,
      maxBioLength: 200
    }
  },
  computed: {
    bioCharCount() {
      return this.editedBio?.length || 0
    }
  },
  async created() {
    await this.authStore.checkAuth()
    // 加载用户身份信息
    this.identityStore.fetchUserIdentities()
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
    startEdit() {
      this.editedBio = this.authStore.user.bio || ''
      this.isEditing = true
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
        await this.authStore.updateAvatar(formData)
        event.target.value = ''
      } catch (error) {
        event.target.value = ''
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
        await this.authStore.updateProfile({
          bio: this.editedBio?.trim() || ''
        })
        this.isEditing = false
      } finally {
        this.bioLoading = false
      }
    },
    cancelEdit() {
      this.editedBio = this.authStore.user.bio || ''
      this.isEditing = false
    },
    handleClickOutside(event) {
      const settingsMenu = this.$refs.settingsDropdown
      if (settingsMenu && !settingsMenu.contains(event.target)) {
        this.showSettings = false
      }
    },
    onPasswordChanged() {
      this.showPasswordModal = false
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
