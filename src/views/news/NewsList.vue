<!-- 新闻列表页面 -->
<template>
  <div class="news-container mx-auto px-4 py-6">
    <!-- 顶部最新发布栏 -->
    <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-md mb-6 overflow-hidden">
      <div class="flex items-center">
        <div class="flex-shrink-0 py-2 px-4 bg-orange-700 flex items-center font-bold text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          最新发布:
        </div>
        <div class="flex-1 overflow-hidden py-0.5 px-4 whitespace-nowrap relative ticker-container">
          <div
            class="news-ticker inline-flex"
            :class="{'ticker-paused': isPaused}"
            v-if="latestArticles && latestArticles.length > 0"
            @mouseenter="pauseTicker"
            @mouseleave="resumeTicker"
          >
            <div class="ticker-item inline-flex items-center mx-4" v-for="(article, index) in tickerItems" :key="`${article.id}-${index}`">
              <span class="font-medium cursor-pointer text-xs" @click="goToDetail(article.id)">
                {{ formatDate(article.publish_time) }}: "{{ article.title.substring(0, 30) }}{{ article.title.length > 30 ? '...' : '' }}"
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：热门新闻轮播 -->
      <div class="lg:col-span-2">
        <div v-if="coverFeaturedArticles && coverFeaturedArticles.length > 0" class="featured-carousel relative bg-white rounded-lg shadow-md overflow-hidden">
          <div class="carousel-container overflow-hidden">
            <div class="flex transition-transform duration-500" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
              <div
                v-for="(article, index) in coverFeaturedArticles.slice(0, 5)"
                :key="article.id"
                class="carousel-item w-full flex-shrink-0 relative cursor-pointer"
                @click="goToDetail(article.id)"
              >
                <img
                  :src="getImageUrl(article.cover_image)"
                  :alt="article.title"
                  class="w-full h-64 object-cover"
                  loading="lazy"
                >
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white p-4">
                  <h3 class="text-lg font-semibold mb-2 text-shadow">{{ article.title }}</h3>
                  <p class="text-sm line-clamp-2 text-gray-100">{{ article.summary }}</p>
                </div>
              </div>
            </div>
          </div>
          <!-- 轮播控制器 -->
          <div class="carousel-controls">
            <button
              class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 text-white shadow-md z-10"
              @click.stop="prevSlide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 text-white shadow-md z-10"
              @click.stop="nextSlide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <!-- 轮播指示器 -->
          <div class="carousel-dots absolute bottom-3 left-0 right-0 flex justify-center">
            <span
              v-for="(_, index) in coverFeaturedArticles.slice(0, 5)"
              :key="index"
              class="dot mx-1 w-2 h-2 rounded-full bg-white/40 cursor-pointer transition-all duration-300"
              :class="{ 'w-4 bg-white': currentSlide === index }"
              @click.stop="setSlide(index)"
            ></span>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <span class="text-gray-500 text-sm">暂无热门新闻</span>
        </div>
      </div>

      <!-- 右侧：分类导航和推荐新闻 -->
      <div class="lg:col-span-1 space-y-6">
        <!-- 推荐区域标签 -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden h-64 flex flex-col">
          <ul class="border-b border-gray-200 flex-shrink-0">
            <li class="category-tabs flex">
              <button
                v-for="(tab, index) in recommendTabs"
                :key="tab.id"
                class="px-3 py-2 text-center flex-1 border-b-2 font-medium transition-colors text-sm"
                :class="[
                  activeRecommendTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-orange-500 hover:border-orange-200'
                ]"
                @click="setActiveRecommendTab(tab.id)"
              >
                {{ tab.name }}
              </button>
            </li>
          </ul>

          <!-- 推荐新闻列表 -->
          <div class="news-tab-content py-1 overflow-y-auto flex-grow relative">
            <!-- 加载提示 -->
            <div v-if="isRecommendLoading" class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <div class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-xs text-gray-600">加载中...</span>
              </div>
            </div>

            <div v-if="recommendArticles.length > 0" class="divide-y divide-gray-100">
              <div
                v-for="(article, index) in recommendArticles.slice(0, 8)"
                :key="article.id"
                class="py-1.5 px-4 hover:bg-gray-50 flex items-start gap-2 cursor-pointer"
                @click="goToDetail(article.id)"
              >
                <div class="min-w-[4px] h-4 bg-orange-500 rounded-full mt-1"></div>
                <div class="flex-1">
                  <h4 class="text-xs font-medium text-gray-800 line-clamp-2 hover:text-orange-600">
                    {{ article.title }}
                  </h4>
                  <div class="text-xs text-gray-500 mt-0.5">
                    {{ formatDate(article.publish_time, true) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else-if="!isRecommendLoading" class="flex items-center justify-center py-10 h-full">
              <span class="text-gray-500 text-sm">暂无相关新闻</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类内容区域 -->
    <div class="bg-white rounded-lg shadow-md mt-6 p-5">
      <!-- 顶部分类筛选区 -->
      <div class="border-b border-gray-200 pb-3 mb-5">
        <div class="flex flex-wrap gap-2">
          <button
            class="px-3 py-1 text-xs rounded-full transition-colors"
            :class="[
              currentCategory === null
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectCategory(null)"
          >
            全部
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            class="px-3 py-1 text-xs rounded-full transition-colors"
            :class="[
              currentCategory === category.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
          <div class="ml-auto flex items-center">
            <div class="relative mr-3">
              <input
                type="text"
                v-model="searchKeyword"
                placeholder="搜索新闻..."
                class="w-56 pl-8 pr-3 py-1 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                @input="debounceSearch"
              >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <!-- 视图切换 -->
            <div class="flex space-x-1">
              <button
                class="px-2 py-1 text-xs rounded border border-gray-200 flex items-center"
                :class="{ 'bg-orange-50 text-orange-600 border-orange-200': listView === 'list' }"
                @click="listView = 'list'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                列表
              </button>
              <button
                class="px-2 py-1 text-xs rounded border border-gray-200 flex items-center"
                :class="{ 'bg-orange-50 text-orange-600 border-orange-200': listView === 'grid' }"
                @click="listView = 'grid'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                网格
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-if="listView === 'list'" class="space-y-4 relative">
        <!-- 加载中提示 -->
        <div v-if="isLoading" class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm text-gray-600">加载中...</span>
          </div>
        </div>

        <div
          v-for="article in articles"
          :key="article.id"
          class="border-b border-gray-100 pb-4 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors rounded p-2"
          @click="goToDetail(article.id)"
        >
          <div class="flex flex-col md:flex-row gap-4">
            <div v-if="article.cover_image" class="md:flex-none md:w-40 h-28 overflow-hidden rounded">
              <img
                :src="getImageUrl(article.cover_image)"
                :alt="article.title"
                class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                loading="lazy"
              >
            </div>
            <div class="flex-1">
              <h3 class="text-base font-medium mb-2 hover:text-orange-600 transition-colors duration-200">{{ article.title }}</h3>
              <p class="text-gray-600 mb-2 text-xs line-clamp-2">{{ article.summary }}</p>
              <div class="flex items-center text-xs text-gray-500 gap-3">
                <span class="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-sm text-xs">
                  {{ article.category_name }}
                </span>
                <span>{{ formatDate(article.publish_time) }}</span>
                <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  {{ article.view_count }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 网格视图 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn relative">
        <!-- 加载中提示 -->
        <div v-if="isLoading" class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm text-gray-600">加载中...</span>
          </div>
        </div>

        <div
          v-for="article in articles"
          :key="article.id"
          class="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col"
          @click="goToDetail(article.id)"
        >
          <div class="relative h-40 overflow-hidden bg-gray-100">
            <img
              v-if="article.cover_image"
              :src="getImageUrl(article.cover_image)"
              :alt="article.title"
              class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              loading="lazy"
            >
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-50 p-3">
              <div class="text-xl font-bold text-gray-600 text-center line-clamp-3 hover:text-orange-600 transition-colors">
                {{ article.title }}
              </div>
            </div>
            <div class="absolute top-2 right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {{ article.category_name }}
            </div>
          </div>
          <div class="p-3 flex-grow flex flex-col">
            <h3 class="text-sm font-medium mb-2 line-clamp-2 hover:text-orange-600 transition-colors duration-200">{{ article.title }}</h3>
            <p class="text-gray-600 mb-2 text-xs line-clamp-2 flex-grow">{{ article.summary }}</p>
            <div class="flex justify-between items-center text-xs text-gray-500 mt-auto">
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatDate(article.publish_time) }}
              </span>
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                {{ article.view_count }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="articles.length === 0" class="flex flex-col items-center justify-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p class="text-gray-500 text-sm">暂无相关新闻</p>
        <button
          class="mt-3 px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-200 text-xs"
          @click="resetFilters"
        >
          重置筛选条件
        </button>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0" class="flex justify-center items-center gap-2 mt-6">
        <button
          class="px-3 py-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-xs"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        <div class="flex items-center gap-1">
          <button
            v-for="page in paginationButtons"
            :key="page === '...' ? `ellipsis-${page}` : page"
            class="min-w-[32px] h-8 rounded-md flex items-center justify-center transition-colors duration-200 text-xs"
            :class="[
              page === currentPage
                ? 'bg-orange-500 text-white'
                : page === '...'
                  ? 'text-gray-500 cursor-default'
                  : 'bg-white border border-gray-200 hover:bg-gray-50'
            ]"
            :disabled="page === '...'"
            @click="page !== '...' && changePage(page)"
          >
            {{ page }}
          </button>
        </div>
        <button
          class="px-3 py-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-xs"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import newsService from '@/api/services/news.service';

export default {
  name: 'NewsList',
  setup() {
    const router = useRouter();
    const articles = ref([]);
    const featuredArticles = ref([]);
    const tabArticles = ref([]);
    const recommendArticles = ref([]); // 推荐文章列表
    const categories = ref([]);
    const currentCategory = ref(null);
    const searchKeyword = ref('');
    const currentPage = ref(1);
    const total = ref(0);
    const pageSize = 10;
    const currentSlide = ref(0);
    const activeTab = ref(null);  // 右侧标签页当前激活的分类ID
    const activeRecommendTab = ref('hot'); // 推荐区域当前激活的标签ID
    const listView = ref('list'); // 'list' 或 'grid'
    const isPaused = ref(false); // 控制滚动状态
    const tickerItems = ref([]); // 滚动新闻项
    let slideInterval = null;
    let isAutoSliding = true;
    let tickerAnimation = null;
    const isLoading = ref(false);
    const isRecommendLoading = ref(false); // 推荐区域加载状态

    // 推荐区域的标签定义
    const recommendTabs = [
      { id: 'hot', name: '热门' },
      { id: 'latest', name: '最新' },
      { id: 'recommend', name: '推荐' },
      { id: 'featured', name: '精选' }
    ];

    // 只有带封面的文章用于轮播
    const coverFeaturedArticles = computed(() => {
      return featuredArticles.value.filter(article => article.cover_image);
    });

    // 最近3天内的新闻
    const latestArticles = computed(() => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      return featuredArticles.value.filter(article => {
        const publishDate = new Date(article.publish_time);
        return publishDate >= threeDaysAgo;
      });
    });

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
        // 默认选中第一个分类作为标签页
        if (categories.value.length > 0 && !activeTab.value) {
          activeTab.value = categories.value[0].id;
          fetchTabArticles(activeTab.value);
        }
      } catch (error) {
        console.error('获取新闻分类失败:', error);
      }
    };

    // 获取标签页新闻列表
    const fetchTabArticles = async (categoryId) => {
      try {
        const params = {
          page: 1,
          limit: 8,  // 只获取少量文章用于展示
          category_id: categoryId
        };
        const response = await newsService.getArticleList(params);
        tabArticles.value = response.data.items;
      } catch (error) {
        console.error('获取标签页新闻失败:', error);
      }
    };

    // 设置激活的标签页
    const setActiveTab = (categoryId) => {
      activeTab.value = categoryId;
      fetchTabArticles(categoryId);
    };

    // 获取热门新闻
    const fetchFeaturedArticles = async () => {
      try {
        const response = await newsService.getFeaturedArticles();
        featuredArticles.value = response.data;
        // 准备滚动显示的新闻项
        prepareTickerItems();
        // 启动轮播
        startCarousel();
      } catch (error) {
        console.error('获取热门新闻失败:', error);
      }
    };

    // 准备滚动新闻项，确保有足够的重复项来实现连续滚动效果
    const prepareTickerItems = () => {
      // 如果最新3天内的新闻少于2条，就使用全部新闻
      const items = latestArticles.value.length >= 2 ? latestArticles.value : featuredArticles.value;

      if(items.length === 0) return;

      // 确保有足够的重复项用于无缝滚动
      tickerItems.value = [...items, ...items, ...items];
    };

    // 暂停滚动
    const pauseTicker = () => {
      isPaused.value = true;
    };

    // 恢复滚动
    const resumeTicker = () => {
      isPaused.value = false;
    };

    // 获取新闻列表
    const fetchArticles = async () => {
      try {
        // 添加加载状态
        isLoading.value = true;

        // 第一次加载或切换过滤器时，获取所有数据用于前端分页
        if (allArticles.value.length === 0 || lastFilterChanged.value) {
          console.log('重新获取所有文章数据...');

          const params = {
            page: '1',
            limit: '100', // 获取足够多的数据，假设总数不超过100
            ...(currentCategory.value !== null ? { category_id: currentCategory.value } : {}),
            ...(searchKeyword.value ? { keyword: searchKeyword.value } : {})
          };

          console.log('发送请求参数:', params);

          const response = await newsService.getArticleList(params);
          console.log('接收到响应:', response.data);

          // 保存所有文章数据
          allArticles.value = response.data.items || [];

          // 设置总数
          if (response.data.pagination && response.data.pagination.total) {
            total.value = response.data.pagination.total;
          } else {
            total.value = allArticles.value.length;
          }

          // 重置过滤器变化标志
          lastFilterChanged.value = false;
        }

        // 前端分页处理
        const startIndex = (currentPage.value - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, allArticles.value.length);
        articles.value = allArticles.value.slice(startIndex, endIndex);

        console.log('前端分页 - 当前页码:', currentPage.value);
        console.log('前端分页 - 总页数:', Math.ceil(total.value / pageSize));
        console.log('前端分页 - 显示文章数量:', articles.value.length, '/', total.value);

      } catch (error) {
        console.error('获取新闻列表失败:', error);
      } finally {
        // 移除加载状态
        isLoading.value = false;
      }
    };

    // 选择分类
    const selectCategory = (categoryId) => {
      currentCategory.value = categoryId;
      currentPage.value = 1;
      fetchArticles();
    };

    // 重置筛选条件
    const resetFilters = () => {
      currentCategory.value = null;
      searchKeyword.value = '';
      currentPage.value = 1;
      fetchArticles();
    };

    // 搜索防抖
    let searchTimeout;
    const debounceSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        console.log('执行搜索:', searchKeyword.value);
        currentPage.value = 1;
        fetchArticles();
      }, 300);
    };

    // 切换页码
    const changePage = (page) => {
      currentPage.value = page;
      fetchArticles();
      // 滚动到顶部
      window.scrollTo({
        top: document.querySelector('.news-container').offsetTop - 20,
        behavior: 'smooth'
      });
    };

    // 跳转到详情页
    const goToDetail = (articleId) => {
      router.push(`/news/detail/${articleId}`);
    };

    // 格式化日期
    const formatDate = (date, simple = false) => {
      if (simple) {
        return new Date(date).toLocaleDateString('zh-CN', {
          month: '2-digit',
          day: '2-digit'
        });
      }
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // 轮播相关函数
    const startCarousel = () => {
      stopCarousel(); // 确保不会有多个定时器
      if (isAutoSliding && coverFeaturedArticles.value.length > 0) {
        slideInterval = setInterval(() => {
          nextSlide();
        }, 5000);
      }
    };

    const stopCarousel = () => {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
    };

    const pauseCarousel = () => {
      isAutoSliding = false;
      stopCarousel();
    };

    const resumeCarousel = () => {
      isAutoSliding = true;
      startCarousel();
    };

    const nextSlide = () => {
      if (coverFeaturedArticles.value.length > 0) {
        currentSlide.value = (currentSlide.value + 1) % Math.min(coverFeaturedArticles.value.length, 5);
      }
    };

    const prevSlide = () => {
      if (coverFeaturedArticles.value.length > 0) {
        currentSlide.value = (currentSlide.value - 1 + Math.min(coverFeaturedArticles.value.length, 5)) % Math.min(coverFeaturedArticles.value.length, 5);
      }
    };

    const setSlide = (index) => {
      currentSlide.value = index;
      pauseCarousel();
      setTimeout(resumeCarousel, 8000); // 8秒后恢复自动轮播
    };

    // 计算总页数
    const totalPages = computed(() => Math.ceil(total.value / pageSize));

    // 计算分页按钮
    const paginationButtons = computed(() => {
      const buttons = [];
      const maxVisibleButtons = 5;
      const totalPagesValue = totalPages.value;
      const currentPageValue = currentPage.value;

      if (totalPagesValue <= maxVisibleButtons) {
        // 总页数小于等于最大显示按钮数，显示所有页码
        for (let i = 1; i <= totalPagesValue; i++) {
          buttons.push(i);
        }
      } else {
        // 总页数大于最大显示按钮数，需要省略部分页码
        if (currentPageValue <= 3) {
          // 当前页靠近开始
          for (let i = 1; i <= 4; i++) {
            buttons.push(i);
          }
          buttons.push('...');
          buttons.push(totalPagesValue);
        } else if (currentPageValue >= totalPagesValue - 2) {
          // 当前页靠近结束
          buttons.push(1);
          buttons.push('...');
          for (let i = totalPagesValue - 3; i <= totalPagesValue; i++) {
            buttons.push(i);
          }
        } else {
          // 当前页在中间
          buttons.push(1);
          buttons.push('...');
          buttons.push(currentPageValue - 1);
          buttons.push(currentPageValue);
          buttons.push(currentPageValue + 1);
          buttons.push('...');
          buttons.push(totalPagesValue);
        }
      }

      return buttons;
    });

    // 监听搜索关键词和分类变化
    watch([searchKeyword, currentCategory], () => {
      lastFilterChanged.value = true;
      currentPage.value = 1;
    });

    // 监听轮播图文章变化
    watch(coverFeaturedArticles, (newVal) => {
      if (newVal.length > 0) {
        currentSlide.value = 0;
        startCarousel();
      }
    });

    // 监听最新文章变化
    watch(latestArticles, () => {
      prepareTickerItems();
    });

    // 设置推荐区域激活的标签
    const setActiveRecommendTab = (tabId) => {
      activeRecommendTab.value = tabId;
      fetchRecommendArticles(tabId);
    };

    // 获取推荐区域文章列表
    const fetchRecommendArticles = async (tabId) => {
      try {
        console.log('获取推荐文章，标签ID:', tabId);

        // 添加加载状态
        isRecommendLoading.value = true;

        // 添加临时前端解决方案，类似于主文章列表
        let allArticles = [];

        // 获取所有文章
        const params = {
          page: 1,
          limit: 50 // 获取足够多的文章用于筛选
        };

        const response = await newsService.getArticleList(params);
        allArticles = response.data.items || [];

        // 根据不同标签筛选
        switch (tabId) {
          case 'hot':
            // 热门文章 - 按阅读量排序
            allArticles.sort((a, b) => b.view_count - a.view_count);
            break;
          case 'latest':
            // 最新文章 - 按发布时间排序
            allArticles.sort((a, b) => new Date(b.publish_time) - new Date(a.publish_time));
            break;
          case 'recommend':
            // 推荐文章 - 这里模拟一下，取中间的一部分
            allArticles = allArticles.filter((_, index) => index % 3 === 0);
            break;
          case 'featured':
            // 精选文章 - 这里模拟一下，筛选有封面图的
            allArticles = allArticles.filter(article => article.cover_image);
            break;
        }

        console.log(`${tabId}标签筛选后文章数量:`, allArticles.length);
        // 取前12条
        recommendArticles.value = allArticles.slice(0, 12);
        console.log('设置推荐文章完成，数量:', recommendArticles.value.length);
      } catch (error) {
        console.error('获取推荐新闻失败:', error);
      } finally {
        // 移除加载状态
        isRecommendLoading.value = false;
      }
    };

    // 存储所有文章数据，用于前端分页
    const allArticles = ref([]);
    // 标记过滤器是否发生变化，需要重新获取数据
    const lastFilterChanged = ref(true);

    onMounted(() => {
      fetchCategories();
      fetchFeaturedArticles();
      fetchArticles();
      fetchRecommendArticles('hot'); // 默认加载热门标签的文章

      // 轮播鼠标事件
      const carousel = document.querySelector('.featured-carousel');
      if (carousel) {
        carousel.addEventListener('mouseenter', pauseCarousel);
        carousel.addEventListener('mouseleave', resumeCarousel);
      }

      // 启动顶部新闻滚动
      startNewsTicker();
    });

    // 顶部新闻滚动 - 使用CSS动画实现连续滚动
    const startNewsTicker = () => {
      // 动画将由CSS控制，这里只需确保数据准备好
      prepareTickerItems();
    };

    onBeforeUnmount(() => {
      stopCarousel();
      const carousel = document.querySelector('.featured-carousel');
      if (carousel) {
        carousel.removeEventListener('mouseenter', pauseCarousel);
        carousel.removeEventListener('mouseleave', resumeCarousel);
      }
    });

    return {
      articles,
      featuredArticles,
      coverFeaturedArticles,
      latestArticles,
      tickerItems,
      isPaused,
      tabArticles,
      recommendArticles,
      recommendTabs,
      categories,
      currentCategory,
      searchKeyword,
      currentPage,
      total,
      totalPages,
      currentSlide,
      activeTab,
      activeRecommendTab,
      listView,
      paginationButtons,
      selectCategory,
      setActiveTab,
      setActiveRecommendTab,
      resetFilters,
      debounceSearch,
      changePage,
      goToDetail,
      formatDate,
      getImageUrl,
      nextSlide,
      prevSlide,
      setSlide,
      pauseTicker,
      resumeTicker,
      isLoading,
      isRecommendLoading
    };
  }
};
</script>

<style scoped>
.news-container {
  max-width: 1200px;
  margin: 0 auto;
}

.carousel-container {
  position: relative;
  overflow: hidden;
}

.carousel-item {
  height: 100%;
}

.text-shadow {
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

/* 顶部新闻滚动效果 */
.ticker-container {
  position: relative;
  overflow: hidden;
}

.news-ticker {
  position: relative;
  animation: ticker 75s linear infinite;
  white-space: nowrap;
}

.ticker-paused {
  animation-play-state: paused;
}

@keyframes ticker {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.ticker-item {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .carousel-item img {
    height: 180px;
  }
}
</style>
