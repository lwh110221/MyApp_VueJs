<!-- 帖子详情页面 -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 加载状态显示 -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- 帖子不存在提示 -->
    <div v-else-if="!post" class="bg-white rounded-lg shadow p-12 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
      </svg>
      <h3 class="text-xl font-medium text-gray-600">帖子不存在或已删除</h3>
      <div class="mt-6">
        <router-link to="/community" class="text-blue-500 hover:text-blue-600 transition-colors">
          返回社区首页
        </router-link>
      </div>
    </div>

    <!-- 帖子详情内容 -->
    <div v-else>
      <!-- 返回和操作按钮 -->
      <div class="flex justify-between items-center mb-6">
        <router-link
          to="/community"
          class="flex items-center text-gray-600 hover:text-green-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          返回列表
        </router-link>
        <div v-if="isCurrentUserPost" class="flex items-center gap-2">
          <router-link
            :to="`/community/edit/${post.id}`"
            class="text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </router-link>
          <button
            @click="confirmDelete"
            class="text-red-500 hover:text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 帖子内容卡片 -->
      <div class="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div class="p-6">
          <h1 class="text-2xl font-bold mb-4">{{ post.title }}</h1>

          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center text-sm text-gray-500 gap-3">
              <router-link
                :to="`/user/${post.user_id}`"
                class="flex items-center hover:text-green-600 transition-colors"
              >
                <img
                  :src="getUserAvatar(post.author_avatar)"
                  class="w-8 h-8 rounded-full mr-2 object-cover"
                  alt="用户头像"
                />
                <span class="font-medium">{{ post.author_name }}</span>
              </router-link>
              <span>{{ formatDate(post.created_at) }}</span>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                {{ post.view_count }}
              </span>
              <button
                class="flex items-center gap-1 hover:text-green-600 transition-colors"
                :class="{ 'text-red-500': isLiked }"
                @click="toggleLike"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                {{ post.like_count }}
              </button>
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                </svg>
                {{ post.comment_count }}
              </span>
            </div>
          </div>

          <!-- 标签显示 -->
          <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="bg-green-50 text-green-700 px-2 py-1 rounded text-xs"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 正文内容 -->
          <div class="text-gray-800 mb-6 whitespace-pre-wrap">{{ post.content }}</div>

          <!-- 图片显示 -->
          <div v-if="post.images && post.images.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div
              v-for="(image, index) in post.images"
              :key="index"
              class="rounded overflow-hidden shadow-sm"
            >
              <img
                :src="getImageUrl(image)"
                class="w-full h-auto object-cover cursor-pointer transition-transform hover:scale-105 duration-300"
                @click="showImagePreview(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div class="p-6">
          <h2 class="text-xl font-bold mb-6">评论 ({{ post.comment_count }})</h2>

          <!-- 评论输入框 -->
          <div v-if="authStore.isLoggedIn" class="mb-8">
            <div class="flex items-center mb-2" v-if="replyingTo">
              <span class="text-sm text-gray-600">回复给: <span class="text-blue-500">{{ replyingTo.author_name }}</span></span>
              <button
                @click="cancelReply"
                class="ml-2 text-sm text-red-500 hover:text-red-600"
              >
                取消回复
              </button>
            </div>
            <textarea
              v-model="commentContent"
              :placeholder="replyingTo ? `回复 ${replyingTo.author_name}...` : '写下你的评论...'"
              class="w-full p-3 border border-gray-200 rounded-lg resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-600"
              :maxlength="1000"
            ></textarea>
            <div class="flex justify-between items-center mt-2">
              <div class="text-sm text-gray-500">
                {{ commentContent.length }}/1000
              </div>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-green-600 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    @change="handleImageUpload"
                    class="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                  </svg>
                  添加图片
                </label>
                <button
                  @click="submitComment"
                  :disabled="isSubmittingComment || !commentContent.trim()"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {{ isSubmittingComment ? '发送中...' : '发表评论' }}
                </button>
              </div>
            </div>

            <!-- 上传的图片预览 -->
            <div v-if="commentImages.length > 0" class="flex gap-2 mt-4 overflow-x-auto">
              <div
                v-for="(image, index) in commentImages"
                :key="index"
                class="relative w-20 h-20 flex-none"
              >
                <img
                  :src="image.url"
                  class="w-full h-full object-cover rounded shadow-sm"
                />
                <button
                  @click="removeCommentImage(index)"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>

          <div v-else class="bg-gray-50 p-4 rounded-lg text-center mb-8">
            <p class="text-gray-600">
              需要
              <router-link to="/login" class="text-green-600 hover:text-green-700">
                登录
              </router-link>
              后才能评论
            </p>
          </div>

          <!-- 评论列表 -->
          <div v-if="isLoadingComments" class="flex justify-center py-6">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
          </div>

          <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
            暂无评论，快来发表第一条评论吧！
          </div>

          <div v-else class="space-y-6">
            <!-- 只渲染顶级评论，子评论会在各自的父评论下显示 -->
            <div
              v-for="comment in topLevelComments"
              :key="comment.id"
              class="border-b border-gray-100 pb-6 last:border-0"
            >
              <!-- 母评论内容 -->
              <div class="flex justify-between items-start">
                <div class="flex items-center space-x-3 mb-3">
                  <router-link
                    :to="`/user/${comment.user_id}`"
                    class="flex items-center hover:text-green-600 transition-colors"
                  >
                    <img
                      :src="getUserAvatar(comment.author_avatar)"
                      class="w-6 h-6 rounded-full mr-2 object-cover"
                      alt="评论者头像"
                    />
                    <div class="font-medium">{{ comment.author_name }}</div>
                  </router-link>
                  <div class="text-sm text-gray-500">{{ formatDate(comment.created_at) }}</div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    v-if="canDelete(comment)"
                    @click="deleteComment(comment.id)"
                    class="text-red-500 hover:text-red-600 transition-colors text-sm"
                  >
                    删除
                  </button>
                  <button
                    v-if="authStore.isLoggedIn"
                    @click="replyToComment(comment)"
                    class="text-blue-500 hover:text-blue-600 transition-colors text-sm"
                  >
                    回复
                  </button>
                </div>
              </div>

              <div class="text-gray-800 mb-3">
                {{ comment.content }}
              </div>

              <!-- 评论图片 -->
              <div v-if="comment.images && comment.images.length > 0" class="flex gap-2 mt-2 overflow-x-auto mb-4">
                <div
                  v-for="(image, index) in comment.images"
                  :key="index"
                  class="w-24 h-24 flex-none"
                >
                  <img
                    :src="getImageUrl(image)"
                    class="w-full h-full object-cover rounded cursor-pointer shadow-sm hover:scale-105 transition-transform duration-300"
                    @click="showImagePreview(index, comment.images)"
                  />
                </div>
              </div>

              <!-- 子评论区域 -->
              <div v-if="getChildComments(comment.id).length > 0" class="mt-4 pl-6 border-l-2 border-gray-100 space-y-4">
                <div
                  v-for="childComment in getChildComments(comment.id)"
                  :key="childComment.id"
                  class="pt-3"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex items-center space-x-3 mb-2">
                      <router-link
                        :to="`/user/${childComment.user_id}`"
                        class="flex items-center hover:text-green-600 transition-colors"
                      >
                        <img
                          :src="getUserAvatar(childComment.author_avatar)"
                          class="w-5 h-5 rounded-full mr-2 object-cover"
                          alt="评论者头像"
                        />
                        <div class="font-medium text-sm">{{ childComment.author_name }}</div>
                      </router-link>
                      <div class="text-xs text-gray-500">{{ formatDate(childComment.created_at) }}</div>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        v-if="canDelete(childComment)"
                        @click="deleteComment(childComment.id)"
                        class="text-red-500 hover:text-red-600 transition-colors text-xs"
                      >
                        删除
                      </button>
                      <button
                        v-if="authStore.isLoggedIn"
                        @click="replyToComment(childComment)"
                        class="text-blue-500 hover:text-blue-600 transition-colors text-xs"
                      >
                        回复
                      </button>
                    </div>
                  </div>

                  <div class="text-gray-800 text-sm">
                    <span class="text-blue-500">@{{ getParentCommentAuthor(childComment.parent_id) }} </span>
                    {{ childComment.content }}
                  </div>

                  <!-- 子评论图片 -->
                  <div v-if="childComment.images && childComment.images.length > 0" class="flex gap-2 mt-2 overflow-x-auto">
                    <div
                      v-for="(image, index) in childComment.images"
                      :key="index"
                      class="w-16 h-16 flex-none"
                    >
                      <img
                        :src="getImageUrl(image)"
                        class="w-full h-full object-cover rounded cursor-pointer shadow-sm hover:scale-105 transition-transform duration-300"
                        @click="showImagePreview(index, childComment.images)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 评论分页 -->
          <div v-if="totalComments > pageSize" class="flex justify-center items-center gap-4 mt-8">
            <button
              class="px-4 py-2 rounded bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              :disabled="currentCommentPage === 1"
              @click="changeCommentPage(currentCommentPage - 1)"
            >
              上一页
            </button>
            <span class="text-gray-600">{{ currentCommentPage }} / {{ totalCommentPages }}</span>
            <button
              class="px-4 py-2 rounded bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              :disabled="currentCommentPage === totalCommentPages"
              @click="changeCommentPage(currentCommentPage + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 图片预览组件 -->
  <div
    v-if="lightbox.visible"
    class="fixed inset-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center"
    @click="closeLightbox"
  >
    <!-- 关闭按钮 -->
    <button
      class="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center z-60"
      @click.stop="closeLightbox"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- 左箭头 -->
    <button
      v-if="lightbox.images.length > 1"
      class="absolute left-4 text-white bg-gray-800 bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
      @click.stop="prevImage"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- 图片容器 -->
    <div class="relative max-w-[90vw] max-h-[90vh]">
      <img
        :src="lightbox.currentImageUrl"
        class="max-h-[85vh] max-w-[85vw] object-contain"
        :class="{'animate-fade-in': lightbox.isAnimating}"
      />
      <div class="absolute bottom-0 inset-x-0 text-center text-white pb-4">
        {{ lightbox.currentIndex + 1 }} / {{ lightbox.images.length }}
      </div>
    </div>

    <!-- 右箭头 -->
    <button
      v-if="lightbox.images.length > 1"
      class="absolute right-4 text-white bg-gray-800 bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
      @click.stop="nextImage"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth';
