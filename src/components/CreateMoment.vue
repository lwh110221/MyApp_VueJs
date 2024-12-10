<template>
  <div class="bg-white rounded-lg shadow p-4 mb-4">
    <textarea
      v-model="content"
      class="w-full p-2 border rounded-lg mb-4 min-h-[100px]"
      placeholder="分享你的想法..."
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
          class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
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
          :disabled="previewImages.length >= 9"
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
        class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        :disabled="!content && previewImages.length === 0"
      >
        发布
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { momentApi } from '../api/moment'

export default {
  name: 'CreateMoment',
  emits: ['moment-created'],

  setup(props, { emit }) {
    const content = ref('')
    const previewImages = ref([])
    const selectedFiles = ref([])
    const fileInput = ref(null)

    const handleImageSelect = (event) => {
      const files = Array.from(event.target.files)
      const remainingSlots = 9 - previewImages.value.length
      const newFiles = files.slice(0, remainingSlots)

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
      previewImages.value.splice(index, 1)
      selectedFiles.value.splice(index, 1)
    }

    const publishMoment = async () => {
      try {
        const response = await momentApi.createMoment({
          content: content.value,
          images: selectedFiles.value
        })

        if (response.data.success) {
          // 重置表单
          content.value = ''
          previewImages.value = []
          selectedFiles.value = []
          
          // 通知父组件刷新动态列表，并传递新创建的动态数据
          emit('moment-created', response.data.moment)
        }
      } catch (error) {
        console.error('发布动态失败:', error)
        // 移除错误弹窗，只在控制台记录错误
      }
    }

    return {
      content,
      previewImages,
      fileInput,
      handleImageSelect,
      removeImage,
      publishMoment
    }
  }
}
</script> 