import http from '../http';

/**
 * 社区服务
 */
export default {
  /**
   * 获取帖子列表
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   * @param {string} params.sort 排序方式(latest, popular, hot)
   * @param {string} params.keyword 搜索关键词
   * @param {string} params.tag 标签名称
   */
  getPostList(params = {}) {
    return http.get('/community/posts', params);
  },

  /**
   * 获取帖子详情
   * @param {number} postId 帖子ID
   */
  getPostDetail(postId) {
    return http.get(`/community/posts/${postId}`);
  },

  /**
   * 创建帖子
   * @param {Object} postData 帖子数据
   * @param {string} postData.title 标题
   * @param {string} postData.content 内容
   * @param {Array} postData.images 图片URL数组
   * @param {Array} postData.tags 标签数组
   */
  createPost(postData) {
    console.log('准备发送创建帖子请求', {
      data: postData
    });
    return http.post('/community/posts', postData);
  },

  /**
   * 更新帖子
   * @param {number} postId 帖子ID
   * @param {Object} postData 帖子数据
   */
  updatePost(postId, postData) {
    console.log('准备发送更新帖子请求', {
      postId: Number(postId),
      data: postData
    });
    return http.put(`/community/posts/${Number(postId)}`, postData);
  },

  /**
   * 删除帖子
   * @param {number} postId 帖子ID
   */
  deletePost(postId) {
    return http.delete(`/community/posts/${postId}`);
  },

  /**
   * 上传图片
   * @param {FormData} formData 包含images字段的FormData
   */
  uploadImages(formData) {
    return http.post('/community/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 搜索帖子
   * @param {Object} params 查询参数
   * @param {string} params.keyword 关键词
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   * @param {string} params.sort 排序方式
   */
  searchPosts(params = {}) {
    return http.get('/community/posts/search', params);
  },

  /**
   * 获取热门标签
   * @param {number} limit 获取数量
   */
  getHotTags(limit = 10) {
    return http.get('/community/tags/hot', { limit });
  },

  /**
   * 通过标签获取帖子
   * @param {string} tagName 标签名
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   */
  getPostsByTag(tagName, params = {}) {
    return http.get(`/community/tags/${tagName}/posts`, params);
  },

  /**
   * 获取评论列表
   * @param {number} postId 帖子ID
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.limit 每页数量
   */
  getCommentList(postId, params = {}) {
    return http.get(`/community/posts/${Number(postId)}/comments`, params);
  },

  /**
   * 创建评论
   * @param {number} postId 帖子ID
   * @param {Object} commentData 评论数据
   * @param {string} commentData.content 评论内容
   * @param {Array} commentData.images 图片URL数组
   * @param {number} commentData.parent_id 回复的评论ID
   */
  createComment(postId, commentData) {
    console.log('准备发送评论请求', {
      postId: Number(postId),
      data: commentData
    });
    return http.post(`/community/posts/${Number(postId)}/comments`, commentData);
  },

  /**
   * 删除评论
   * @param {number} commentId 评论ID
   */
  deleteComment(commentId) {
    return http.delete(`/community/comments/${commentId}`);
  },

  /**
   * 点赞/取消点赞帖子
   * @param {number} postId 帖子ID
   * @param {string} action 操作类型(like, unlike)
   */
  togglePostLike(postId, action) {
    return http.post(`/community/posts/${postId}/like`, { action });
  },

  /**
   * 点赞/取消点赞评论
   * @param {number} commentId 评论ID
   * @param {string} action 操作类型(like, unlike)
   */
  toggleCommentLike(commentId, action) {
    return http.post(`/community/comments/${commentId}/like`, { action });
  },

  /**
   * 检查用户是否已点赞
   * @param {number} targetId 目标ID
   * @param {number} targetType 目标类型(1:帖子, 2:评论)
   */
  checkUserLike(targetId, targetType) {
    const tId = Number(targetId);
    const tType = Number(targetType);
    return http.get(`/community/likes/check?targetId=${tId}&targetType=${tType}`);
  }
};
