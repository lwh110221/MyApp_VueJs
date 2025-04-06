<!-- 新闻详情页面 -->
<template>
  <div class="news-detail relative">
    <!-- 阅读进度条 -->
    <div class="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div class="h-full bg-orange-500 transition-all duration-200" :style="{ width: readProgress + '%' }"></div>
    </div>

    <!-- 调整移动端内边距 -->
    <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-5xl">
      <!-- 面包屑导航 - 移动端隐藏 -->
      <nav class="hidden sm:flex mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <router-link to="/" class="hover:text-orange-600 transition-colors">
              <i class="fas fa-home w-4 h-4 mr-2"></i>
              首页
            </router-link>
          </li>
          <li>
            <div class="flex items-center">
              <i class="fas fa-chevron-right w-6 h-6 text-gray-400"></i>
              <router-link to="/news" class="hover:text-orange-600 transition-colors">新闻资讯</router-link>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <i class="fas fa-chevron-right w-6 h-6 text-gray-400"></i>
              <span class="text-gray-400">{{ article.category_name }}</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- 移动端返回按钮 -->
      <div class="sm:hidden mb-4">
        <button @click="goBack" class="flex items-center text-gray-600 hover:text-orange-600 transition-colors">
          <i class="fas fa-arrow-left mr-2"></i>
          <span>返回</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <!-- 主要内容区域 -->
        <div class="lg:col-span-9">
          <div class="bg-white rounded-lg shadow-md">
            <!-- 文章头部 -->
            <div class="p-3 sm:p-6 border-b border-gray-100">
              <h1 class="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 leading-tight">{{ article.title }}</h1>
              <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <span class="bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                  {{ article.category_name }}
                </span>
                <span class="flex items-center gap-1">
                  <i class="far fa-clock"></i>
                  {{ formatDate(article.publish_time) }}
                </span>
                <span class="flex items-center gap-1">
                  <i class="far fa-eye"></i>
                  {{ article.view_count }}
                </span>
                <span class="flex items-center gap-1">
                  来源：{{ article.author }}
                </span>
              </div>
            </div>

            <!-- 文章内容 -->
            <div class="p-3 sm:p-6">
              <!-- 摘要 -->
              <div v-if="article.summary" class="mb-6 sm:mb-8">
                <div class="bg-orange-50 border-l-4 border-orange-500 p-3 sm:p-4 rounded-r-lg">
                  <p class="text-gray-700 text-base sm:text-lg leading-relaxed">{{ article.summary }}</p>
                </div>
              </div>

              <!-- 正文 -->
              <article class="prose prose-sm sm:prose-base lg:prose-lg max-w-none" v-html="article.content"></article>

              <!-- 分享区域 -->
              <div class="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">分享到：</div>
                  <div class="flex gap-3 sm:gap-4">
                    <button v-for="platform in sharePlatforms"
                            :key="platform.name"
                            class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-orange-50 hover:text-orange-500 transition-colors flex items-center justify-center"
                            @click="shareArticle(platform.type)">
                      <i :class="platform.icon"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧边栏 - 移动端隐藏 -->
        <div class="hidden lg:block lg:col-span-3">
          <div class="sticky top-24">
            <!-- 相关推荐 -->
            <div class="bg-white rounded-lg shadow-md p-4">
              <h3 class="text-lg font-bold mb-4 flex items-center">
                <i class="fas fa-thumbs-up text-orange-500 mr-2"></i>
                相关推荐
              </h3>
              <div class="space-y-4">
                <div v-for="related in relatedArticles.slice(0, 5)"
                     :key="related.id"
                     class="group cursor-pointer hover:bg-orange-50 rounded-lg p-2 -mx-2 transition-colors"
                     @click="goToDetail(related.id)">
                  <h4 class="text-sm font-medium line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {{ related.title }}
                  </h4>
                  <div class="mt-1 flex items-center text-xs text-gray-500">
                    <span>{{ formatDate(related.publish_time, true) }}</span>
                    <span class="mx-2">·</span>
                    <span>{{ related.view_count }} 阅读</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <button
      v-show="showBackToTop"
      @click="scrollToTop"
      class="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 bg-white shadow-lg rounded-full p-2 sm:p-3 text-gray-600 hover:text-orange-600 transition-colors z-50">
      <i class="fas fa-arrow-up text-sm sm:text-base"></i>
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import newsService from '@/api/services/news.service';

