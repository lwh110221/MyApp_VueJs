<!-- 新闻详情页面 -->
<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="bg-white rounded-lg shadow-md p-6">
      <!-- 新闻头部信息 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-4">{{ article.title }}</h1>
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span class="bg-blue-50 text-blue-600 px-2 py-1 rounded">
            {{ article.category_name }}
          </span>
          <span class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            {{ formatDate(article.publish_time) }}
          </span>
          <span class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
            {{ article.view_count }}
          </span>
          <span class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            {{ article.author }}
          </span>
        </div>
      </div>

      <!-- 新闻封面图 -->
      <div v-if="article.cover_image" class="mb-8">
        <img
          :src="getImageUrl(article.cover_image)"
          :alt="article.title"
          class="w-full rounded-lg object-cover max-h-[500px]"
        >
      </div>

      <!-- 新闻摘要 -->
      <div v-if="article.summary" class="mb-8 bg-gray-50 rounded-lg p-6">
        <p class="text-gray-700 text-lg leading-relaxed">{{ article.summary }}</p>
      </div>

      <!-- 新闻正文 -->
      <div class="prose prose-lg max-w-none" v-html="article.content"></div>
    </div>

    <!-- 相关新闻推荐 -->
    <div v-if="relatedArticles.length" class="mt-12">
      <h2 class="text-2xl font-bold mb-6">相关推荐</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="related in relatedArticles"
          :key="related.id"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 cursor-pointer overflow-hidden"
          @click="goToDetail(related.id)"
        >
          <template v-if="related.cover_image">
            <img
              :src="getImageUrl(related.cover_image)"
              :alt="related.title"
              class="w-full h-48 object-cover"
            >
          </template>
          <div class="p-4" :class="{ 'py-8': !related.cover_image }">
            <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ related.title }}</h3>
            <div class="flex items-center text-sm text-gray-500 gap-4">
              <span>{{ related.category_name }}</span>
              <span>{{ formatDate(related.publish_time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import newsService from '@/api/services/news.service';

export default {
  name: 'NewsDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const article = ref({});
    const relatedArticles = ref([]);

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

    // 跳转到其他新闻详情
    const goToDetail = (articleId) => {
      router.push(`/news/detail/${articleId}`);
    };

    // 格式化日期
    const formatDate = (date) => {
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
    });

    return {
      article,
      relatedArticles,
      goToDetail,
      formatDate,
      getImageUrl
    };
  }
};
</script>

<style scoped>
.news-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.news-header {
  margin-bottom: 30px;
}

.news-header h1 {
  font-size: 2em;
  margin-bottom: 15px;
}

.meta {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 0.9em;
}

.cover-image {
  margin-bottom: 30px;
}

.cover-image img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 8px;
}

.summary {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 30px;
  font-size: 1.1em;
  line-height: 1.6;
}

.content {
  line-height: 1.8;
  font-size: 1.1em;
}

.related-news {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.related-news h2 {
  margin-bottom: 20px;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.related-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.related-item:hover {
  transform: translateY(-5px);
}

.related-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.related-info {
  padding: 15px;
}

.related-info h3 {
  margin-bottom: 10px;
  font-size: 1.1em;
}

.related-info .meta {
  font-size: 0.8em;
}

.related-info.no-image {
  padding-top: 30px;
  padding-bottom: 30px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .news-header h1 {
    font-size: 1.5em;
  }

  .meta {
    flex-wrap: wrap;
    gap: 10px;
  }

  .related-list {
    grid-template-columns: 1fr;
  }
}
</style>
