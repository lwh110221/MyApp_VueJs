<!-- 发布/编辑帖子页面 -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ isEdit ? '编辑帖子' : '发布帖子' }}</h1>
      <router-link
        to="/community"
        class="text-gray-600 hover:text-blue-500 transition-colors flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        返回社区
      </router-link>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- 表单内容 -->
    <div v-else class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="submitPost">
        <!-- 标题 -->
        <div class="mb-6">
          <label for="title" class="block text-gray-700 font-medium mb-2">标题</label>
          <input
            id="title"
            v-model="title"
            type="text"
            placeholder="请输入帖子标题（1-200字符）"
            maxlength="200"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
          <div class="flex justify-end mt-1 text-xs text-gray-500">
            {{ title.length }}/200
          </div>
        </div>

        <!-- 正文内容 -->
        <div class="mb-6">
          <label for="content" class="block text-gray-700 font-medium mb-2">正文内容</label>
          <textarea
            id="content"
            v-model="content"
            placeholder="请输入帖子内容（1-5000字符）"
            rows="10"
            maxlength="5000"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            required
          ></textarea>
          <div class="flex justify-end mt-1 text-xs text-gray-500">
            {{ content.length }}/5000
          </div>
        </div>

        <!-- 标签选择 -->
        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">标签（最多选择5个）</label>

          <div v-if="hotTags.length > 0" class="flex flex-wrap gap-2 mb-3">
            <button
              v-for="tag in hotTags"
              :key="tag.name"
              type="button"
              class="px-3 py-1 text-sm rounded-full transition-colors"
              :class="selectedTags.includes(tag.name)
                ? 'bg-blue-100 text-blue-600 border border-blue-300'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'"
              @click="toggleTag(tag.name)"
              :disabled="selectedTags.length >= 5 && !selectedTags.includes(tag.name)"
            >
              {{ tag.name }}
            </button>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="newTag"
              type="text"
              placeholder="添加自定义标签"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :maxlength="20"
              :disabled="selectedTags.length >= 5"
            >
            <button
              type="button"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              @click="addCustomTag"
              :disabled="!newTag.trim() || selectedTags.length >= 5"
            >
              添加
            </button>
          </div>

          <div v-if="selectedTags.length > 0" class="mt-3">
            <div class="text-sm text-gray-600 mb-2">已选择的标签：</div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="tag in selectedTags"
                :key="tag"
                class="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {{ tag }}
                <button
                  type="button"
                  class="text-blue-500 hover:text-blue-700"
                  @click="removeTag(tag)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 图片上传 -->
        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">图片上传（最多9张）</label>
          <div class="flex items-center gap-2">
            <label
              class="px-4 py-2 bg-blue-50 text-blue-500 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-1"
              :class="{ 'opacity-50 cursor-not-allowed': images.length >= 9 }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
              上传图片
              <input
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleImageUpload"
                :disabled="images.length >= 9"
              >
            </label>
            <span class="text-sm text-gray-500">{{ images.length }}/9</span>
          </div>

          <!-- 图片预览区域 -->
          <div v-if="images.length > 0" class="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            <div
              v-for="(image, index) in images"
              :key="index"
              class="relative rounded overflow-hidden aspect-square"
            >
              <img
                :src="getImagePreview(image)"
                class="w-full h-full object-cover"
              >
              <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                <button
                  type="button"
                  class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  @click="removeImage(index)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="flex justify-center">
          <button
            type="submit"
            class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            :disabled="isSubmitting || !title.trim() || !content.trim()"
          >
            {{ isSubmitting ? (isEdit ? '保存中...' : '发布中...') : (isEdit ? '保存修改' : '发布帖子') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';
import communityService from '@/api/services/community.service';

export default {
  name: 'CreatePost',
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    postId: {
      type: Number,
      default: null
    }
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();
    const authStore = useAuthStore();

    // 表单状态
    const title = ref('');
    const content = ref('');
    const selectedTags = ref([]);
    const images = ref([]);
    const newTag = ref('');
    const hotTags = ref([]);
    const isLoading = ref(false);
    const isSubmitting = ref(false);

    // 当前编辑的帖子ID（支持从路由获取）
    const currentPostId = computed(() => {
      return props.postId || (props.isEdit ? parseInt(route.params.id) : null);
    });

    // 检查用户是否已登录
    if (!authStore.isLoggedIn) {
      toast.error('请先登录后再操作');
      router.push('/login');
    }

    // 加载热门标签
    const loadHotTags = async () => {
      try {
        const response = await communityService.getHotTags(20);
        if (response && response.data) {
          hotTags.value = response.data.tags;
        }
      } catch (error) {
        console.error('加载热门标签失败', error);
      }
    };

    // 加载帖子详情（编辑模式）
    const loadPostDetail = async () => {
      if (!props.isEdit || !currentPostId.value) return;

      isLoading.value = true;
      try {
        const response = await communityService.getPostDetail(currentPostId.value);
        if (response && response.data) {
          const post = response.data;

          // 检查是否是帖子作者
          if (post.user_id !== authStore.user?.id) {
            toast.error('只能编辑自己的帖子');
            router.push('/community');
            return;
          }

          // 设置表单数据
          title.value = post.title;
          content.value = post.content;
          selectedTags.value = post.tags || [];
          images.value = post.images ? post.images.map(url => ({ url, isUploaded: true })) : [];
        }
      } catch (error) {
        console.error('加载帖子详情失败', error);
        toast.error('加载帖子详情失败');
        router.push('/community');
      } finally {
        isLoading.value = false;
      }
    };

    // 切换标签选择状态
    const toggleTag = (tag) => {
      if (selectedTags.value.includes(tag)) {
        removeTag(tag);
      } else if (selectedTags.value.length < 5) {
        selectedTags.value.push(tag);
      } else {
        toast.warning('最多选择5个标签');
      }
    };

    // 添加自定义标签
    const addCustomTag = () => {
      const tag = newTag.value.trim();
      if (!tag) return;

      if (selectedTags.value.length >= 5) {
        toast.warning('最多选择5个标签');
        return;
      }

      if (selectedTags.value.includes(tag)) {
        toast.warning(`标签"${tag}"已添加`);
        return;
      }

      if (tag.length > 20) {
        toast.warning('标签长度不能超过20个字符');
        return;
      }

      selectedTags.value.push(tag);
      newTag.value = '';
    };

    // 移除标签
    const removeTag = (tag) => {
      const index = selectedTags.value.indexOf(tag);
      if (index !== -1) {
        selectedTags.value.splice(index, 1);
      }
    };

    // 处理图片上传
    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files);
      if (!files.length) return;

      // 限制上传数量
      if (images.value.length + files.length > 9) {
        toast.error('最多上传9张图片');
        return;
      }

      // 处理每个文件
      files.forEach(file => {
        // 检查文件类型
        if (!file.type.includes('image/')) {
          toast.error(`${file.name} 不是有效的图片格式`);
          return;
        }

        // 检查文件大小 (5MB限制)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} 超过5MB大小限制`);
          return;
        }

        // 创建预览URL
        const reader = new FileReader();
        reader.onload = (e) => {
          images.value.push({
            file,
            url: e.target.result,
            isUploaded: false
          });
        };
        reader.readAsDataURL(file);
      });

      // 清空input，确保可以再次选择同一文件
      event.target.value = '';
    };

    // 获取图片预览URL
    const getImagePreview = (image) => {
      return image.url;
    };

    // 移除图片
    const removeImage = (index) => {
      images.value.splice(index, 1);
    };

    // 提交帖子
    const submitPost = async () => {
      if (!title.value.trim() || !content.value.trim()) {
        toast.error('标题和内容不能为空');
        return;
      }

      isSubmitting.value = true;

      try {
        // 上传未上传的图片
        const newImages = images.value.filter(image => !image.isUploaded);
        let uploadedImageUrls = images.value
          .filter(image => image.isUploaded)
          .map(image => image.url);

        if (newImages.length > 0) {
          const formData = new FormData();
          newImages.forEach(image => {
            formData.append('images', image.file);
          });

          const uploadResponse = await communityService.uploadImages(formData);
          console.log("帖子图片上传响应:", uploadResponse);

          if (uploadResponse && uploadResponse.code === 200 && uploadResponse.data) {
            // 从响应中正确提取图片URL
            const uploadedUrlsList = Array.isArray(uploadResponse.data) ?
              uploadResponse.data.map(img => img.url) : [];
            console.log("提取的帖子图片URL:", uploadedUrlsList);

            uploadedImageUrls = [
              ...uploadedImageUrls,
              ...uploadedUrlsList
            ];
          }
        }

        // 帖子数据
        const postData = {
          title: title.value,
          content: content.value,
          tags: selectedTags.value,
          images: uploadedImageUrls
        };

        console.log("准备提交的帖子数据:", postData);

        let response;

        // 创建或更新帖子
        if (props.isEdit && currentPostId.value) {
          response = await communityService.updatePost(currentPostId.value, postData);
          console.log("更新帖子响应:", response);
          toast.success('帖子更新成功');
        } else {
          response = await communityService.createPost(postData);
          console.log("创建帖子响应:", response);
          toast.success('帖子发布成功');
        }

        // 跳转到帖子详情或社区首页
        if (response && response.data && response.data.id) {
          router.push(`/community/post/${response.data.id}`);
        } else {
          router.push('/community');
        }
      } catch (error) {
        console.error(props.isEdit ? '更新帖子失败' : '发布帖子失败', error);
        toast.error(props.isEdit ? '更新帖子失败，请稍后重试' : '发布帖子失败，请稍后重试');
      } finally {
        isSubmitting.value = false;
      }
    };

    // 监听编辑状态变化
    watch(() => props.isEdit, (newVal) => {
      if (newVal && currentPostId.value) {
        loadPostDetail();
      }
    });

    onMounted(() => {
      loadHotTags();
      if (props.isEdit && currentPostId.value) {
        loadPostDetail();
      }
    });

    return {
      title,
      content,
      selectedTags,
      images,
      newTag,
      hotTags,
      isLoading,
      isSubmitting,
      toggleTag,
      addCustomTag,
      removeTag,
      handleImageUpload,
      getImagePreview,
      removeImage,
      submitPost
    };
  }
};
</script>
