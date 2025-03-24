<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex flex-col md:flex-row justify-between items-start gap-6">
      <!-- 左侧侧边栏 -->
      <div class="w-full md:w-64 sticky top-20">
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <h3 class="text-lg font-semibold mb-3">专家求助</h3>
          <p class="text-gray-600 text-sm">
            向专家提问、获取专业指导和解答，解决您在农业生产中遇到的难题。
          </p>
          <div class="mt-4">
            <router-link
              to="/help/create"
              class="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded text-center transition"
            >
              发布求助
            </router-link>
          </div>
        </div>

        <!-- 分类过滤 -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <h3 class="text-base font-semibold mb-3">分类筛选</h3>
          <div v-if="helpStore.loading.categories" class="py-2 flex justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
          </div>
          <div v-else-if="!helpStore.hasCategories" class="text-gray-500 text-sm py-2">
            暂无分类
          </div>
          <div v-else class="space-y-1">
            <button
              class="w-full text-left px-2 py-1.5 rounded transition"
              :class="selectedCategory === null ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'"
              @click="selectCategory(null)"
            >
              全部分类
            </button>
            <button
              v-for="category in helpStore.categories"
              :key="category.id"
              class="w-full text-left px-2 py-1.5 rounded transition"
              :class="selectedCategory === category.id ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- 状态过滤 -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <h3 class="text-base font-semibold mb-3">状态筛选</h3>
          <div class="space-y-1">
            <button
              class="w-full text-left px-2 py-1.5 rounded transition"
              :class="selectedStatus === null ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'"
              @click="selectStatus(null)"
            >
              全部状态
            </button>
            <button
              v-for="(text, status) in statusOptions"
              :key="status"
              class="w-full text-left px-2 py-1.5 rounded transition"
              :class="selectedStatus === Number(status) ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'"
              @click="selectStatus(Number(status))"
            >
              {{ text }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="flex-1">
        <!-- 搜索栏 -->
        <div class="bg-white rounded-lg shadow p-4 mb-6">
          <div class="flex">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索求助问题..."
              class="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              @keyup.enter="search"
            />
            <button
              @click="search"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-r-lg transition"
            >
              搜索
            </button>
          </div>
        </div>

        <!-- 列表标题和排序 -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">
            {{ getListTitle() }}
          </h2>
          <div class="flex items-center">
            <span class="text-sm text-gray-500 mr-2">共 {{ helpStore.pagination.total }} 条</span>
            <button
              @click="refreshList"
              class="text-green-600 hover:text-green-800"
              :disabled="helpStore.loading.posts"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="helpStore.loading.posts" class="bg-white rounded-lg shadow p-8 flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!helpStore.hasPosts" class="bg-white rounded-lg shadow p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="mt-4 text-gray-500">暂无相关求助内容</p>
          <router-link to="/help/create" class="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition">
            发布求助
          </router-link>
        </div>

        <!-- 帖子列表 -->
        <div v-else class="space-y-4">
          <div
            v-for="post in helpStore.posts"
            :key="post.id"
            class="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden"
          >
            <router-link :to="`/help/post/${post.id}`" class="block p-4">
              <div class="flex justify-between items-start">
                <h3 class="text-lg font-medium text-gray-900">{{ post.title }}</h3>
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="helpStore.getPostStatusClass(post.status)"
                >
                  {{ helpStore.getPostStatusText(post.status) }}
                </span>
              </div>
              <p class="mt-2 text-gray-600 line-clamp-2">{{ post.content }}</p>

              <!-- 图片预览 -->
              <div v-if="post.images && post.images.length > 0" class="flex mt-3 space-x-2 overflow-x-auto">
                <img
                  v-for="(image, index) in post.images.slice(0, 3)"
                  :key="index"
                  :src="getImageUrl(image)"
                  class="h-16 w-16 object-cover rounded"
                />
                <div v-if="post.images.length > 3" class="h-16 w-16 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                  +{{ post.images.length - 3 }}
                </div>
              </div>

              <div class="mt-3 flex justify-between items-center text-sm text-gray-500">
                <div class="flex items-center">
                  <span>{{ post.author_name }}</span>
                  <span class="mx-2">·</span>
                  <span>{{ formatDate(post.created_at) }}</span>
                  <span class="mx-2">·</span>
                  <span>{{ post.category_name }}</span>
                </div>
                <div class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>{{ post.answer_count }} 回答</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="helpStore.pagination.totalPages > 1" class="flex justify-center mt-6">
          <div class="flex space-x-1">
            <button
              v-for="page in getPageNumbers()"
              :key="page"
              @click="changePage(page)"
              class="px-3 py-1 rounded"
              :class="page === helpStore.pagination.page
                ? 'bg-green-600 text-white'
                : 'bg-white hover:bg-gray-100 text-gray-700'"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useHelpStore } from '@/stores/help';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'HelpList',
  setup() {
    const helpStore = useHelpStore();
    const router = useRouter();
    const route = useRoute();

    // 搜索关键词
    const searchKeyword = ref('');

    // 选中的分类和状态
    const selectedCategory = ref(null);
    const selectedStatus = ref(null);

    // 状态选项
    const statusOptions = {
      0: '待解决',
      1: '已解决',
      2: '已关闭'
    };

    // 初始化
    onMounted(async () => {
      // 获取分类列表
      if (!helpStore.hasCategories) {
        await helpStore.fetchCategories();
      }

      // 从 URL 查询参数中获取筛选条件
      const { category_id, status, keyword } = route.query;

      if (category_id) {
        selectedCategory.value = Number(category_id);
      }

      if (status !== undefined) {
        selectedStatus.value = Number(status);
      }

      if (keyword) {
        searchKeyword.value = keyword;
      }

      // 设置搜索参数
      helpStore.setSearchParams({
        category_id: selectedCategory.value,
        status: selectedStatus.value,
        keyword: searchKeyword.value
      });

      // 获取帖子列表
      await helpStore.fetchPosts();
    });

    // 监听筛选条件变化，更新URL参数
    watch([selectedCategory, selectedStatus, searchKeyword], () => {
      const query = {};

      if (selectedCategory.value) {
        query.category_id = selectedCategory.value;
      }

      if (selectedStatus.value !== null) {
        query.status = selectedStatus.value;
      }

      if (searchKeyword.value) {
        query.keyword = searchKeyword.value;
      }

      router.replace({ query });
    });

    // 选择分类
    const selectCategory = (categoryId) => {
      selectedCategory.value = categoryId;
      helpStore.setSearchParams({ category_id: categoryId });
      helpStore.fetchPosts();
    };

    // 选择状态
    const selectStatus = (status) => {
      selectedStatus.value = status;
      helpStore.setSearchParams({ status });
      helpStore.fetchPosts();
    };

    // 搜索
    const search = () => {
      helpStore.setSearchParams({ keyword: searchKeyword.value });
      helpStore.fetchPosts();
    };

    // 刷新列表
    const refreshList = () => {
      helpStore.fetchPosts();
    };

    // 更改页码
    const changePage = (page) => {
      helpStore.fetchPosts({ page });
    };

    // 获取页码列表
    const getPageNumbers = () => {
      const { page, totalPages } = helpStore.pagination;
      const pages = [];

      // 显示当前页码前后2页，最多显示5页
      const start = Math.max(1, page - 2);
      const end = Math.min(totalPages, start + 4);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    };

    // 获取列表标题
    const getListTitle = () => {
      if (selectedCategory.value) {
        const category = helpStore.categories.find(c => c.id === selectedCategory.value);
        if (category) {
          return `${category.name}`;
        }
      }

      if (searchKeyword.value) {
        return `"${searchKeyword.value}" 的搜索结果`;
      }

      return '全部求助';
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
        day: '2-digit'
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
      searchKeyword,
      selectedCategory,
      selectedStatus,
      statusOptions,
      selectCategory,
      selectStatus,
      search,
      refreshList,
      changePage,
      getPageNumbers,
      getListTitle,
      formatDate,
      getImageUrl
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
