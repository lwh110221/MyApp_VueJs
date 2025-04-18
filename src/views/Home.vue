<template>
  <div class="min-h-screen page-bg">
    <!-- 顶部横幅区域轮播 -->
    <div class="bg-highland-gradient from-highland-500 to-highland-600 py-24 md:py-48 text-white relative overflow-hidden">
      <!-- 轮播背景 -->
      <div class="carousel-container">
        <div class="carousel-slides" :style="{transform: `translateX(-${currentSlide * 100}%)`}">
          <!-- 轮播项 (可以自己替换图片) -->
          <div class="carousel-slide" style="background-image: url('/images/banner/bg1.jpg')"></div>
          <div class="carousel-slide" style="background-image: url('/images/banner/bg2.jpg')"></div>
          <div class="carousel-slide" style="background-image: url('/images/banner/bg3.jpg')"></div>
        </div>

        <!-- 轮播指示器 -->
        <div class="carousel-indicators">
          <span
            v-for="(_, index) in 3"
            :key="index"
            class="carousel-dot"
            :class="{'active': currentSlide === index}"
            @click="setSlide(index)"
          ></span>
        </div>

        <!-- 轮播控制箭头 -->
        <button class="carousel-control carousel-prev" @click="prevSlide">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button class="carousel-control carousel-next" @click="nextSlide">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- 内容层 -->
      <div class="relative z-10 max-w-6xl mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between">
          <div class="mb-6 md:mb-0 md:w-1/2">
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">云南高原农业服务平台</h1>
            <p class="text-lg md:text-xl mb-6 text-highland-100">连接农户与市场，提供专业农业知识服务</p>
            <div class="flex flex-wrap gap-3">
              <router-link to="/products" class="px-6 py-3 bg-crop-400 hover:bg-crop-500 text-highland-800 font-medium rounded-md transition duration-200">
                浏览农产品
              </router-link>
              <router-link to="/help" class="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-md transition duration-200">
                专家求助
              </router-link>
            </div>
          </div>
          <div class="md:w-1/2 flex justify-center">
            <div class="relative w-full max-w-md">
              <!-- <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg> -->
              <!-- <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <span class="block text-2xl font-bold mb-2">欢迎您</span>
                  <span v-if="isLoggedIn" class="block text-xl">{{ username }}</span>
                  <div v-else class="mt-4">
                    <router-link to="/login" class="text-white hover:text-highland-100 underline">登录</router-link>
                    <span class="mx-2">或</span>
                    <router-link to="/register" class="text-white hover:text-highland-100 underline">注册</router-link>
                  </div>
                </div>
              </div> -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- 服务功能入口 -->
      <section class="mb-12 service-section">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 section-title">平台服务</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link to="/products" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center service-card product-card">
            <div class="bg-crop-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-crop-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">农产品市场</h3>
            <p class="text-sm text-gray-600">农产品直销交易</p>
          </router-link>

          <router-link to="/help" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center service-card help-card">
            <div class="bg-highland-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-highland-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">专家求助</h3>
            <p class="text-sm text-gray-600">专业问题咨询解答</p>
          </router-link>

          <router-link to="/community" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center service-card community-card">
            <div class="bg-orange-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">农业社区</h3>
            <p class="text-sm text-gray-600">分享交流种植经验</p>
          </router-link>

          <router-link to="/ai-chat" class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center service-card ai-card">
            <div class="bg-blue-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-1">AI农业助手</h3>
            <p class="text-sm text-gray-600">智能农业知识问答</p>
          </router-link>
        </div>
      </section>

      <!-- 新闻资讯和产品推荐 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 新闻资讯 -->
        <div class="lg:col-span-2">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800 section-title">农业资讯</h2>
            <router-link to="/news" class="text-highland-600 hover:text-highland-700 text-sm font-medium flex items-center">
              查看更多
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>

          <div class="bg-white rounded-lg shadow-md overflow-hidden section-card news-card">
            <div v-if="isNewsLoading" class="p-6 flex justify-center">
              <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-highland-500"></div>
            </div>
            <div v-else-if="articles.length === 0" class="p-6 text-center">
              <p class="text-gray-500">暂无资讯内容</p>
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div v-for="article in articles" :key="article.id" class="p-4 hover:bg-gray-50 news-item">
                <router-link :to="`/news/detail/${article.id}`" class="block">
                  <div class="flex space-x-4">
                    <div v-if="article.cover_image" class="flex-shrink-0">
                      <img :src="getImageUrl(article.cover_image)" class="w-20 h-20 object-cover rounded" alt="文章封面" />
                    </div>
                    <div v-else class="flex-shrink-0 w-12 h-12 bg-highland-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-highland-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-5v2a2 2 0 01-2 2H9a2 2 0 01-2-2V6h-.5A1.5 1.5 0 006 7.5V18a1.5 1.5 0 001.5 1.5H19z" />
                      </svg>
                    </div>
                    <div :class="['flex-1', {'pl-0': !article.cover_image}]">
                      <h3 class="text-lg font-medium text-gray-800 mb-1 line-clamp-2">{{ article.title }}</h3>
                      <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ article.summary }}</p>
                      <div class="flex items-center text-xs text-gray-500">
                        <span>{{ formatDate(article.publish_time) }}</span>
                        <span class="mx-2">·</span>
                        <span>{{ article.category_name }}</span>
                      </div>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 产品推荐 -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-gray-800 section-title product-title">推荐农产品</h2>
            <router-link to="/products" class="text-highland-600 hover:text-highland-700 text-sm font-medium flex items-center">
              查看更多
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>

          <div class="bg-white rounded-lg shadow-md overflow-hidden section-card product-card">
            <div v-if="isProductsLoading" class="p-6 flex justify-center">
              <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-crop-500"></div>
            </div>
            <div v-else-if="featuredProducts.length === 0" class="p-6 text-center">
              <p class="text-gray-500">暂无推荐产品</p>
            </div>
            <div v-else class="divide-y divide-gray-100">
              <div v-for="product in featuredProducts" :key="product.id" class="p-4 hover:bg-gray-50 product-item">
                <router-link :to="`/products/${product.id}`" class="block">
                  <div class="flex flex-col items-center">
                    <div class="w-full h-36 mb-3 overflow-hidden rounded product-image-container">
                      <img :src="getProductImage(product)" class="w-full h-full object-cover transition hover:scale-105" alt="产品图片" />
                      <div class="product-name-overlay">{{ product.title }}</div>
                    </div>
                    <div class="product-info-container w-full">
                      <h3 class="text-base font-bold text-gray-800 mb-2 product-title-text text-center">{{ product.name }}</h3>
                      <p class="text-sm font-bold text-crop-600 mt-1">¥{{ formatPrice(product.price) }}</p>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 专家求助展示 -->
      <section class="mt-12">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800 section-title help-title">热门求助</h2>
          <router-link to="/help" class="text-highland-600 hover:text-highland-700 text-sm font-medium flex items-center">
            查看更多
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden section-card help-card">
          <div v-if="isHelpLoading" class="p-6 flex justify-center">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-highland-500"></div>
          </div>
          <div v-else-if="helpPosts.length === 0" class="p-6 text-center">
            <p class="text-gray-500">暂无求助问题</p>
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div v-for="post in helpPosts" :key="post.id" class="p-4 hover:bg-gray-50 help-item">
              <router-link :to="`/help/post/${post.id}`" class="block">
                <h3 class="text-lg font-medium text-gray-800 mb-2">{{ post.title }}</h3>
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ post.content }}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <div class="flex items-center">
                    <span>{{ formatDate(post.created_at) }}</span>
                    <span class="mx-2">·</span>
                    <span>{{ post.category_name }}</span>
                  </div>
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>{{ post.answer_count || 0 }} 回答</span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useProductStore } from '@/stores/product';
import { useHelpStore } from '@/stores/help';
import newsService from '@/api/services/news.Service';