export default {
  name: 'NewsDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const article = ref({});
    const relatedArticles = ref([]);
    const readProgress = ref(0);
    const showBackToTop = ref(false);

    // 分享平台配置
    const sharePlatforms = [
      {
        name: '微博',
        type: 'weibo',
        icon: 'fab fa-weibo'
      },
      {
        name: 'QQ',
        type: 'qq',
        icon: 'fab fa-qq'
      }
    ];

    // 返回上一页
    const goBack = () => {
      router.back();
    };

    // 处理图片路径
    const getImageUrl = (path) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${path}`;
    };

    // 获取新闻详情
    const fetchArticleDetail = async () => {
      try {
        const articleId = route.params.id;
        const response = await newsService.getArticleDetail(articleId);
        article.value = response.data;
      } catch (error) {
        console.error('获取新闻详情失败:', error);
      }
    };

    // 获取相关新闻
    const fetchRelatedArticles = async () => {
      try {
        const articleId = route.params.id;
        const response = await newsService.getRelatedArticles(articleId);
        relatedArticles.value = response.data;
      } catch (error) {
        console.error('获取相关新闻失败:', error);
      }
    };

    // 监听滚动更新阅读进度
    const handleScroll = () => {
      // 更新阅读进度
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      readProgress.value = (scrollTop / documentHeight) * 100;

      // 显示/隐藏返回顶部按钮
      showBackToTop.value = scrollTop > 300;
    };

    // 返回顶部
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // 分享文章
    const shareArticle = (platform) => {
      const url = window.location.href;
      const title = article.value.title;

      switch (platform) {
        case 'wechat':
          // 实现微信分享逻辑
          break;
        case 'weibo':
          window.open(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`);
          break;
        case 'qq':
          window.open(`http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`);
          break;
        case 'link':
          navigator.clipboard.writeText(url).then(() => {
            // 显示复制成功提示
            alert('链接已复制到剪贴板');
          });
          break;
      }
    };

    // 跳转到其他新闻详情
    const goToDetail = (articleId) => {
      if (articleId === route.params.id) return;
      router.push(`/news/detail/${articleId}`);
      // 重新获取数据
      fetchArticleDetail();
      fetchRelatedArticles();
      // 滚动到顶部
      scrollToTop();
    };

    // 格式化日期
    const formatDate = (date, simple = false) => {
      if (simple) {
        return new Date(date).toLocaleDateString('zh-CN', {
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      fetchArticleDetail();
      fetchRelatedArticles();
      window.addEventListener('scroll', handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      article,
      relatedArticles,
      readProgress,
      showBackToTop,
      sharePlatforms,
      goToDetail,
      formatDate,
      getImageUrl,
      scrollToTop,
      shareArticle,
      goBack
    };
  }
};
</script>

<style>
/* 文章内容样式优化 */
.prose {
  color: #374151;
}

/* 移动端文章样式优化 */
@media (max-width: 640px) {
  .prose {
    font-size: 0.9375rem;
  }

  .prose h2 {
    font-size: 1.25em;
    margin-top: 2em;
    margin-bottom: 0.8em;
  }

  .prose h3 {
    font-size: 1.125em;
    margin-top: 1.6em;
    margin-bottom: 0.6em;
  }

  .prose p {
    margin-top: 1em;
    margin-bottom: 1em;
    line-height: 1.75;
  }

  .prose img {
    margin: 1.5em auto;
  }

  .prose blockquote {
    padding: 0.75em 1em;
    margin: 1em 0;
  }
}

/* 其他样式保持不变 */
.prose h2 {
  color: #1f2937;
  font-weight: 600;
  margin-top: 2.5em;
  margin-bottom: 1em;
  font-size: 1.5em;
  line-height: 1.3333333;
}

.prose h3 {
  color: #374151;
  font-weight: 600;
  margin-top: 2em;
  margin-bottom: 0.8em;
  font-size: 1.25em;
  line-height: 1.6;
}

.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  line-height: 1.8;
}

.prose img {
  margin: 2em auto;
  border-radius: 0.5rem;
  max-width: 100%;
  height: auto;
}

.prose a {
  color: #f97316;
  text-decoration: none;
  font-weight: 500;
}

.prose a:hover {
  text-decoration: underline;
}

.prose blockquote {
  font-style: normal;
  color: #4b5563;
  border-left-color: #f97316;
  background-color: #fff7ed;
}

.prose code {
  color: #f97316;
  background-color: #fff7ed;
  padding: 0.2em 0.4em;
  border-radius: 0.25em;
  font-size: 0.875em;
}

.prose pre {
  background-color: #1f2937;
  border-radius: 0.5rem;
  padding: 1em;
  overflow-x: auto;
}

.prose pre code {
  color: #e5e7eb;
  background-color: transparent;
  padding: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条美化 */
.prose::-webkit-scrollbar {
  width: 6px;
}

.prose::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.prose::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.prose::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
