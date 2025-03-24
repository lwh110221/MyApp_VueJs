import { defineStore } from 'pinia'
import { helpService, messageService } from '../api'

export const useHelpStore = defineStore('help', {
  state: () => ({
    // 求助分类列表
    categories: [],

    // 求助帖子列表
    posts: [],

    // 当前查看的帖子
    currentPost: null,

    // 当前查看的帖子的回答列表
    answers: [],

    // 分页信息
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },

    // 搜索参数
    searchParams: {
      category_id: null,
      status: null,
      keyword: ''
    },

    // 加载状态
    loading: {
      categories: false,
      posts: false,
      postDetail: false,
      answers: false,
      createPost: false,
      createAnswer: false,
      acceptAnswer: false
    },

    // 错误信息
    error: null
  }),

  getters: {
    // 判断是否有分类
    hasCategories: (state) => state.categories && state.categories.length > 0,

    // 判断是否有帖子
    hasPosts: (state) => state.posts && state.posts.length > 0,

    // 判断是否有回答
    hasAnswers: (state) => state.answers && state.answers.length > 0,

    // 获取已采纳的回答
    acceptedAnswer: (state) => {
      if (!Array.isArray(state.answers)) return null;
      return state.answers.find(answer => answer.is_accepted === 1);
    },

    // 获取未采纳的回答
    unacceptedAnswers: (state) => {
      if (!Array.isArray(state.answers)) return [];
      return state.answers.filter(answer => answer.is_accepted === 0);
    },

    // 获取帖子状态描述
    getPostStatusText: () => (status) => {
      const statusMap = {
        0: '待解决',
        1: '已解决',
        2: '已关闭'
      };
      return statusMap[status] || '未知状态';
    },

    // 获取帖子状态类名
    getPostStatusClass: () => (status) => {
      const classMap = {
        0: 'bg-yellow-100 text-yellow-800',
        1: 'bg-green-100 text-green-800',
        2: 'bg-gray-100 text-gray-800'
      };
      return classMap[status] || 'bg-gray-100 text-gray-800';
    }
  },

  actions: {
    /**
     * 获取求助分类列表
     */
    async fetchCategories() {
      if (this.loading.categories) return;

      try {
        this.loading.categories = true;
        this.error = null;

        const response = await helpService.getCategoryList();
        this.categories = response?.data || [];

        return this.categories;
      } catch (error) {
        console.error('获取分类失败:', error);
        this.error = '获取分类列表失败';
        messageService.error('获取分类列表失败');
      } finally {
        this.loading.categories = false;
      }
    },

    /**
     * 获取求助帖子列表
     * @param {Object} params 查询参数
     */
    async fetchPosts(params = {}) {
      if (this.loading.posts) return;

      try {
        this.loading.posts = true;
        this.error = null;

        // 合并搜索参数
        const queryParams = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.searchParams,
          ...params
        };

        // 如果有参数更新分页信息
        if (params.page) {
          this.pagination.page = params.page;
        }

        const response = await helpService.getPostList(queryParams);

        if (response?.data) {
          this.posts = response.data.items || [];
          this.pagination = {
            page: parseInt(queryParams.page) || 1,
            limit: parseInt(queryParams.limit) || 10,
            total: response.data.total || 0,
            totalPages: Math.ceil((response.data.total || 0) / (queryParams.limit || 10))
          };
        }

        return this.posts;
      } catch (error) {
        console.error('获取帖子列表失败:', error);
        this.error = '获取帖子列表失败';
        messageService.error('获取帖子列表失败');
      } finally {
        this.loading.posts = false;
      }
    },

    /**
     * 获取帖子详情
     * @param {number} postId 帖子ID
     */
    async fetchPostDetail(postId) {
      if (this.loading.postDetail || !postId) return;

      try {
        this.loading.postDetail = true;
        this.error = null;

        const response = await helpService.getPostDetail(postId);
        this.currentPost = response?.data || null;

        return this.currentPost;
      } catch (error) {
        console.error('获取帖子详情失败:', error);
        this.error = '获取帖子详情失败';
        messageService.error('获取帖子详情失败');
      } finally {
        this.loading.postDetail = false;
      }
    },

    /**
     * 获取回答列表
     * @param {number} postId 帖子ID
     */
    async fetchAnswers(postId) {
      if (this.loading.answers || !postId) return;

      try {
        this.loading.answers = true;
        this.error = null;

        const response = await helpService.getAnswerList(postId);
        this.answers = response?.data || [];

        return this.answers;
      } catch (error) {
        console.error('获取回答列表失败:', error);
        this.error = '获取回答列表失败';
        messageService.error('获取回答列表失败');
      } finally {
        this.loading.answers = false;
      }
    },

    /**
     * 创建求助帖子
     * @param {Object} postData 帖子数据
     */
    async createPost(postData) {
      if (this.loading.createPost) return;

      try {
        this.loading.createPost = true;
        this.error = null;

        const response = await helpService.createPost(postData);
        messageService.success('发布求助成功');

        return response?.data;
      } catch (error) {
        console.error('创建帖子失败:', error);
        this.error = '创建求助帖子失败';
        messageService.error('创建求助帖子失败');
        throw error;
      } finally {
        this.loading.createPost = false;
      }
    },

    /**
     * 更新帖子状态
     * @param {number} postId 帖子ID
     * @param {number} status 状态值
     */
    async updatePostStatus(postId, status) {
      if (!postId) return;

      try {
        const response = await helpService.updatePostStatus(postId, status);

        // 更新当前帖子状态
        if (this.currentPost && this.currentPost.id === postId) {
          this.currentPost.status = status;
        }

        messageService.success('更新状态成功');
        return response?.data;
      } catch (error) {
        console.error('更新帖子状态失败:', error);
        messageService.error('更新帖子状态失败');
        throw error;
      }
    },

    /**
     * 创建回答
     * @param {number} postId 帖子ID
     * @param {Object} answerData 回答数据
     */
    async createAnswer(postId, answerData) {
      if (this.loading.createAnswer || !postId) return;

      try {
        this.loading.createAnswer = true;
        this.error = null;

        const response = await helpService.createAnswer(postId, answerData);
        messageService.success('回答成功');

        // 刷新回答列表
        await this.fetchAnswers(postId);

        return response?.data;
      } catch (error) {
        console.error('创建回答失败:', error);
        this.error = '创建回答失败';
        messageService.error('创建回答失败');
        throw error;
      } finally {
        this.loading.createAnswer = false;
      }
    },

    /**
     * 采纳回答
     * @param {number} postId 帖子ID
     * @param {number} answerId 回答ID
     */
    async acceptAnswer(postId, answerId) {
      if (this.loading.acceptAnswer || !postId || !answerId) return;

      try {
        this.loading.acceptAnswer = true;
        this.error = null;

        const response = await helpService.acceptAnswer(postId, answerId);
        messageService.success('采纳回答成功');

        // 更新帖子状态和回答列表
        if (this.currentPost && this.currentPost.id === postId) {
          this.currentPost.status = 1; // 更新为已解决
        }

        await this.fetchAnswers(postId);

        return response?.data;
      } catch (error) {
        console.error('采纳回答失败:', error);
        this.error = '采纳回答失败';
        messageService.error('采纳回答失败');
        throw error;
      } finally {
        this.loading.acceptAnswer = false;
      }
    },

    /**
     * 删除回答
     * @param {number} postId 帖子ID
     * @param {number} answerId 回答ID
     */
    async deleteAnswer(postId, answerId) {
      if (!postId || !answerId) return;

      try {
        const response = await helpService.deleteAnswer(postId, answerId);
        messageService.success('删除回答成功');

        // 刷新回答列表
        await this.fetchAnswers(postId);

        return response?.data;
      } catch (error) {
        console.error('删除回答失败:', error);
        messageService.error('删除回答失败');
        throw error;
      }
    },

    /**
     * 上传图片
     * @param {FormData} formData 表单数据
     */
    async uploadImages(formData) {
      try {
        const response = await helpService.uploadImages(formData);
        return response?.data;
      } catch (error) {
        console.error('上传图片失败:', error);
        messageService.error('上传图片失败');
        throw error;
      }
    },

    /**
     * 设置搜索参数
     * @param {Object} params 搜索参数
     */
    setSearchParams(params) {
      this.searchParams = {
        ...this.searchParams,
        ...params
      };

      // 重置分页到第一页
      this.pagination.page = 1;
    },

    /**
     * 重置搜索参数
     */
    resetSearchParams() {
      this.searchParams = {
        category_id: null,
        status: null,
        keyword: ''
      };

      // 重置分页
      this.pagination.page = 1;
    },

    /**
     * 重置所有状态
     */
    resetState() {
      this.categories = [];
      this.posts = [];
      this.currentPost = null;
      this.answers = [];
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      };
      this.resetSearchParams();
      this.error = null;
    }
  }
});
