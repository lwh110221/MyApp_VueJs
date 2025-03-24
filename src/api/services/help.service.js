import http from '../http';
import { HELP_ENDPOINTS } from '../endpoints';

/**
 * 专家求助服务
 */
class HelpService {
  /**
   * 获取求助分类列表
   * @returns {Promise<Array>} 分类列表
   */
  async getCategoryList() {
    try {
      const response = await http.get(HELP_ENDPOINTS.GET_CATEGORIES);
      return response;
    } catch (error) {
      console.error('获取求助分类列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取求助帖子列表
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   * @param {number} params.category_id 分类ID
   * @param {number} params.status 帖子状态
   * @param {string} params.keyword 搜索关键词
   * @returns {Promise<Object>} 分页帖子列表
   */
  async getPostList(params = {}) {
    try {
      const response = await http.get(HELP_ENDPOINTS.GET_POSTS, params);
      return response;
    } catch (error) {
      console.error('获取求助帖子列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取求助帖子详情
   * @param {number} postId 帖子ID
   * @returns {Promise<Object>} 帖子详情
   */
  async getPostDetail(postId) {
    try {
      if (!postId) {
        throw new Error('缺少帖子ID');
      }
      const response = await http.get(HELP_ENDPOINTS.GET_POST_DETAIL(postId));
      return response;
    } catch (error) {
      console.error('获取求助帖子详情失败:', error);
      throw error;
    }
  }

  /**
   * 创建求助帖子
   * @param {Object} postData 帖子数据
   * @param {string} postData.title 标题
   * @param {string} postData.content 内容
   * @param {number} postData.category_id 分类ID
   * @param {Array} postData.images 图片URL数组
   * @returns {Promise<Object>} 创建结果
   */
  async createPost(postData) {
    try {
      console.log('准备创建求助帖子:', postData);
      const response = await http.post(HELP_ENDPOINTS.CREATE_POST, postData);
      return response;
    } catch (error) {
      console.error('创建求助帖子失败:', error);
      throw error;
    }
  }

  /**
   * 更新帖子状态
   * @param {number} postId 帖子ID
   * @param {number} status 状态值
   * @returns {Promise<Object>} 更新结果
   */
  async updatePostStatus(postId, status) {
    try {
      if (!postId) {
        throw new Error('缺少帖子ID');
      }
      const response = await http.put(HELP_ENDPOINTS.UPDATE_POST_STATUS(postId), { status });
      return response;
    } catch (error) {
      console.error('更新帖子状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取回答列表
   * @param {number} postId 帖子ID
   * @returns {Promise<Array>} 回答列表
   */
  async getAnswerList(postId) {
    try {
      if (!postId) {
        throw new Error('缺少帖子ID');
      }
      const response = await http.get(HELP_ENDPOINTS.GET_ANSWERS(postId));
      return response;
    } catch (error) {
      console.error('获取回答列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建回答
   * @param {number} postId 帖子ID
   * @param {Object} answerData 回答数据
   * @param {string} answerData.content 回答内容
   * @param {Array} answerData.images 图片URL数组
   * @returns {Promise<Object>} 创建结果
   */
  async createAnswer(postId, answerData) {
    try {
      if (!postId) {
        throw new Error('缺少帖子ID');
      }
      const response = await http.post(HELP_ENDPOINTS.CREATE_ANSWER(postId), answerData);
      return response;
    } catch (error) {
      console.error('创建回答失败:', error);
      throw error;
    }
  }

  /**
   * 采纳回答
   * @param {number} postId 帖子ID
   * @param {number} answerId 回答ID
   * @returns {Promise<Object>} 采纳结果
   */
  async acceptAnswer(postId, answerId) {
    try {
      if (!postId || !answerId) {
        throw new Error('缺少帖子ID或回答ID');
      }
      const response = await http.put(HELP_ENDPOINTS.ACCEPT_ANSWER(postId, answerId));
      return response;
    } catch (error) {
      console.error('采纳回答失败:', error);
      throw error;
    }
  }

  /**
   * 删除回答
   * @param {number} postId 帖子ID
   * @param {number} answerId 回答ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteAnswer(postId, answerId) {
    try {
      if (!postId || !answerId) {
        throw new Error('缺少帖子ID或回答ID');
      }
      const response = await http.delete(HELP_ENDPOINTS.DELETE_ANSWER(postId, answerId));
      return response;
    } catch (error) {
      console.error('删除回答失败:', error);
      throw error;
    }
  }

  /**
   * 上传图片
   * @param {FormData} formData 表单数据
   * @returns {Promise<Object>} 上传结果
   */
  async uploadImages(formData) {
    try {
      return await http.post(HELP_ENDPOINTS.UPLOAD_IMAGES, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  }
}

export default new HelpService();
