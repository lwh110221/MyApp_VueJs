<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 加载状态 -->
    <div v-if="helpStore.loading.postDetail" class="my-8 flex justify-center">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <!-- 主要内容 -->
    <template v-else-if="helpStore.currentPost">
      <!-- 面包屑导航 -->
      <div class="mb-4 text-sm">
        <router-link to="/help" class="text-green-600 hover:text-green-700">专家求助</router-link>
        <span class="mx-2 text-gray-400">/</span>
        <span class="text-gray-500">{{ helpStore.currentPost.title }}</span>
      </div>

      <!-- 帖子内容卡片 -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <!-- 帖子标题和状态 -->
        <div class="p-6 border-b">
          <div class="flex flex-wrap justify-between items-center gap-3">
            <h1 class="text-2xl font-semibold text-gray-800">{{ helpStore.currentPost.title }}</h1>
            <span
              class="px-2.5 py-1 rounded-full text-sm font-medium"
              :class="helpStore.getPostStatusClass(helpStore.currentPost.status)"
            >
              {{ helpStore.getPostStatusText(helpStore.currentPost.status) }}
            </span>
          </div>

          <div class="mt-3 flex flex-wrap items-center text-sm text-gray-500">
            <div class="mr-4">
              <span class="font-medium text-gray-700">{{ helpStore.currentPost.author_name }}</span>
            </div>
            <div class="mr-4">
              <span>{{ formatDate(helpStore.currentPost.created_at) }}</span>
            </div>
            <div>
              <span>{{ helpStore.currentPost.category_name }}</span>
            </div>
          </div>
        </div>

        <!-- 帖子内容 -->
        <div class="p-6">
          <div class="prose max-w-none">
            <p>{{ helpStore.currentPost.content }}</p>
          </div>

          <!-- 图片展示 -->
          <div v-if="helpStore.currentPost.images && helpStore.currentPost.images.length > 0" class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            <div
              v-for="(image, index) in helpStore.currentPost.images"
              :key="index"
              class="relative cursor-pointer overflow-hidden rounded"
              @click="openImageViewer(index)"
            >
              <img :src="getImageUrl(typeof image === 'string' ? image : image.url)" class="w-full h-40 object-cover transition hover:scale-105" />
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="isAuthor" class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-700">帖子操作</h2>
          <div class="flex space-x-2">
            <button
              v-if="helpStore.currentPost.status === 0"
              @click="updatePostStatus(2)"
              class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              :disabled="isUpdatingStatus"
            >
              关闭帖子
            </button>
            <button
              v-if="helpStore.currentPost.status === 2"
              @click="updatePostStatus(0)"
              class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
              :disabled="isUpdatingStatus"
            >
              重新打开帖子
            </button>
          </div>
        </div>
      </div>

      <!-- 回答列表 -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">
          <span v-if="helpStore.hasAnswers">{{ helpStore.answers.length }}个回答</span>
          <span v-else>回答</span>
        </h2>

        <!-- 加载状态 -->
        <div v-if="helpStore.loading.answers" class="py-8 flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>

        <!-- 暂无回答 -->
        <div v-else-if="!helpStore.hasAnswers" class="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p class="mt-4 text-gray-500">暂无专家回答</p>
        </div>

        <!-- 已采纳的回答 -->
        <div v-if="helpStore.acceptedAnswer" class="mb-4">
          <div class="bg-white rounded-lg shadow-md overflow-hidden border-2 border-green-500">
            <div class="bg-green-50 px-6 py-3 flex justify-between items-center">
              <div class="flex items-center">
                <span class="bg-green-500 text-white text-xs px-2 py-1 rounded-full mr-2">已采纳</span>
                <span class="font-medium">{{ helpStore.acceptedAnswer.author_name }}</span>
                <span class="mx-2 text-gray-400">·</span>
                <span class="text-sm text-gray-500">{{ formatDate(helpStore.acceptedAnswer.created_at) }}</span>
              </div>
              <div v-if="isAnswerAuthor(helpStore.acceptedAnswer)" class="flex items-center">
                <button
                  @click="deleteAnswer(helpStore.acceptedAnswer.id)"
                  class="text-red-500 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>
            </div>

            <div class="p-6">
              <div class="prose max-w-none">
                <p>{{ helpStore.acceptedAnswer.content }}</p>
              </div>

              <!-- 图片展示 -->
              <div v-if="helpStore.acceptedAnswer.images && helpStore.acceptedAnswer.images.length > 0" class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                <div
                  v-for="(image, index) in helpStore.acceptedAnswer.images"
                  :key="index"
                  class="relative cursor-pointer overflow-hidden rounded"
                  @click="openImageViewer(index, helpStore.acceptedAnswer.images)"
                >
                  <img :src="getImageUrl(typeof image === 'string' ? image : image.url)" class="w-full h-32 object-cover transition hover:scale-105" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 未采纳的回答列表 -->
        <div v-if="helpStore.unacceptedAnswers.length > 0" class="space-y-4">
          <div
            v-for="answer in helpStore.unacceptedAnswers"
            :key="answer.id"
            class="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div class="px-6 py-3 bg-gray-50 flex justify-between items-center">
              <div class="flex items-center">
                <span class="font-medium">{{ answer.author_name }}</span>
                <span class="mx-2 text-gray-400">·</span>
                <span class="text-sm text-gray-500">{{ formatDate(answer.created_at) }}</span>
              </div>
              <div class="flex items-center space-x-4">
                <button
                  v-if="isAuthor && helpStore.currentPost.status === 0"
                  @click="acceptAnswer(answer.id)"
                  class="text-green-500 hover:text-green-700 text-sm"
                  :disabled="helpStore.loading.acceptAnswer"
                >
                  采纳回答
                </button>
                <button
                  v-if="isAnswerAuthor(answer)"
                  @click="deleteAnswer(answer.id)"
                  class="text-red-500 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>
            </div>

            <div class="p-6">
              <div class="prose max-w-none">
                <p>{{ answer.content }}</p>
              </div>

              <!-- 图片展示 -->
              <div v-if="answer.images && answer.images.length > 0" class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                <div
                  v-for="(image, index) in answer.images"
                  :key="index"
                  class="relative cursor-pointer overflow-hidden rounded"
                  @click="openImageViewer(index, answer.images)"
                >
                  <img :src="getImageUrl(typeof image === 'string' ? image : image.url)" class="w-full h-32 object-cover transition hover:scale-105" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 回答表单 (只有专家可以回答) -->
      <div v-if="isExpert && helpStore.currentPost.status === 0" class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="px-6 py-3 bg-gray-50 border-b">
          <h3 class="text-lg font-medium">您的专业回答</h3>
        </div>

        <div class="p-6">
          <div class="mb-4">
            <textarea
              v-model="answerForm.content"
              rows="5"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="请输入您的专业回答..."
            ></textarea>
          </div>

          <!-- 图片上传 -->
          <div class="mb-4">
            <div class="flex items-center mb-2">
              <span class="mr-2">添加图片</span>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleFileChange"
              />
              <button
                @click="$refs.fileInput.click()"
                class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                :disabled="uploadingImage || answerForm.images.length >= 5"
              >
                <span v-if="uploadingImage">上传中...</span>
                <span v-else>选择图片</span>
              </button>
              <span class="ml-2 text-xs text-gray-500">最多5张</span>
            </div>

            <!-- 图片预览 -->
            <div v-if="answerForm.images.length > 0" class="flex flex-wrap gap-2">
              <div
                v-for="(image, index) in answerForm.images"
                :key="index"
                class="relative w-20 h-20"
              >
                <img :src="image" class="w-full h-full object-cover rounded" />
                <button
                  @click="removeImage(index)"
                  class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="submitAnswer"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              :disabled="!answerForm.content.trim() || helpStore.loading.createAnswer"
            >
              {{ helpStore.loading.createAnswer ? '提交中...' : '提交回答' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- 帖子不存在 -->
    <div v-else class="my-8 bg-white rounded-lg shadow p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mt-4 text-gray-500">求助内容不存在或已被删除</p>
      <router-link to="/help" class="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition">
        返回求助列表
      </router-link>
    </div>

    <!-- 图片查看器 -->
    <div
      v-if="imageViewer.visible"
      class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      @click="imageViewer.visible = false"
    >
      <button
        class="absolute top-4 right-4 text-white text-2xl"
        @click.stop="imageViewer.visible = false"
      >
        &times;
      </button>
      <button
        v-if="imageViewer.images.length > 1"
        class="absolute left-4 text-white text-4xl"
        @click.stop="prevImage"
      >
        &lt;
      </button>
      <img :src="getImageUrl(
        typeof imageViewer.images[imageViewer.currentIndex] === 'string'
          ? imageViewer.images[imageViewer.currentIndex]
          : imageViewer.images[imageViewer.currentIndex].url
      )" class="max-h-[90vh] max-w-[90vw] object-contain" />
      <button
        v-if="imageViewer.images.length > 1"
        class="absolute right-4 text-white text-4xl"
        @click.stop="nextImage"
      >
        &gt;
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useHelpStore } from '@/stores/help';
import { useIdentityStore } from '@/stores/identity';
import { useAuthStore } from '@/stores/auth';
import { useRoute, useRouter } from 'vue-router';
import { messageService } from '@/api';

