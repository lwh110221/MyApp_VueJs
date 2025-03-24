import http from '../http';

/**
 * 新闻服务
 */
export default {
  /**
   * 获取新闻分类列表
   */
  getCategoryList() {
    return http.get('/news/categories');
  },

  /**
   * 获取新闻列表
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   * @param {number} params.category_id 分类ID
   * @param {string} params.keyword 搜索关键词
   */
  getArticleList(params = {}) {
    return http.get('/news/articles', { params });
  },

  /**
   * 获取新闻详情
   * @param {number} articleId 新闻ID
   */
  getArticleDetail(articleId) {
    return http.get(`/news/articles/${articleId}`);
  },

  /**
   * 获取热门新闻
   * @param {number} limit 获取数量
   */
  getFeaturedArticles(limit = 5) {
    return http.get('/news/articles/featured', { params: { limit } });
  },

  /**
   * 获取相关新闻推荐
   * @param {number} articleId 新闻ID
   * @param {number} limit 获取数量
   */
  getRelatedArticles(articleId, limit = 5) {
    return http.get(`/news/articles/${articleId}/related`, { params: { limit } });
  }
};
