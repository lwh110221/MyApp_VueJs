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
      <div class="px-4 sm:px-6 py-4 bg-green-50 border-b border-green-100">
        <h2 class="text-xl font-semibold text-gray-800">发布专家求助</h2>
        <p class="mt-1 text-sm text-gray-600">提交您的农业问题，专家会尽快为您解答</p>
      </div>

      <div class="p-4 sm:p-6">
        <!-- 表单字段 -->
        <div class="space-y-6">
          <!-- 标题 -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">问题标题 <span class="text-red-500">*</span></label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="请输入简短明了的问题标题"
              maxlength="50"
            />
            <div class="flex justify-between mt-1">
              <div v-if="formErrors.title" class="text-sm text-red-500">{{ formErrors.title }}</div>
              <div class="text-sm text-gray-500 ml-auto">{{ formData.title.length }}/50</div>
            </div>
          </div>

          <!-- 分类 -->
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">问题分类 <span class="text-red-500">*</span></label>
            <div class="relative">
              <select
                id="category"
                v-model="formData.category_id"
                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
              >
                <option value="" disabled>请选择问题分类</option>
                <option v-for="category in helpStore.categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div v-if="formErrors.category_id" class="mt-1 text-sm text-red-500">{{ formErrors.category_id }}</div>
          </div>

          <!-- 内容 -->
          <div>
            <label for="content" class="block text-sm font-medium text-gray-700 mb-1">问题描述 <span class="text-red-500">*</span></label>
            <textarea
              id="content"
              v-model="formData.content"
              rows="6"
              class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="请详细描述您的问题，包括遇到的情况、尝试过的方法以及想要得到的帮助"
              maxlength="2000"
            ></textarea>
            <div class="flex justify-between mt-1">
              <div v-if="formErrors.content" class="text-sm text-red-500">{{ formErrors.content }}</div>
              <div class="text-sm text-gray-500 ml-auto">{{ formData.content.length }}/2000</div>
            </div>
          </div>

          <!-- 图片上传 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">问题相关图片（选填）</label>
            <div class="flex flex-wrap items-center gap-2">
              <!-- 上传图标按钮 -->
              <button
                @click="$refs.fileInput.click()"
                type="button"
                :disabled="formData.images.length >= 5 || uploading"
                class="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                :class="{ 'opacity-50 cursor-not-allowed': formData.images.length >= 5 || uploading }"
                title="上传图片"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              <span v-if="uploading" class="text-sm text-gray-500">上传中...</span>
              <span v-else-if="formData.images.length >= 5" class="text-sm text-amber-600">已达到最大上传数量</span>
              <span v-else-if="formData.images.length > 0" class="text-sm text-gray-500">已上传 {{ formData.images.length }}/5 张图片</span>
              <span v-else class="text-sm text-gray-500">可上传最多5张图片</span>
            </div>

            <!-- 图片预览 -->
            <div v-if="formData.images.length > 0" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
              <div v-for="(image, index) in previewImages" :key="index" class="relative">
                <img :src="image" class="w-full h-16 object-cover rounded border" />
                <button
                  @click="removeImage(index)"
                  class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs -mt-1 -mr-1 shadow"
                >
                  &times;
                </button>
              </div>
            </div>

            <input
              type="file"
              ref="fileInput"
              multiple
              accept="image/jpeg,image/png"
              class="hidden"
              @change="handleFileChange"
            />
            <div v-if="formErrors.images" class="mt-1 text-sm text-red-500">{{ formErrors.images }}</div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end pt-4">
            <button
              type="button"
              @click="router.back()"
              class="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              取消
            </button>
            <button
              type="button"
              @click="submitForm"
              class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
              :disabled="helpStore.loading.createPost"
            >
              <span v-if="helpStore.loading.createPost">提交中...</span>
              <span v-else>发布求助</span>
            </button>
          </div>
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
      } else if (formData.title.length > 50) {
        formErrors.title = '标题不能超过50个字符';
        valid = false;
      }

      // 验证内容
      if (!formData.content.trim()) {
        formErrors.content = '请输入内容';
        valid = false;
      } else if (formData.content.length < 10) {
        formErrors.content = '内容不能少于10个字符';
        valid = false;
      } else if (formData.content.length > 2000) {
        formErrors.content = '内容不能超过2000个字符';
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
      getImageUrl,
      router,
      previewImages: computed(() => {
        return formData.images.map(image => {
          if (typeof image === 'string') {
            return getImageUrl(image);
          }
          return URL.createObjectURL(image);
        });
      })
    };
  }
};
</script>
