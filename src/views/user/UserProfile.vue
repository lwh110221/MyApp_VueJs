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
                <UserIdentities v-if="userProfile.identities && userProfile.identities.length > 0" :identities="userProfile.identities" class="ml-3" />
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
      </div>

      <!-- 关注/粉丝信息 -->
      <UserFollowCard
        v-if="userProfile && userId"
        :userId="userId"
      />

      <!-- 用户动态 -->
      <div v-if="userProfile" class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">用户动态</h3>
        </div>

        <MomentList
          v-if="userId"
          :userId="userId"
          :currentUserId="currentUserId"
        />
      </div>

      <!-- 用户不存在 -->
      <div v-else class="text-center py-12">
        <div class="text-gray-500 text-lg">用户不存在或已被删除</div>
        <router-link to="/" class="text-blue-500 hover:text-blue-700 mt-4 inline-block">
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
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
        // 重新获取用户资料
        await fetchUserProfile()
      } catch (error) {
        console.error('关注用户失败:', error)
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
        // 重新获取用户资料
        await fetchUserProfile()
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

    // 监听路由参数变化
    watch(() => route.params.id, (newId) => {
      if (newId) {
        userStore.clearUserProfile()
        fetchUserProfile()
      }
    })

    // 如果是当前用户查看自己的页面，重定向到个人中心
    watch(isCurrentUser, (value) => {
      if (value === true) {
        router.replace('/profile')
      }
    }, { immediate: true })

    onMounted(async () => {
      await authStore.checkAuth()
      fetchUserProfile()
    })

    return {
      userId,
      currentUserId,
      loading,
      userProfile,
      isCurrentUser,
      isLoggedIn,
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
