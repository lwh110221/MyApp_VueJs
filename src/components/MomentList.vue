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
          :disabled="loading"
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
            class="absolute inset-0 w-full h-full object-cover rounded cursor-pointer hover:opacity-90"
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
        class="text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div class="relative max-w-full max-h-full">
        <img
          :src="getImageUrl(previewImages[currentPreviewIndex])"
          class="max-w-full max-h-[90vh] object-contain"
          alt="预览图片"
        >
        <!-- 导航按钮 -->
        <button
          v-if="previewImages.length > 1 && currentPreviewIndex > 0"
          @click.stop="currentPreviewIndex--"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
        >
          ←
        </button>
        <button
          v-if="previewImages.length > 1 && currentPreviewIndex < previewImages.length - 1"
          @click.stop="currentPreviewIndex++"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { momentService, messageService } from '../api'

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
        const newMoments = await momentService.getMoments(props.userId, page)
        console.log('Loaded moments:', newMoments)  // 添加日志

        if (!Array.isArray(newMoments)) {
          throw new Error('获取动态数据格式错误')
        }

        if (page === 1) {
          moments.value = newMoments
        } else {
          moments.value = [...moments.value, ...newMoments]
        }

        hasMore.value = newMoments.length === 10 // 假设每页10条
        currentPage.value = page
      } catch (error) {
        console.error('获取动态失败:', error)
        messageService.error(error.message || '获取动态失败')
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
      if (loading.value) return

      try {
        loading.value = true
        console.log('Deleting moment:', momentId)
        const result = await momentService.deleteMoment(momentId)
        console.log('Delete result:', result)

        // 从列表中移除被删除的动态
        moments.value = moments.value.filter(m => m.id !== momentId)
        messageService.success(result?.message || '动态已删除')
      } catch (error) {
        console.error('删除动态失败:', error)
        const errorMessage = error.response?.data?.message || '删除动态失败'

        if (error.response?.status === 404) {
          messageService.error('动态不存在或已被删除')
          // 从列表中移除不存在的动态
          moments.value = moments.value.filter(m => m.id !== momentId)
        } else if (error.response?.status === 400) {
          messageService.error(`删除动态失败: ${errorMessage}`)
        } else {
          messageService.error(errorMessage)
        }
      } finally {
        loading.value = false
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
      const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '')
      return `${baseUrl}${path}`
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
      if (newMoment) {
        moments.value = Array.isArray(moments.value) ? [newMoment, ...moments.value] : [newMoment]
      }
    }

    onMounted(() => {
      if (props.userId) {
        loadMoments()
      }
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
