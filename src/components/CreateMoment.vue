<template>
  <div class="bg-white rounded-lg shadow p-4 mb-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">发布动态</h3>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <textarea
      v-model="content"
      class="w-full p-2 border rounded-lg mb-4 min-h-[100px]"
      placeholder="分享你的想法..."
      :disabled="loading"
    ></textarea>

    <!-- 图片预览区域 -->
    <div v-if="previewImages.length > 0" class="grid grid-cols-3 gap-2 mb-4">
      <div
        v-for="(image, index) in previewImages"
        :key="index"
        class="relative pt-[100%]"
      >
        <img
          :src="image"
          class="absolute inset-0 w-full h-full object-cover rounded"
          alt="预览图片"
        >
        <button
          @click="removeImage(index)"
          class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          :disabled="loading"
        >
          ×
        </button>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <div class="flex space-x-4">
        <button
          @click="$refs.fileInput.click()"
          class="text-blue-500 hover:text-blue-700 flex items-center"
          :disabled="previewImages.length >= 9 || loading"
        >
          <i class="fas fa-image mr-2"></i>
          添加图片
        </button>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          class="hidden"
          @change="handleImageSelect"
        >
      </div>

      <button
        @click="publishMoment"
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="(!content && previewImages.length === 0) || loading"
      >
        {{ loading ? '发布中...' : '发布' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { momentService, messageService } from '../api'

export default {
  name: 'CreateMoment',
  emits: ['moment-created', 'close'],

  setup(props, { emit }) {
    const content = ref('')
    const previewImages = ref([])
    const selectedFiles = ref([])
    const fileInput = ref(null)
    const loading = ref(false)

    const handleImageSelect = (event) => {
      const files = Array.from(event.target.files)
      const remainingSlots = 9 - previewImages.value.length
      const newFiles = files.slice(0, remainingSlots)

      // 验证文件类型和大小
      for (const file of newFiles) {
        if (!file.type.startsWith('image/')) {
          messageService.error('请只上传图片文件')
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          messageService.error('单个图片大小不能超过 5MB')
          return
        }
      }

      newFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImages.value.push(e.target.result)
        }
        reader.readAsDataURL(file)
      })

      selectedFiles.value.push(...newFiles)
      event.target.value = '' // 重置input
    }

    const removeImage = (index) => {
      if (loading.value) return
      previewImages.value.splice(index, 1)
      selectedFiles.value.splice(index, 1)
    }

    const publishMoment = async () => {
      if (loading.value) return
      if (!content.value && selectedFiles.value.length === 0) {
        messageService.warning('请输入内容或上传图片')
        return
      }

      try {
        loading.value = true
        console.log('Publishing moment:', {
          content: content.value,
          images: selectedFiles.value
        })

        const response = await momentService.createMoment({
          content: content.value,
          images: selectedFiles.value
        })

        console.log('Publish response:', response)

        // 重置表单
        content.value = ''
        previewImages.value = []
        selectedFiles.value = []

        // 通知父组件刷新动态列表，并传递新创建的动态数据
        if (response.moment) {
          emit('moment-created', response.moment)
        }
        messageService.success(response.message || '动态发布成功')
      } catch (error) {
        console.error('发布动态失败:', error)
        messageService.error(error.response?.data?.message || error.message || '发布动态失败')
      } finally {
        loading.value = false
      }
    }

    return {
      content,
      previewImages,
      fileInput,
      loading,
      handleImageSelect,
      removeImage,
      publishMoment
    }
  }
}
</script>