export default {
  name: 'Home',
  setup() {
    const authStore = useAuthStore();
    const productStore = useProductStore();
    const helpStore = useHelpStore();

    // 用户信息
    const isLoggedIn = ref(false);
    const username = ref('');
    const email = ref('');

    // 数据列表
    const articles = ref([]);
    const featuredProducts = ref([]);
    const helpPosts = ref([]);

    // 加载状态
    const isNewsLoading = ref(false);
    const isProductsLoading = ref(false);
    const isHelpLoading = ref(false);

    // 轮播相关状态和方法
    const currentSlide = ref(0);
    let slideInterval = null;

    onMounted(() => {
      checkAuth();
      loadHomeData();
      startAutoSlide(); // 开始自动轮播
    });

    // 检查用户登录状态
    const checkAuth = () => {
      isLoggedIn.value = authStore.isLoggedIn;
      if (isLoggedIn.value && authStore.user) {
        username.value = authStore.user.username;
        email.value = authStore.user.email;
      }
    };

    // 加载首页数据
    const loadHomeData = async () => {
      // 使用Promise.allSettled确保即使部分请求失败，其他请求仍能正常处理
      await Promise.allSettled([
        loadNews(),
        loadProducts(),
        loadHelpPosts()
      ]);
    };

    // 加载新闻资讯
    const loadNews = async () => {
      isNewsLoading.value = true;
      try {
        const response = await newsService.getFeaturedArticles(5);
        articles.value = response.data || [];
      } catch (error) {
        console.error('获取新闻资讯失败:', error);
        articles.value = []; // 确保出错时使用空数组
      } finally {
        isNewsLoading.value = false;
      }
    };

    // 加载推荐产品
    const loadProducts = async () => {
      isProductsLoading.value = true;
      try {
        // 使用普通产品列表API代替有问题的推荐产品API
        const params = {
          page: 1,
          limit: 4,
          sort_by: 'created_at',
          sort_order: 'desc'
        };
        await productStore.fetchProducts(params);

        // 确保数据中包含name字段
        featuredProducts.value = productStore.products.slice(0, 4).map(product => {
          // 如果产品名称为空，则添加默认名称
          if (!product.title || product.title.trim() === '') {
            product.title = '云南特色农产品';
          }
          return product;
        });

        console.log('加载的产品数据:', featuredProducts.value);
      } catch (error) {
        console.error('获取产品失败:', error);
        featuredProducts.value = []; // 确保出错时使用空数组
      } finally {
        isProductsLoading.value = false;
      }
    };

    // 加载求助问题
    const loadHelpPosts = async () => {
      isHelpLoading.value = true;
      try {
        await helpStore.fetchPosts({
          page: 1,
          limit: 3,
          status: 1 // 只获取开放状态的问题
        });
        helpPosts.value = helpStore.posts;
      } catch (error) {
        console.error('获取求助问题失败:', error);
        helpPosts.value = []; // 确保出错时使用空数组
      } finally {
        isHelpLoading.value = false;
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
        month: '2-digit',
        day: '2-digit'
      });
    };

    // 获取图片完整URL
    const getImageUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      const baseUrl = import.meta.env.VITE_BASE_API_URL?.replace('/api', '') || '';
      return `${baseUrl}${path}`;
    };

    // 获取产品图片
    const getProductImage = (product) => {
      return productStore.getProductImage(product);
    };

    // 格式化价格
    const formatPrice = (price) => {
      return productStore.formatPrice(price);
    };

    // 设置轮播到指定索引
    const setSlide = (index) => {
      currentSlide.value = index;
    };

    // 前一张
    const prevSlide = () => {
      currentSlide.value = (currentSlide.value - 1 + 3) % 3;
    };

    // 后一张
    const nextSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % 3;
    };

    // 自动轮播
    const startAutoSlide = () => {
      stopAutoSlide();
      slideInterval = setInterval(() => {
        nextSlide();
      }, 5000);
    };

    // 停止自动轮播
    const stopAutoSlide = () => {
      if (slideInterval) {
        clearInterval(slideInterval);
      }
    };

    // 生命周期钩子
    onMounted(() => {
      checkAuth();
      loadHomeData();
      startAutoSlide(); // 开始自动轮播
    });

    // 在组件卸载时清除定时器
    onUnmounted(() => {
      stopAutoSlide();
    });

    return {
      isLoggedIn,
      username,
      email,
      articles,
      featuredProducts,
      helpPosts,
      isNewsLoading,
      isProductsLoading,
      isHelpLoading,
      formatDate,
      getImageUrl,
      getProductImage,
      formatPrice,
      currentSlide,
      setSlide,
      prevSlide,
      nextSlide,
      startAutoSlide,
      stopAutoSlide
    };
  }
};
</script>

