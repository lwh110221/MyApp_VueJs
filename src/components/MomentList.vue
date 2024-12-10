<template>
  <div class="space-y-4">
    <div v-for="moment in moments" :key="moment.id" class="bg-white rounded-lg shadow p-4">
      <!-- 用户信息 -->
      <div class="flex items-center space-x-3 mb-4">
        <img 
          :src="getImageUrl(moment.profile_picture)" 
          class="w-10 h-10 rounded-full object-cover"
          alt="用户头像"
        >
        <div>
          <div class="font-semibold">{{ moment.username }}</div>
          <div class="text-sm text-gray-500">{{ formatDate(moment.created_at) }}</div>
        </div>
        <!-- 删除按钮 -->
        <button 
          v-if="moment.user_id === currentUserId"
          @click="handleDelete(moment.id)"
          class="ml-auto text-red-500 hover:text-red-700"
        >
          删除
        </button>
      </div>

      <!-- 动态内容 -->
      <p class="text-gray-800 mb-4">{{ moment.content }}</p>

      <!-- 图片展示 -->
      <div v-if="moment.images && moment.images.length > 0" class="grid grid-cols-3 gap-2">
        <div 
          v-for="(image, index) in moment.images" 
          :key="index"
          class="relative pt-[100%]"
        >
          <img 
            :src="getImageUrl(image)"
            class="absolute inset-0 w-full h-full object-cover rounded"
            @click="openImagePreview(moment.images, index)"
            alt="动态图片"
          >
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="text-center py-4">
      <button 
        @click="loadMore"
        class="text-blue-500 hover:text-blue-700"
        :disabled="loading"
      >
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>

    <!-- 图片预览 -->
    <div 
      v-if="showPreview" 
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      @click="showPreview = false"
    >
      <img 
        :src="getImageUrl(previewImages[currentPreviewIndex])"
        class="max-w-full max-h-full object-contain"
        alt="预览图片"
      >
    </div>
  </div>
</template>

<script>
import { momentApi } from '../api/moment'
import { ref, onMounted } from 'vue'

export default {
  name: 'MomentList',
  props: {
    userId: {
      type: [Number, String],
      default: null
    },
    currentUserId: {
      type: [Number, String],
      required: true
    }
  },

  setup(props) {
    const moments = ref([])
    const currentPage = ref(1)
    const hasMore = ref(true)
    const loading = ref(false)
    const showPreview = ref(false)
    const previewImages = ref([])
    const currentPreviewIndex = ref(0)

    const loadMoments = async (page = 1) => {
      try {
        loading.value = true
        const response = await momentApi.getMoments(props.userId, page)
        const newMoments = response.data

        if (page === 1) {
          moments.value = newMoments
        } else {
          moments.value.push(...newMoments)
        }

        hasMore.value = newMoments.length === 10 // 假设每页10条
        currentPage.value = page
      } catch (error) {
        console.error('获取动态失败:', error)
      } finally {
        loading.value = false
      }
    }

    const loadMore = () => {
      if (!loading.value && hasMore.value) {
        loadMoments(currentPage.value + 1)
      }
    }

    const handleDelete = async (momentId) => {
      if (!confirm('确定要删除这条动态吗？')) return

      try {
        await momentApi.deleteMoment(momentId)
        moments.value = moments.value.filter(m => m.id !== momentId)
      } catch (error) {
        console.error('删除动态失败:', error)
      }
    }

    const openImagePreview = (images, index) => {
      previewImages.value = images
      currentPreviewIndex.value = index
      showPreview.value = true
    }

    const getImageUrl = (path) => {
      if (!path) return '/default-avatar.png'
      if (path.startsWith('http')) return path
      return `${import.meta.env.VITE_API_URL}${path}`
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const addNewMoment = (newMoment) => {
      if (newMoment && moments.value) {
        moments.value = [newMoment, ...moments.value]
      }
    }

    onMounted(() => {
      loadMoments()
    })

    return {
      moments,
      hasMore,
      loading,
      showPreview,
      previewImages,
      currentPreviewIndex,
      loadMore,
      handleDelete,
      openImagePreview,
      getImageUrl,
      formatDate,
      addNewMoment,
      loadMoments
    }
  }
}
</script> 