import communityService from '@/api/services/community.service';
import dayjs from 'dayjs';

export default {
  name: 'PostDetail',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const toast = useToast();
    const authStore = useAuthStore();

    // 状态管理
    const postId = ref(parseInt(route.params.id));
    const post = ref(null);
    const isLoading = ref(true);
    const isLiked = ref(false);

    // 评论相关状态
    const comments = ref([]);
    const isLoadingComments = ref(false);
    const currentCommentPage = ref(1);
    const pageSize = ref(10);
    const totalComments = ref(0);
    const commentContent = ref('');
    const commentImages = ref([]);
    const isSubmittingComment = ref(false);
    const replyingTo = ref(null); // 用于跟踪正在回复的评论

    // Lightbox 状态
    const lightbox = ref({
      visible: false,
      images: [],
      currentIndex: 0,
      isAnimating: false,
      currentImageUrl: ''
    });

    // 计算属性
    const isCurrentUserPost = computed(() => {
      if (!post.value || !authStore.isLoggedIn) return false;
      return post.value.user_id === authStore.user?.id;
    });

    const totalCommentPages = computed(() => Math.ceil(totalComments.value / pageSize.value));

    // 计算属性：筛选出顶级评论（没有父评论的评论）
    const topLevelComments = computed(() => {
      return comments.value.filter(comment => !comment.parent_id);
    });

    // 获取某个评论的所有子评论
    const getChildComments = (parentId) => {
      // 直接子评论
      const directChildren = comments.value.filter(comment => comment.parent_id === parentId);

      // 需要找出所有间接子评论，无论嵌套多深
      const getAllChildComments = (rootParentId) => {
        // 先找出直接子评论
        const directDecendants = comments.value.filter(comment => comment.parent_id === rootParentId);

        // 已处理的子评论ID集合，用于避免循环引用
        const processedIds = new Set();
        // 所有应该显示在该顶级评论下的子评论
        const allDecendants = [];

        // 递归处理所有子评论
        const processChildren = (commentId) => {
          // 如果已经处理过这个评论，跳过以避免循环
          if (processedIds.has(commentId)) return;

          // 标记为已处理
          processedIds.add(commentId);

          // 找到这个评论的直接子评论
          const children = comments.value.filter(comment => comment.parent_id === commentId);

          // 如果这些子评论不是顶级评论的直接子评论，则添加到结果中
          children.forEach(child => {
            if (child.parent_id !== rootParentId) {
              allDecendants.push(child);
            }
            // 继续递归处理这个子评论的子评论
            processChildren(child.id);
          });
        };

        // 对每个直接子评论，处理它的所有子评论
        directDecendants.forEach(child => {
          processChildren(child.id);
        });

        return [...directDecendants, ...allDecendants];
      };

      // 获取所有嵌套子评论
      const allChildren = getAllChildComments(parentId);

      // 按时间顺序排序
      return allChildren.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    };

    // 格式化日期
    const formatDate = (dateString) => {
      return dayjs(dateString).format('YYYY-MM-DD HH:mm');
    };

    // 获取图片完整URL
    const getImageUrl = (path) => {
      console.log("正在处理图片路径:", path);
      if (!path) return '';
      if (typeof path === 'object' && path.url) {
        path = path.url;
      }
      if (typeof path === 'string' && path.startsWith('http')) return path;
      const baseUrl = import.meta.env.VITE_BASE_API_URL?.replace('/api', '') || process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';
      return `${baseUrl}${path}`;
    };

    // 获取用户头像
    const getUserAvatar = (profilePicture) => {
      if (!profilePicture) return '/default-avatar.png';
      if (profilePicture && profilePicture.startsWith('http')) return profilePicture;
      const baseUrl = import.meta.env.VITE_BASE_API_URL?.replace('/api', '') || process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';
      return `${baseUrl}${profilePicture}`;
    };

    // 加载帖子详情
    const loadPostDetail = async () => {
      isLoading.value = true;
      try {
        // 确保postId是数字类型
        const response = await communityService.getPostDetail(Number(postId.value));
        if (response && response.data) {
          console.log("获取到的帖子数据:", response.data);

          // 处理帖子图片数据
          if (response.data.images) {
            if (typeof response.data.images === 'string') {
              try {
                response.data.images = JSON.parse(response.data.images);
              } catch (err) {
                console.error("解析帖子图片数据错误:", err);
                response.data.images = [];
              }
            } else if (!Array.isArray(response.data.images)) {
              response.data.images = [];
            }
            console.log("处理后的帖子图片:", response.data.images);
          }

          post.value = response.data;
          // 加载完帖子后检查用户是否已点赞
          checkUserLike();
          // 加载评论
          loadComments();
        }
      } catch (error) {
        console.error('加载帖子详情失败', error);
        toast.error('加载帖子详情失败');
      } finally {
        isLoading.value = false;
      }
    };

    // 检查用户是否已点赞该帖子
    const checkUserLike = async () => {
      if (!authStore.isLoggedIn) return;

      try {
        // 确保postId和targetType都是数字类型
        const response = await communityService.checkUserLike(Number(postId.value), 1);
        if (response && response.code === 200 && response.data) {
          isLiked.value = response.data.liked;
        }
      } catch (error) {
        console.error('检查点赞状态失败', error);
      }
    };

    // 点赞/取消点赞
    const toggleLike = async () => {
      if (!authStore.isLoggedIn) {
        router.push('/login');
        return;
      }

      try {
        const action = isLiked.value ? 'unlike' : 'like';
        // 确保postId是数字类型
        const response = await communityService.togglePostLike(Number(postId.value), action);

        if (response) {
          isLiked.value = !isLiked.value;
          // 更新点赞数
          if (isLiked.value) {
            post.value.like_count++;
          } else {
            post.value.like_count = Math.max(0, post.value.like_count - 1);
          }
          toast.success(isLiked.value ? '点赞成功' : '已取消点赞');
        }
      } catch (error) {
        console.error('操作点赞失败', error);
        toast.error('操作失败，请稍后重试');
      }
    };

    // 确认删除帖子
    const confirmDelete = () => {
      if (confirm('确定要删除这篇帖子吗？此操作不可恢复。')) {
        deletePost();
      }
    };

    // 删除帖子
    const deletePost = async () => {
      try {
        // 确保postId是数字类型
        await communityService.deletePost(Number(postId.value));
        toast.success('帖子已删除');
        router.push('/community');
      } catch (error) {
        console.error('删除帖子失败', error);
        toast.error('删除失败，请稍后重试');
      }
    };

    // 图片预览 - 使用Lightbox
    const showImagePreview = (index, imageArray) => {
      const images = imageArray || post.value.images;
      if (!images || images.length === 0) return;

      lightbox.value.images = images;
      lightbox.value.currentIndex = index;
      lightbox.value.visible = true;
      lightbox.value.currentImageUrl = getImageUrl(images[index]);

      // 预加载下一张图片
      if (images.length > 1) {
        const nextIndex = (index + 1) % images.length;
        const img = new Image();
        img.src = getImageUrl(images[nextIndex]);
      }
    };

    // 关闭Lightbox
    const closeLightbox = () => {
      lightbox.value.visible = false;
    };

    // 上一张图片
    const prevImage = () => {
      if (lightbox.value.images.length <= 1) return;

      lightbox.value.isAnimating = true;
      lightbox.value.currentIndex = (lightbox.value.currentIndex - 1 + lightbox.value.images.length) % lightbox.value.images.length;
      lightbox.value.currentImageUrl = getImageUrl(lightbox.value.images[lightbox.value.currentIndex]);

      setTimeout(() => {
        lightbox.value.isAnimating = false;
      }, 300);
    };

    // 下一张图片
    const nextImage = () => {
      if (lightbox.value.images.length <= 1) return;

      lightbox.value.isAnimating = true;
      lightbox.value.currentIndex = (lightbox.value.currentIndex + 1) % lightbox.value.images.length;
      lightbox.value.currentImageUrl = getImageUrl(lightbox.value.images[lightbox.value.currentIndex]);

      setTimeout(() => {
        lightbox.value.isAnimating = false;
      }, 300);
    };

    // 加载评论列表
    const loadComments = async () => {
      isLoadingComments.value = true;
      try {
        const response = await communityService.getCommentList(Number(postId.value), {
          page: currentCommentPage.value,
          limit: pageSize.value
        });

        if (response && response.code === 200 && response.data) {
          console.log("评论列表数据:", response.data);
          // 处理评论数据
          const processedComments = response.data.items.map(comment => {
            try {
              // 解析图片数据
              comment.images = typeof comment.images === 'string' ?
                JSON.parse(comment.images) :
                (Array.isArray(comment.images) ? comment.images : []);

              return comment;
            } catch (err) {
              console.error('解析评论图片数据错误:', err);
              comment.images = [];
              return comment;
            }
          });

          // 将评论按时间顺序排序
          comments.value = processedComments.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          totalComments.value = response.data.pagination.total;
        }
      } catch (error) {
        console.error('加载评论失败', error);
        toast.error('加载评论失败');
      } finally {
        isLoadingComments.value = false;
      }
    };

    // 切换评论页码
    const changeCommentPage = (page) => {
      currentCommentPage.value = page;
      loadComments();
    };

    // 处理评论图片上传
    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files);
      if (!files.length) return;

      // 限制上传数量
      if (commentImages.value.length + files.length > 9) {
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
          commentImages.value.push({
            file,
            url: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });

      // 清空input，确保可以再次选择同一文件
      event.target.value = '';
    };

    // 移除评论图片
    const removeCommentImage = (index) => {
      commentImages.value.splice(index, 1);
    };

    // 回复特定评论
    const replyToComment = (comment) => {
      replyingTo.value = comment;
      // 将滚动位置定位到评论输入框
      setTimeout(() => {
        document.querySelector('textarea[v-model="commentContent"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    // 取消回复
    const cancelReply = () => {
      replyingTo.value = null;
    };

    // 提交评论
    const submitComment = async () => {
      if (!commentContent.value.trim()) {
        toast.error('评论内容不能为空');
        return;
      }

      isSubmittingComment.value = true;

      try {
        // 先上传图片（如果有）
        let uploadedImages = [];

        if (commentImages.value.length > 0) {
          const formData = new FormData();
          commentImages.value.forEach(item => {
            formData.append('images', item.file);
          });

          const uploadResponse = await communityService.uploadImages(formData);
          console.log("图片上传响应:", uploadResponse);

          if (uploadResponse && uploadResponse.code === 200 && uploadResponse.data) {
            // 正确获取图片URL
            uploadedImages = uploadResponse.data.map(item => item.url);
            console.log("提取的图片URL:", uploadedImages);
          }
        }

        // 发表评论
        const commentData = {
          content: commentContent.value,
          images: uploadedImages,
          parent_id: replyingTo.value ? replyingTo.value.id : null // 使用 parent_id 而不是 reply_to
        };

        console.log("准备提交的评论数据:", commentData);

        // 确保postId是数字类型
        const response = await communityService.createComment(Number(postId.value), commentData);
        console.log("评论提交响应:", response);

        if (response && response.code === 200) {
          toast.success(replyingTo.value ? '回复发表成功' : '评论发表成功');

          // 重置评论表单
          commentContent.value = '';
          commentImages.value = [];
          replyingTo.value = null; // 重置回复状态

          // 更新评论计数
          if (post.value) {
            post.value.comment_count++;
          }

          // 重新加载评论，并跳转到第一页
          currentCommentPage.value = 1;
          await loadComments();
        }
      } catch (error) {
        console.error('发表评论失败', error);
        toast.error('发表评论失败，请稍后重试');
      } finally {
        isSubmittingComment.value = false;
      }
    };

    // 删除评论
    const deleteComment = async (commentId) => {
      if (!confirm('确定要删除这条评论吗？')) return;

      try {
        await communityService.deleteComment(commentId);
        toast.success('评论已删除');

        // 更新评论计数
        if (post.value) {
          post.value.comment_count = Math.max(0, post.value.comment_count - 1);
        }

        // 重新加载评论
        await loadComments();
      } catch (error) {
        console.error('删除评论失败', error);
        toast.error('删除评论失败，请稍后重试');
      }
    };

    // 检查是否可以删除评论（评论作者或帖子作者可删除）
    const canDelete = (comment) => {
      if (!authStore.isLoggedIn || !authStore.user) return false;

      return (
        comment.user_id === authStore.user.id || // 评论作者
        (post.value && post.value.user_id === authStore.user.id) // 帖子作者
      );
    };

    // 键盘事件处理
    const handleKeyPress = (e) => {
      if (!lightbox.value.visible) return;

      if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    // 获取父评论作者名称
    const getParentCommentAuthor = (parentId) => {
      if (!parentId) return '';
      const parentComment = comments.value.find(c => c.id === parentId);

      // 如果父评论在评论列表中找到了
      if (parentComment) {
        // 如果父评论本身就是顶级评论，直接返回作者名
        if (!parentComment.parent_id) {
          return parentComment.author_name;
        }

        // 如果父评论是子评论（即这是孙评论），返回实际回复的那条评论的作者名
        return parentComment.author_name;
      }

      return '';
    };

    onMounted(() => {
      loadPostDetail();
      // 添加键盘事件监听
      window.addEventListener('keydown', handleKeyPress);
    });

    return {
      post,
      isLoading,
      isLiked,
      isCurrentUserPost,
      comments,
      topLevelComments,
      isLoadingComments,
      currentCommentPage,
      pageSize,
      totalComments,
      totalCommentPages,
      commentContent,
      commentImages,
      isSubmittingComment,
      lightbox,
      authStore,
      replyingTo,
      formatDate,
      getImageUrl,
      getUserAvatar,
      toggleLike,
      confirmDelete,
      showImagePreview,
      closeLightbox,
      prevImage,
      nextImage,
      changeCommentPage,
      handleImageUpload,
      removeCommentImage,
      submitComment,
      deleteComment,
      canDelete,
      replyToComment,
      cancelReply,
      getParentCommentAuthor,
      getChildComments
    };
  }
}
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

/* Lightbox动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: scaleIn 0.3s ease forwards;
}

/* 覆盖层淡入 */
[v-if="lightbox.visible"] {
  animation: fadeIn 0.3s ease;
}

/* 按钮悬停效果 */
[v-if="lightbox.visible"] button {
  transition: background-color 0.2s, transform 0.2s;
}

[v-if="lightbox.visible"] button:hover {
  background-color: rgba(75, 85, 99, 0.7);
  transform: scale(1.05);
}

/* 图片缩放和过渡效果 */
img {
  transition: transform 0.3s ease;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