<style scoped>
.bg-highland-gradient {
  background-image: linear-gradient(to right, var(--color-highland-700), var(--color-highland-600));
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 页面背景层次 */
.page-bg {
  background: linear-gradient(180deg, #f7f9f7 0%, #ffffff 100%);
}

/* 服务功能区背景 */
.service-section {
  background-color: #f0f9f0;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.02);
}

/* 区域卡片样式优化 */
.section-card {
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-top: 3px solid transparent;
}

/* 不同区域使用不同的边框颜色 */
.news-card {
  border-top-color: var(--color-highland-600);
}

.product-card {
  border-top-color: var(--color-crop-500);
}

.help-card {
  border-top-color: #f59e0b;
}

.community-card {
  border-top-color: #f97316;
}

.ai-card {
  border-top-color: #3b82f6;
}

/* 卡片悬停效果 */
.section-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.service-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 标题装饰 */
.section-title {
  position: relative;
  padding-left: 1rem;
  border-left: 4px solid var(--color-highland-600);
}

.product-title {
  border-left-color: var(--color-crop-500);
}

.help-title {
  border-left-color: #f59e0b;
}

/* 新闻项目左侧色块 */
.news-item {
  position: relative;
  border-left: 0;
  transition: background-color 0.2s ease;
}

.news-item:hover {
  background-color: #f9fbf9;
}

.product-item:hover {
  background-color: #fcfaf6;
}

.help-item:hover {
  background-color: #f9f9f2;
}

.product-image-container {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
}

/* 轮播样式 */
.carousel-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-slides {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease;
}

.carousel-slide {
  min-width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.carousel-slide::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(33, 77, 50, 0.7); /* 深绿色遮罩 */
}

.carousel-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 20;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-dot.active {
  background-color: #ffffff;
  width: 20px;
  border-radius: 5px;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
}

.carousel-control:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.carousel-prev {
  left: 20px;
}

.carousel-next {
  right: 20px;
}

/* 产品名称样式强化 - 增强名称可见度 */
.product-info-container {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 0.5rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-top: -15px;
  position: relative;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  z-index: 2;
}

.product-title-text {
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.05rem;
  transition: color 0.3s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: block;
  z-index: 3;
}

/* 添加图片上的产品名称覆盖层 */
.product-name-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 6px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-weight: 600;
  text-align: center;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 1;
  transition: all 0.3s ease;
}

.product-item:hover .product-info-container {
  background-color: #e9f5e9;
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.product-item:hover .product-title-text {
  color: var(--color-highland-600);
}

/* 改进热门求助项的样式 */
.help-item {
  position: relative;
  padding-left: 1.5rem;
  padding-right: 1rem;
}

.help-item::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 1.5rem;
  width: 6px;
  height: 6px;
  background-color: #f59e0b;
  border-radius: 50%;
}

.help-item:hover::before {
  background-color: #d97706;
}

.help-item h3 {
  font-weight: 600;
  transition: color 0.2s ease;
}

.help-item:hover h3 {
  color: #4d7c0f;
}

/* 扩展优化 - 添加产品标签 */
.product-image-container {
  position: relative;
}

.product-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(59, 130, 246, 0.9);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  z-index: 10;
}
</style>