export default {
  name: 'HelpDetail',
  setup() {
    const helpStore = useHelpStore();
    const identityStore = useIdentityStore();
    const authStore = useAuthStore();
    const route = useRoute();
    const router = useRouter();

    const postId = computed(() => Number(route.params.id));
    const isUpdatingStatus = ref(false);
    const uploadingImage = ref(false);
    const fileInput = ref(null);

    // 回答表单
    const answerForm = reactive({
      content: '',
      images: []
    });

    // 图片查看器
    const imageViewer = reactive({
      visible: false,
      images: [],
      currentIndex: 0
    });

    // 判断是否是帖子作者
    const isAuthor = computed(() => {
      if (!helpStore.currentPost || !authStore.isAuthenticated) return false;
      return helpStore.currentPost.user_id === authStore.userId;
    });

    // 判断是否是专家
    const isExpert = computed(() => {
      return identityStore.hasIdentity('EXPERT');
    });

    // 判断是否是回答作者
    const isAnswerAuthor = (answer) => {
      if (!answer || !authStore.isAuthenticated) return false;
      return answer.user_id === authStore.userId;
    };

    // 初始化
    onMounted(async () => {
      if (!identityStore.userIdentities) {
        await identityStore.fetchUserIdentities();
      }

      await loadPostDetail();
    });

    // 加载帖子详情
    const loadPostDetail = async () => {
      if (!postId.value) return;

      try {
        await helpStore.fetchPostDetail(postId.value);
        await helpStore.fetchAnswers(postId.value);
      } catch (error) {
        console.error('加载详情失败:', error);
      }
    };

    // 更新帖子状态
    const updatePostStatus = async (status) => {
      if (isUpdatingStatus.value || !helpStore.currentPost) return;

      try {
        isUpdatingStatus.value = true;
        await helpStore.updatePostStatus(postId.value, status);
      } catch (error) {
        console.error('更新状态失败:', error);
      } finally {
        isUpdatingStatus.value = false;
      }
    };

    // 提交回答
    const submitAnswer = async () => {
      if (helpStore.loading.createAnswer || !answerForm.content.trim()) return;

      try {
        await helpStore.createAnswer(postId.value, {
          content: answerForm.content,
          images: answerForm.images
        });

        // 重置表单
        answerForm.content = '';
        answerForm.images = [];
      } catch (error) {
        console.error('提交回答失败:', error);
      }
    };

    // 采纳回答
    const acceptAnswer = async (answerId) => {
      if (helpStore.loading.acceptAnswer) return;

      try {
        await helpStore.acceptAnswer(postId.value, answerId);
      } catch (error) {
        console.error('采纳回答失败:', error);
      }
    };

    // 删除回答
    const deleteAnswer = async (answerId) => {
      if (!confirm('确定要删除这个回答吗？')) return;

      try {
        await helpStore.deleteAnswer(postId.value, answerId);
      } catch (error) {
        console.error('删除回答失败:', error);
      }
    };

    // 处理文件上传
    const handleFileChange = async (e) => {
      if (uploadingImage.value) return;

      const files = e.target.files;
      if (!files || files.length === 0) return;

      // 检查是否超过5张图片
      if (answerForm.images.length + files.length > 5) {
        messageService.warning('最多只能上传5张图片');
        e.target.value = '';
        return;
      }

      uploadingImage.value = true;

      try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          formData.append('images', files[i]);
        }

        const response = await helpStore.uploadImages(formData);

        // 添加上传成功的图片
        if (response && response.imageUrls) {
          response.imageUrls.forEach(url => {
            answerForm.images.push(url);
          });
        }
      } catch (error) {
        console.error('上传图片失败:', error);
      } finally {
        uploadingImage.value = false;
        e.target.value = '';
      }
    };

    // 移除图片
    const removeImage = (index) => {
      answerForm.images.splice(index, 1);
    };

    // 打开图片查看器
    const openImageViewer = (index, images) => {
      imageViewer.images = images || helpStore.currentPost.images;
      imageViewer.currentIndex = index;
      imageViewer.visible = true;
    };

    // 查看上一张图片
    const prevImage = () => {
      if (imageViewer.currentIndex > 0) {
        imageViewer.currentIndex--;
      } else {
        imageViewer.currentIndex = imageViewer.images.length - 1;
      }
    };

    // 查看下一张图片
    const nextImage = () => {
      if (imageViewer.currentIndex < imageViewer.images.length - 1) {
        imageViewer.currentIndex++;
      } else {
        imageViewer.currentIndex = 0;
      }
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';

      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;

      // 一小时内
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}分钟前`;
      }

      // 一天内
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}小时前`;
      }

      // 一周内
      if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}天前`;
      }

      // 超过一周，显示具体日期
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
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

    return {
      helpStore,
      identityStore,
      postId,
      isAuthor,
      isExpert,
      isAnswerAuthor,
      answerForm,
      imageViewer,
      isUpdatingStatus,
      uploadingImage,
      fileInput,
      updatePostStatus,
      submitAnswer,
      acceptAnswer,
      deleteAnswer,
      handleFileChange,
      removeImage,
      openImageViewer,
      prevImage,
      nextImage,
      formatDate,
      getImageUrl
    };
  }
};
</script>

<style scoped>
.prose {
  max-width: 65ch;
  color: #374151;
}
.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}
</style>
