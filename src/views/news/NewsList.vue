<!-- 新闻列表页面 -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 热门新闻轮播 -->
    <div v-if="featuredArticles && featuredArticles.length > 0" class="mb-12">
      <h2 class="text-2xl font-bold mb-6">热门新闻</h2>
      <div class="flex gap-6 overflow-x-auto pb-4">
        <div
          v-for="article in featuredArticles"
          :key="article.id"
          class="flex-none w-[300px] bg-white rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 cursor-pointer overflow-hidden"
          @click="goToDetail(article.id)"
        >
          <template v-if="article.cover_image">
            <img
              :src="getImageUrl(article.cover_image)"
              :alt="article.title"
              class="w-full h-48 object-cover"
            >
          </template>
          <div class="p-4" :class="{ 'py-8': !article.cover_image }">
            <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ article.title }}</h3>
            <p class="text-gray-600 text-sm mb-3 line-clamp-3">{{ article.summary }}</p>
            <div class="flex items-center text-sm text-gray-500 gap-4">
              <span>{{ article.category_name }}</span>
              <span>{{ formatDate(article.publish_time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新闻筛选区 -->
    <div class="mb-8">
      <div class="flex flex-wrap gap-3 mb-4">
        <button
          v-for="category in categories"
          :key="category.id"
          class="px-4 py-2 rounded-full text-sm transition-colors"
          :class="[
            currentCategory === category.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>
      <input
        type="text"
        v-model="searchKeyword"
        placeholder="搜索新闻..."
        class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        @input="debounceSearch"
      >
    </div>

    <!-- 新闻列表 -->
    <div class="space-y-6">
      <div
        v-for="article in articles"
        :key="article.id"
        class="bg-white rounded-lg shadow hover:shadow-md transition-all hover:translate-x-1 cursor-pointer flex"
        @click="goToDetail(article.id)"
      >
        <div v-if="article.cover_image" class="flex-none w-48">
          <img
            :src="getImageUrl(article.cover_image)"
            :alt="article.title"
            class="w-full h-full object-cover rounded-l-lg"
          >
        </div>
        <div class="flex-1 p-6" :class="{ 'rounded-l-lg': !article.cover_image }">
          <h3 class="text-xl font-semibold mb-2">{{ article.title }}</h3>
          <p class="text-gray-600 mb-4 line-clamp-2">{{ article.summary }}</p>
          <div class="flex items-center text-sm text-gray-500 gap-4">
            <span class="bg-blue-50 text-blue-600 px-2 py-1 rounded">
              {{ article.category_name }}
            </span>
            <span>{{ formatDate(article.publish_time) }}</span>
            <span class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              {{ article.view_count }}
            </span>
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import newsService from '@/api/services/news.service';

export default {
  name: 'NewsList',
  setup() {
    const router = useRouter();
    const articles = ref([]);
    const featuredArticles = ref([]);
    const categories = ref([]);
    const currentCategory = ref(null);
    const searchKeyword = ref('');
    const currentPage = ref(1);
    const total = ref(0);
    const pageSize = 10;

    // 处理图片路径
    const getImageUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${path}`;
    };

    // 获取新闻分类
    const fetchCategories = async () => {
      try {
        const response = await newsService.getCategoryList();
        categories.value = response.data;
      } catch (error) {
        console.error('获取新闻分类失败:', error);
      }
    };

    // 获取热门新闻
    const fetchFeaturedArticles = async () => {
      try {
        const response = await newsService.getFeaturedArticles();
        featuredArticles.value = response.data;
      } catch (error) {
        console.error('获取热门新闻失败:', error);
      }
    };

    // 获取新闻列表
    const fetchArticles = async () => {
      try {
        const params = {
          page: currentPage.value,
          limit: pageSize,
          category_id: currentCategory.value,
          keyword: searchKeyword.value
        };
        const response = await newsService.getArticleList(params);
        articles.value = response.data.items;
        total.value = response.data.pagination.total;
      } catch (error) {
        console.error('获取新闻列表失败:', error);
      }
    };

    // 选择分类
    const selectCategory = (categoryId) => {
      currentCategory.value = currentCategory.value === categoryId ? null : categoryId;
      currentPage.value = 1;
      fetchArticles();
    };

    // 搜索防抖
    let searchTimeout;
    const debounceSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentPage.value = 1;
        fetchArticles();
      }, 300);
    };

    // 切换页码
    const changePage = (page) => {
      currentPage.value = page;
      fetchArticles();
    };

    // 跳转到详情页
    const goToDetail = (articleId) => {
      router.push(`/news/detail/${articleId}`);
    };

    // 格式化日期
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // 计算总页数
    const totalPages = computed(() => Math.ceil(total.value / pageSize));

    onMounted(() => {
      fetchCategories();
      fetchFeaturedArticles();
      fetchArticles();
    });

    return {
      articles,
      featuredArticles,
      categories,
      currentCategory,
      searchKeyword,
      currentPage,
      total,
      totalPages,
      selectCategory,
      debounceSearch,
      changePage,
      goToDetail,
      formatDate,
      getImageUrl
    };
  }
};
</script>

<style scoped>
.news-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.featured-news {
  margin-bottom: 30px;
}

.featured-list {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0;
}

.featured-item {
  flex: 0 0 300px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.featured-item:hover {
  transform: translateY(-5px);
}

.featured-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.featured-info {
  padding: 15px;
}

.news-filter {
  margin-bottom: 20px;
}

.categories {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.categories button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: none;
  cursor: pointer;
  transition: all 0.3s;
}

.categories button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.search input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 20px;
}

.news-list {
  display: grid;
  gap: 20px;
}

.news-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.news-item:hover {
  transform: translateX(5px);
}

.news-image img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.news-content {
  flex: 1;
}

.news-meta {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9em;
  margin-top: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.pagination button:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.featured-info.no-image {
  padding-top: 30px;
  padding-bottom: 30px;
}

.news-content.no-image {
  padding: 20px;
}
</style>
