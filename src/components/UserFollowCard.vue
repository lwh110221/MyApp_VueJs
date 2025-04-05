<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- 标题栏 -->
    <div class="flex px-6 pt-5 pb-4 border-b border-gray-100">
      <button
        @click="activeTab = 'following'"
        class="relative px-4 py-2 mr-4 text-sm font-medium transition-colors"
        :class="activeTab === 'following' ? 'text-blue-600 bg-blue-50 rounded-full' : 'text-gray-600 hover:text-gray-900'"
      >
        关注
        <span class="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{{ followingCount }}</span>
      </button>
      <button
        @click="activeTab = 'followers'"
        class="relative px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === 'followers' ? 'text-blue-600 bg-blue-50 rounded-full' : 'text-gray-600 hover:text-gray-900'"
      >
        粉丝
        <span class="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{{ followersCount }}</span>
      </button>
    </div>

    <!-- 关注列表 -->
    <div v-if="activeTab === 'following'" class="px-6">
      <div v-if="followingLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
      </div>

      <div v-else-if="following.length > 0" class="divide-y divide-gray-50">
        <div v-for="user in following" :key="user.id" class="py-4 transition-colors hover:bg-gray-50">
          <div class="flex items-center">
            <img :src="getUserAvatar(user.profile_picture)" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="头像">
            <div class="ml-4 flex-1">
              <router-link :to="`/user/${user.id}`" class="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {{ user.username }}
              </router-link>
              <p class="mt-0.5 text-sm text-gray-500 line-clamp-1">{{ user.bio || '暂无简介' }}</p>
            </div>
            <button
              @click="handleUnfollow(user.id)"
              class="ml-4 px-4 py-1.5 text-sm font-medium rounded-full transition-colors"
              :class="unfollowingId === user.id ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              :disabled="unfollowingId === user.id"
            >
              {{ unfollowingId === user.id ? '取消中...' : '取消关注' }}
            </button>
          </div>
        </div>

        <!-- 分页控制器 -->
        <div class="flex items-center justify-between py-4">
          <span class="text-sm text-gray-500">共 {{ followingPagination.total }} 个关注</span>
          <div class="flex space-x-2">
            <button
              @click="changePage('following', followingPagination.page - 1)"
              :disabled="followingPagination.page <= 1"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="followingPagination.page <= 1 ? 'bg-gray-50 text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              <i class="fas fa-chevron-left mr-1"></i> 上一页
            </button>
            <button
              @click="changePage('following', followingPagination.page + 1)"
              :disabled="followingPagination.page >= Math.ceil(followingPagination.total / followingPagination.limit)"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="followingPagination.page >= Math.ceil(followingPagination.total / followingPagination.limit) ? 'bg-gray-50 text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              下一页 <i class="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center py-12 text-gray-400">
        <i class="fas fa-user-friends text-4xl mb-4"></i>
        <p>暂无关注的用户</p>
      </div>
    </div>

    <!-- 粉丝列表 -->
    <div v-if="activeTab === 'followers'" class="px-6">
      <div v-if="followersLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"></div>
      </div>

      <div v-else-if="followers.length > 0" class="divide-y divide-gray-50">
        <div v-for="user in followers" :key="user.id" class="py-4 transition-colors hover:bg-gray-50">
          <div class="flex items-center">
            <img :src="getUserAvatar(user.profile_picture)" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="头像">
            <div class="ml-4 flex-1">
              <router-link :to="`/user/${user.id}`" class="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                {{ user.username }}
              </router-link>
              <p class="mt-0.5 text-sm text-gray-500 line-clamp-1">{{ user.bio || '暂无简介' }}</p>
            </div>
            <button
              v-if="!user.is_followed"
              @click="handleFollow(user.id)"
              class="ml-4 px-4 py-1.5 text-sm font-medium text-white rounded-full transition-colors"
              :class="followingId === user.id ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'"
              :disabled="followingId === user.id"
            >
              {{ followingId === user.id ? '关注中...' : '关注' }}
            </button>
            <button
              v-else
              @click="handleUnfollow(user.id)"
              class="ml-4 px-4 py-1.5 text-sm font-medium rounded-full transition-colors"
              :class="unfollowingId === user.id ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
              :disabled="unfollowingId === user.id"
            >
              {{ unfollowingId === user.id ? '取消中...' : '已关注' }}
            </button>
          </div>
        </div>

        <!-- 分页控制器 -->
        <div class="flex items-center justify-between py-4">
          <span class="text-sm text-gray-500">共 {{ followersPagination.total }} 个粉丝</span>
          <div class="flex space-x-2">
            <button
              @click="changePage('followers', followersPagination.page - 1)"
              :disabled="followersPagination.page <= 1"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="followersPagination.page <= 1 ? 'bg-gray-50 text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              <i class="fas fa-chevron-left mr-1"></i> 上一页
            </button>
            <button
              @click="changePage('followers', followersPagination.page + 1)"
              :disabled="followersPagination.page >= Math.ceil(followersPagination.total / followersPagination.limit)"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="followersPagination.page >= Math.ceil(followersPagination.total / followersPagination.limit) ? 'bg-gray-50 text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            >
              下一页 <i class="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center py-12 text-gray-400">
        <i class="fas fa-users text-4xl mb-4"></i>
        <p>暂无粉丝</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/auth'
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'UserFollowCard',
  props: {
    userId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const userStore = useUserStore()
    const authStore = useAuthStore()

    const activeTab = ref('following')
    const followingId = ref(null)
    const unfollowingId = ref(null)

    // 计算属性
    const following = computed(() => userStore.following || [])
    const followers = computed(() => userStore.followers || [])
    const followingCount = computed(() => userStore.pagination.following.total || 0)
    const followersCount = computed(() => userStore.pagination.followers.total || 0)
    const followingLoading = computed(() => userStore.followingLoading)
    const followersLoading = computed(() => userStore.followersLoading)
    const followingPagination = computed(() => userStore.pagination.following)
    const followersPagination = computed(() => userStore.pagination.followers)

    // 获取关注列表
    const fetchFollowing = async (page = 1, limit = 10) => {
      try {
        await userStore.fetchFollowingList(props.userId, { page, limit })
      } catch (error) {
        console.error('获取关注列表失败:', error)
      }
    }

    // 获取粉丝列表
    const fetchFollowers = async (page = 1, limit = 10) => {
      try {
        await userStore.fetchFollowersList(props.userId, { page, limit })
      } catch (error) {
        console.error('获取粉丝列表失败:', error)
      }
    }

    // 切换页码
    const changePage = (type, page) => {
      if (type === 'following') {
        if (page < 1 || page > Math.ceil(followingPagination.value.total / followingPagination.value.limit)) {
          return
        }
        fetchFollowing(page, followingPagination.value.limit)
      } else {
        if (page < 1 || page > Math.ceil(followersPagination.value.total / followersPagination.value.limit)) {
          return
        }
        fetchFollowers(page, followersPagination.value.limit)
      }
    }

    // 取消关注
    const handleUnfollow = async (targetUserId) => {
      try {
        unfollowingId.value = targetUserId
        await userStore.unfollowUser(targetUserId)
        // 刷新列表
        if (activeTab.value === 'following') {
          await fetchFollowing(followingPagination.value.page, followingPagination.value.limit)
        } else {
          await fetchFollowers(followersPagination.value.page, followersPagination.value.limit)
        }
      } catch (error) {
        console.error('取消关注失败:', error)
      } finally {
        unfollowingId.value = null
      }
    }

    // 关注用户
    const handleFollow = async (targetUserId) => {
      try {
        followingId.value = targetUserId
        await userStore.followUser(targetUserId)
        // 刷新列表
        await fetchFollowers(followersPagination.value.page, followersPagination.value.limit)
      } catch (error) {
        console.error('关注失败:', error)
      } finally {
        followingId.value = null
      }
    }

    // 获取用户头像
    const getUserAvatar = (profilePicture) => {
      if (!profilePicture) return '/default-avatar.png'
      if (profilePicture.startsWith('http')) {
        return profilePicture
      }
      return `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${profilePicture}`
    }

    // 监听标签切换，加载相应数据
    watch(activeTab, (newTab) => {
      if (newTab === 'following' && !following.value.length) {
        fetchFollowing()
      } else if (newTab === 'followers' && !followers.value.length) {
        fetchFollowers()
      }
    })

    // 监听用户ID变化，重新加载数据
    watch(() => props.userId, (newId) => {
      if (newId) {
        fetchFollowing()
        fetchFollowers()
      }
    })

    onMounted(() => {
      if (props.userId) {
        fetchFollowing()
      }
    })

    return {
      activeTab,
      following,
      followers,
      followingCount,
      followersCount,
      followingLoading,
      followersLoading,
      followingPagination,
      followersPagination,
      followingId,
      unfollowingId,
      changePage,
      handleUnfollow,
      handleFollow,
      getUserAvatar
    }
  }
}
</script>
