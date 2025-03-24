<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- 用户资料卡片 -->
      <div v-else-if="userProfile" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-start mb-6">
          <div class="flex items-center space-x-4">
            <img
              :src="getUserAvatar(userProfile.profile_picture)"
              class="w-20 h-20 rounded-full object-cover"
              alt="用户头像"
            >
            <div>
              <div class="flex items-center">
                <h2 class="text-2xl font-bold text-gray-800">{{ userProfile.username }}</h2>
                <!-- 用户身份标识 -->
                <UserIdentities
                  v-if="userProfile.identities && userProfile.identities.length > 0"
                  :identities="userProfile.identities"
                  class="ml-3"
                />
              </div>
              <p v-if="userProfile.bio" class="text-gray-600 mt-1">{{ userProfile.bio }}</p>
              <p class="text-gray-500 text-sm mt-1">注册时间：{{ formatDate(userProfile.created_at) }}</p>

              <!-- 粉丝和关注数 -->
              <div class="flex space-x-3 mt-2 text-sm">
                <span class="text-gray-600">关注：{{ userProfile.following_count || 0 }}</span>
                <span class="text-gray-600">粉丝：{{ userProfile.followers_count || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- 关注按钮 -->
          <div>
            <button
              v-if="isLoggedIn && !isCurrentUser && !userProfile.is_followed"
              @click="followUser"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              :disabled="followLoading"
            >
              {{ followLoading ? '处理中...' : '关注' }}
            </button>
            <button
              v-if="isLoggedIn && !isCurrentUser && userProfile.is_followed"
              @click="unfollowUser"
              class="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50"
              :disabled="unfollowLoading"
            >
              {{ unfollowLoading ? '处理中...' : '已关注' }}
            </button>
          </div>
        </div>

        <!-- 用户积分 -->
        <div class="mb-6 p-3 bg-blue-50 rounded-lg">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-blue-800">用户积分：{{ userProfile.points || 0 }}</h3>
            <router-link
              v-if="isCurrentUser"
              to="/points/history"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              积分明细 →
            </router-link>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="border-t pt-6">
          <h3 class="text-xl font-semibold mb-4">最近动态</h3>
          <MomentList :user-id="userId" :key="'moments_' + userId" />
        </div>
      </div>

      <!-- 用户不存在或已被禁用 -->
      <div v-else class="bg-white rounded-lg shadow-md p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">用户不存在或已被禁用</h3>
        <p class="mt-1 text-gray-500">该用户可能已被删除或禁用，请返回首页。</p>
        <div class="mt-6">
          <router-link to="/" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useAuthStore } from '../../stores/auth'
import MomentList from '../../components/MomentList.vue'
import UserFollowCard from '../../components/UserFollowCard.vue'
import UserIdentities from '../../components/UserIdentities.vue'

export default {
  name: 'UserProfile',
  components: {
    MomentList,
    UserFollowCard,
    UserIdentities
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const authStore = useAuthStore()

    const loading = ref(true)
    const followLoading = ref(false)
    const unfollowLoading = ref(false)

    // 获取路由参数中的用户ID
    const userId = computed(() => route.params.id)

    // 当前登录用户ID
    const currentUserId = computed(() => authStore.user?.id)

    // 判断是否为当前用户自己的页面
    const isCurrentUser = computed(() => userId.value === currentUserId.value)

    // 判断是否已登录
    const isLoggedIn = computed(() => authStore.isLoggedIn)

    // 用户资料
    const userProfile = computed(() => userStore.userProfile)

    // 获取用户资料
    const fetchUserProfile = async () => {
      if (!userId.value) return

      try {
        loading.value = true
        await userStore.fetchUserProfile(userId.value)
        console.log('获取到的用户资料:', userProfile.value)
      } catch (error) {
        console.error('获取用户资料失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 关注用户
    const followUser = async () => {
      if (followLoading.value) return

      try {
        followLoading.value = true
        await userStore.followUser(userId.value)

        // 手动更新当前用户资料中的关注状态，无需重新获取全部数据
        if (userProfile.value) {
          userProfile.value.is_followed = true
          userProfile.value.follower_count += 1
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message === '已经关注过该用户') {
          // 如果已经关注过，强制更新状态为已关注
          if (userProfile.value) {
            userProfile.value.is_followed = true
          }
        } else {
          console.error('关注用户失败:', error)
        }
      } finally {
        followLoading.value = false
      }
    }

    // 取消关注
    const unfollowUser = async () => {
      if (unfollowLoading.value) return

      try {
        unfollowLoading.value = true
        await userStore.unfollowUser(userId.value)

        // 手动更新当前用户资料中的关注状态，无需重新获取全部数据
        if (userProfile.value) {
          userProfile.value.is_followed = false
          userProfile.value.follower_count = Math.max(0, userProfile.value.follower_count - 1)
        }
      } catch (error) {
        console.error('取消关注失败:', error)
      } finally {
        unfollowLoading.value = false
      }
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // 获取用户头像
    const getUserAvatar = (profilePicture) => {
      if (!profilePicture) return '/default-avatar.png'
      if (profilePicture.startsWith('http')) {
        return profilePicture
      }
      return `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${profilePicture}`
    }

    // 监听用户ID变化，重新获取用户资料
    watchEffect(() => {
      if (userId.value) {
        fetchUserProfile()
      }
    })

    onMounted(() => {
      fetchUserProfile()
    })

    return {
      userId,
      userProfile,
      isCurrentUser,
      isLoggedIn,
      loading,
      followLoading,
      unfollowLoading,
      followUser,
      unfollowUser,
      formatDate,
      getUserAvatar
    }
  }
}
</script>

<style scoped>
/* 如果有任何样式，可以在这里添加 */
</style>
