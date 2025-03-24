<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <div class="flex justify-between items-center mb-4">
      <div class="flex space-x-4">
        <button
          @click="activeTab = 'following'"
          class="font-medium text-lg"
          :class="activeTab === 'following' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'"
        >
          关注 ({{ followingCount }})
        </button>
        <button
          @click="activeTab = 'followers'"
          class="font-medium text-lg"
          :class="activeTab === 'followers' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'"
        >
          粉丝 ({{ followersCount }})
        </button>
      </div>
    </div>

    <!-- 关注列表 -->
    <div v-if="activeTab === 'following'" class="space-y-4">
      <div v-if="followingLoading" class="flex justify-center py-6">
        <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="following.length > 0" class="space-y-3">
        <div v-for="user in following" :key="user.id" class="border-b border-gray-100 pb-3 last:border-b-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <img :src="getUserAvatar(user.profile_picture)" class="w-10 h-10 rounded-full object-cover" alt="头像">
              <div>
                <router-link :to="`/user/${user.id}`" class="font-medium text-gray-800 hover:text-blue-600">
                  {{ user.username }}
                </router-link>
                <p class="text-xs text-gray-500">{{ user.bio || '暂无简介' }}</p>
              </div>
            </div>

            <button
              @click="handleUnfollow(user.id)"
              class="text-sm px-3 py-1 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50"
              :disabled="unfollowingId === user.id"
            >
              {{ unfollowingId === user.id ? '处理中...' : '取消关注' }}
            </button>
          </div>
        </div>

        <!-- 分页器 -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">
            共 {{ followingPagination.total || 0 }} 个关注
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage('following', followingPagination.page - 1)"
              :disabled="followingPagination.page <= 1 || followingLoading"
              class="px-3 py-1 rounded border"
              :class="followingPagination.page <= 1 ? 'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              上一页
            </button>
            <button
              @click="changePage('following', followingPagination.page + 1)"
              :disabled="followingPagination.page >= Math.ceil(followingPagination.total / followingPagination.limit) || followingLoading"
              class="px-3 py-1 rounded border"
              :class="followingPagination.page >= Math.ceil(followingPagination.total / followingPagination.limit) ? 'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-6 text-gray-500">
        暂无关注的用户
      </div>
    </div>

    <!-- 粉丝列表 -->
    <div v-if="activeTab === 'followers'" class="space-y-4">
      <div v-if="followersLoading" class="flex justify-center py-6">
        <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="followers.length > 0" class="space-y-3">
        <div v-for="user in followers" :key="user.id" class="border-b border-gray-100 pb-3 last:border-b-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <img :src="getUserAvatar(user.profile_picture)" class="w-10 h-10 rounded-full object-cover" alt="头像">
              <div>
                <router-link :to="`/user/${user.id}`" class="font-medium text-gray-800 hover:text-blue-600">
                  {{ user.username }}
                </router-link>
                <p class="text-xs text-gray-500">{{ user.bio || '暂无简介' }}</p>
              </div>
            </div>

            <button
              v-if="!user.is_followed"
              @click="handleFollow(user.id)"
              class="text-sm px-3 py-1 bg-blue-500 rounded-full text-white hover:bg-blue-600"
              :disabled="followingId === user.id"
            >
              {{ followingId === user.id ? '处理中...' : '关注' }}
            </button>
            <button
              v-else
              @click="handleUnfollow(user.id)"
              class="text-sm px-3 py-1 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50"
              :disabled="unfollowingId === user.id"
            >
              {{ unfollowingId === user.id ? '处理中...' : '已关注' }}
            </button>
          </div>
        </div>

        <!-- 分页器 -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">
            共 {{ followersPagination.total || 0 }} 个粉丝
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage('followers', followersPagination.page - 1)"
              :disabled="followersPagination.page <= 1 || followersLoading"
              class="px-3 py-1 rounded border"
              :class="followersPagination.page <= 1 ? 'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              上一页
            </button>
            <button
              @click="changePage('followers', followersPagination.page + 1)"
              :disabled="followersPagination.page >= Math.ceil(followersPagination.total / followersPagination.limit) || followersLoading"
              class="px-3 py-1 rounded border"
              :class="followersPagination.page >= Math.ceil(followersPagination.total / followersPagination.limit) ? 'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-6 text-gray-500">
        暂无粉丝
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
