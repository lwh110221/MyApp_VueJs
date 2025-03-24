<!-- 社区列表页面 -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 顶部操作栏 -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">社区讨论</h1>
      <div class="flex gap-4 items-center">
        <router-link
          v-if="isLoggedIn"
          to="/community/create"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          发布
        </router-link>
        <router-link
          v-else
          to="/login"
          class="text-blue-500 hover:text-blue-600 transition-colors"
        >
          登录发帖
        </router-link>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <!-- 分类排序 -->
      <div class="flex flex-wrap gap-4 mb-6">
        <button
          v-for="sortOption in sortOptions"
          :key="sortOption.value"
          class="px-4 py-2 rounded-full text-sm transition-colors"
          :class="[
            currentSort === sortOption.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="selectSort(sortOption.value)"
        >
          {{ sortOption.label }}
        </button>
      </div>

      <!-- 热门标签 -->
      <div v-if="hotTags.length > 0" class="mb-6">
        <h3 class="text-sm text-gray-500 mb-2">热门标签</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in hotTags"
            :key="tag.name"
            class="px-3 py-1 text-xs rounded-full transition-colors"
            :class="[
              currentTag === tag.name
                ? 'bg-blue-100 text-blue-600 border border-blue-300'
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            ]"
            @click="selectTag(tag.name === currentTag ? '' : tag.name)"
          >
            {{ tag.name }} <span class="text-xs text-gray-500">({{ tag.count }})</span>
          </button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="relative">
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="搜索帖子..."
          class="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="debounceSearch"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="posts.length === 0" class="bg-white rounded-lg shadow p-12 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
      </svg>
      <h3 class="text-xl font-medium text-gray-600">暂无相关帖子</h3>
      <p class="text-gray-500 mt-2">换个筛选条件试试，或者发布新帖子吧</p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer overflow-hidden"
        @click="goToDetail(post.id)"
      >
        <div class="p-6">
          <div class="flex justify-between items-start">
            <h3 class="text-xl font-semibold mb-3">{{ post.title }}</h3>
            <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1 ml-4">
              <span
                v-for="tag in post.tags.slice(0, 3)"
                :key="tag"
                class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs"
              >
                {{ tag }}
              </span>
              <span v-if="post.tags.length > 3" class="text-gray-400 text-xs">+{{ post.tags.length - 3 }}</span>
            </div>
          </div>

          <p class="text-gray-600 mb-4 line-clamp-2">{{ post.content }}</p>

          <!-- 图片预览，最多显示3张 -->
          <div v-if="post.images && post.images.length > 0" class="flex gap-2 mb-4">
            <div
              v-for="(image, index) in post.images.slice(0, 3)"
              :key="index"
              class="w-24 h-24 rounded overflow-hidden flex-shrink-0"
            >
              <img :src="getImageUrl(image)" class="w-full h-full object-cover" alt="" />
            </div>
            <div
              v-if="post.images.length > 3"
              class="w-24 h-24 rounded bg-gray-100 flex items-center justify-center text-gray-500"
            >
              +{{ post.images.length - 3 }}
            </div>
          </div>

          <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center gap-4">
              <span>{{ post.author_name }}</span>
              <span>{{ formatDate(post.created_at) }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                {{ post.view_count }}
              </span>
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                {{ post.like_count }}
              </span>
              <span class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                </svg>
                {{ post.comment_count }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="flex justify-center items-center gap-4 mt-8">
      <button
        class="px-4 py-2 rounded bg-white border border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        上一页
      </button>
      <span class="text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
      <button
        class="px-4 py-2 rounded bg-white border border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import communityService from '@/api/services/community.service';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import dayjs from 'dayjs';

export default {
  name: 'CommunityList',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const toast = useToast();

    // 状态管理
    const posts = ref([]);
    const total = ref(0);
    const isLoading = ref(false);
    const searchKeyword = ref('');
    const currentSort = ref('latest');
    const currentTag = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const hotTags = ref([]);
    const isLoggedIn = computed(() => authStore.isLoggedIn);

    // 排序选项
    const sortOptions = [
      { label: '最新', value: 'latest' },
      { label: '热门', value: 'hot' },
      { label: '活跃', value: 'popular' }
    ];

    // 计算总页数
    const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

    // 从URL参数加载初始状态
    const loadFromQuery = () => {
      const query = route.query;
      if (query.keyword) searchKeyword.value = query.keyword;
      if (query.sort && sortOptions.some(option => option.value === query.sort)) {
        currentSort.value = query.sort;
      }
      if (query.tag) currentTag.value = query.tag;
      if (query.page) currentPage.value = parseInt(query.page) || 1;
    };

    // 更新URL参数
    const updateUrlParams = () => {
      const query = {};
      if (searchKeyword.value) query.keyword = searchKeyword.value;
      if (currentSort.value !== 'latest') query.sort = currentSort.value;
      if (currentTag.value) query.tag = currentTag.value;
      if (currentPage.value > 1) query.page = currentPage.value;

      router.push({
        path: '/community',
        query
      });
    };

    // 加载帖子列表
    const loadPosts = async () => {
      isLoading.value = true;
      try {
        let response;
        const params = {
          page: currentPage.value,
          limit: pageSize.value,
          sort: currentSort.value
        };

        if (searchKeyword.value) {
          params.keyword = searchKeyword.value;
          response = await communityService.searchPosts(params);
        } else if (currentTag.value) {
          response = await communityService.getPostsByTag(currentTag.value, params);
        } else {
          response = await communityService.getPostList(params);
        }

        if (response && response.data) {
          posts.value = response.data.items;
          total.value = response.data.pagination.total;
        }
      } catch (error) {
        console.error('加载帖子列表失败', error);
        toast.error('加载帖子列表失败');
      } finally {
        isLoading.value = false;
      }
    };

    // 加载热门标签
    const loadHotTags = async () => {
      try {
        const response = await communityService.getHotTags(10);
        if (response && response.data) {
          hotTags.value = response.data.tags;
        }
      } catch (error) {
        console.error('加载热门标签失败', error);
      }
    };

    // 格式化日期
    const formatDate = (dateString) => {
      return dayjs(dateString).format('YYYY-MM-DD HH:mm');
    };

    // 获取图片完整URL
    const getImageUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${process.env.VUE_APP_API_BASE_URL}${path}`;
    };

    // 防抖搜索
    let searchTimeout;
    const debounceSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentPage.value = 1;
        updateUrlParams();
        loadPosts();
      }, 500);
    };

    // 选择排序方式
    const selectSort = (sort) => {
      currentSort.value = sort;
      currentPage.value = 1;
      updateUrlParams();
      loadPosts();
    };

    // 选择标签
    const selectTag = (tag) => {
      currentTag.value = tag;
      currentPage.value = 1;
      updateUrlParams();
      loadPosts();
    };

    // 切换页码
    const changePage = (page) => {
      currentPage.value = page;
      updateUrlParams();
      loadPosts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 跳转到详情页
    const goToDetail = (postId) => {
      router.push(`/community/post/${postId}`);
    };

    // 监听URL参数变化
    watch(() => route.query, () => {
      loadFromQuery();
      loadPosts();
    }, { deep: true });

    onMounted(() => {
      loadFromQuery();
      loadPosts();
      loadHotTags();
    });

    return {
      posts,
      total,
      isLoading,
      hotTags,
      searchKeyword,
      currentSort,
      currentTag,
      currentPage,
      totalPages,
      sortOptions,
      isLoggedIn,
      formatDate,
      getImageUrl,
      debounceSearch,
      selectSort,
      selectTag,
      changePage,
      goToDetail
    };
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
