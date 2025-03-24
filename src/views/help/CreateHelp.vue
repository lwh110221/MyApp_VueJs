<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 面包屑导航 -->
    <div class="mb-6 text-sm">
      <router-link to="/help" class="text-green-600 hover:text-green-700">专家求助</router-link>
      <span class="mx-2 text-gray-400">/</span>
      <span class="text-gray-500">发布求助</span>
    </div>

    <!-- 表单容器 -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 bg-gray-50 border-b">
        <h1 class="text-xl font-semibold">发布求助问题</h1>
      </div>

      <div class="p-6">
        <!-- 分类选择 -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <div v-if="helpStore.loading.categories" class="py-2 flex items-center">
            <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500 mr-2"></div>
            <span class="text-sm text-gray-500">加载分类中...</span>
          </div>
          <div v-else-if="!helpStore.hasCategories" class="text-sm text-red-500">
            暂无可用分类，请联系管理员
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              v-for="category in helpStore.categories"
              :key="category.id"
              type="button"
              class="px-4 py-2 rounded-md text-center text-sm transition"
              :class="formData.category_id === category.id
                ? 'bg-green-100 text-green-700 border border-green-500'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-transparent'"
              @click="formData.category_id = category.id"
            >
              {{ category.name }}
            </button>
          </div>
          <div v-if="formErrors.category_id" class="mt-1 text-sm text-red-500">
            {{ formErrors.category_id }}
          </div>
        </div>

        <!-- 标题 -->
        <div class="mb-6">
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">标题</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="请输入求助标题（5-100字）"
            maxlength="100"
          />
          <div class="mt-1 flex justify-between">
            <div v-if="formErrors.title" class="text-sm text-red-500">
              {{ formErrors.title }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formData.title.length }}/100
            </div>
          </div>
        </div>

        <!-- 内容 -->
        <div class="mb-6">
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">内容</label>
          <textarea
            id="content"
            v-model="formData.content"
            rows="8"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="请详细描述您的问题，以便专家更好地帮助您（至少10字）"
          ></textarea>
          <div class="mt-1 flex justify-between">
            <div v-if="formErrors.content" class="text-sm text-red-500">
              {{ formErrors.content }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formData.content.length }}字
            </div>
          </div>
        </div>

        <!-- 图片上传 -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700">图片（可选，最多5张）</label>
            <span class="text-xs text-gray-500">{{ formData.images.length }}/5</span>
          </div>

          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <!-- 上传按钮 -->
            <div v-if="formData.images.length < 5" class="mb-4">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleFileChange"
              />
              <button
                type="button"
                @click="$refs.fileInput.click()"
                class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center mx-auto"
                :disabled="uploading"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{{ uploading ? '上传中...' : '选择图片' }}</span>
              </button>
            </div>

            <!-- 图片预览 -->
            <div v-if="formData.images.length > 0" class="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div
                v-for="(image, index) in formData.images"
                :key="index"
                class="relative rounded overflow-hidden h-24"
              >
                <img :src="getImageUrl(typeof image === 'string' ? image : image.url)" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    type="button"
                    @click="removeImage(index)"
                    class="text-white bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="formData.images.length === 0" class="text-center py-6 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm">点击上方按钮上传图片</p>
            </div>
          </div>

          <div v-if="formErrors.images" class="mt-1 text-sm text-red-500">
            {{ formErrors.images }}
          </div>
        </div>

        <!-- 提示信息 -->
        <div class="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg">
          <h3 class="text-base font-medium mb-2">发布须知：</h3>
          <ul class="list-disc pl-5 space-y-1 text-sm">
            <li>求助问题将由专业领域的专家回答。</li>
            <li>请尽量详细描述您的问题，包括可能的背景信息，以便专家更好地帮助您。</li>
            <li>添加图片可以帮助专家更好地理解您的问题。</li>
            <li>发布后，您可以根据专家回答的质量选择是否采纳。</li>
            <li>已采纳回答的求助将被标记为"已解决"。</li>
          </ul>
        </div>

        <!-- 提交按钮 -->
        <div class="flex justify-between">
          <router-link
            to="/help"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </router-link>
          <button
            type="button"
            @click="submitForm"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            :disabled="helpStore.loading.createPost"
          >
            {{ helpStore.loading.createPost ? '发布中...' : '发布求助' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useHelpStore } from '@/stores/help';
import { useRouter } from 'vue-router';
import { messageService } from '@/api';

export default {
  name: 'CreateHelp',
  setup() {
    const helpStore = useHelpStore();
    const router = useRouter();
    const fileInput = ref(null);

    // 表单数据
    const formData = reactive({
      title: '',
      content: '',
      category_id: null,
      images: []
    });

    // 表单错误
    const formErrors = reactive({
      title: '',
      content: '',
      category_id: '',
      images: ''
    });

    // 上传状态
    const uploading = ref(false);

    // 初始化
    onMounted(async () => {
      // 获取分类列表
      if (!helpStore.hasCategories) {
        await helpStore.fetchCategories();
      }
    });

    // 验证表单
    const validateForm = () => {
      let valid = true;

      // 重置错误信息
      Object.keys(formErrors).forEach(key => {
        formErrors[key] = '';
      });

      // 验证标题
      if (!formData.title.trim()) {
        formErrors.title = '请输入标题';
        valid = false;
      } else if (formData.title.length < 5) {
        formErrors.title = '标题不能少于5个字符';
        valid = false;
      } else if (formData.title.length > 100) {
        formErrors.title = '标题不能超过100个字符';
        valid = false;
      }

      // 验证内容
      if (!formData.content.trim()) {
        formErrors.content = '请输入内容';
        valid = false;
      } else if (formData.content.length < 10) {
        formErrors.content = '内容不能少于10个字符';
        valid = false;
      }

      // 验证分类
      if (!formData.category_id) {
        formErrors.category_id = '请选择分类';
        valid = false;
      }

      // 验证图片
      if (formData.images.length > 5) {
        formErrors.images = '最多只能上传5张图片';
        valid = false;
      }

      return valid;
    };

    // 提交表单
    const submitForm = async () => {
      if (helpStore.loading.createPost) return;

      // 验证表单
      if (!validateForm()) {
        messageService.error('请填写正确的信息');
        return;
      }

      try {
        const result = await helpStore.createPost(formData);

        // 发布成功，跳转到帖子详情页
        if (result && result.id) {
          messageService.success('发布成功');
          router.push(`/help/post/${result.id}`);
        }
      } catch (error) {
        console.error('发布求助失败:', error);
      }
    };

    // 处理文件上传
    const handleFileChange = async (e) => {
      if (uploading.value) return;

      const files = e.target.files;
      if (!files || files.length === 0) return;

      // 检查是否超过5张图片
      if (formData.images.length + files.length > 5) {
        messageService.warning('最多只能上传5张图片');
        e.target.value = '';
        return;
      }

      uploading.value = true;

      try {
        const formDataObj = new FormData();
        for (let i = 0; i < files.length; i++) {
          formDataObj.append('images', files[i]);
        }

        const response = await helpStore.uploadImages(formDataObj);

        // 添加上传成功的图片
        if (response && response.imageUrls) {
          response.imageUrls.forEach(url => {
            formData.images.push(url);
          });
        }
      } catch (error) {
        console.error('上传图片失败:', error);
      } finally {
        uploading.value = false;
        e.target.value = '';
      }
    };

    // 获取图片完整URL
    const getImageUrl = (path) => {
      if (!path) return '';
      if (typeof path === 'object' && path.url) {
        path = path.url;
      }
      if (typeof path === 'string' && path.startsWith('http')) return path;
      const baseUrl = import.meta.env.VITE_BASE_API_URL?.replace('/api', '') || process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';
      return `${baseUrl}${path}`;
    };

    // 移除图片
    const removeImage = (index) => {
      formData.images.splice(index, 1);
    };

    return {
      helpStore,
      formData,
      formErrors,
      fileInput,
      uploading,
      submitForm,
      handleFileChange,
      removeImage,
      getImageUrl
    };
  }
};
</script>
