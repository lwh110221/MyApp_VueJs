import API from '../http'
import { PRODUCT_ENDPOINTS } from '../endpoints'

class ProductService {
  /**
   * 获取产品分类列表
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories() {
    try {
      return await API.get(PRODUCT_ENDPOINTS.GET_CATEGORIES)
    } catch (error) {
      console.error('获取产品分类失败:', error)
      throw error
    }
  }

  /**
   * 获取产品列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.limit=10] - 每页数量
   * @param {number} [params.category_id] - 分类ID
   * @param {string} [params.keyword] - 搜索关键词
   * @param {number} [params.min_price] - 最低价格
   * @param {number} [params.max_price] - 最高价格
   * @param {string} [params.sort_by] - 排序字段
   * @param {string} [params.sort_order] - 排序方式(asc/desc)
   * @returns {Promise<Object>} 带分页的产品列表
   */
  async getProducts(params = {}) {
    try {
      return await API.get(PRODUCT_ENDPOINTS.GET_PRODUCTS, params)
    } catch (error) {
      console.error('获取产品列表失败:', error)
      throw error
    }
  }

  /**
   * 获取产品详情
   * @param {number} id - 产品ID
   * @returns {Promise<Object>} 产品详情
   */
  async getProductById(id) {
    try {
      return await API.get(PRODUCT_ENDPOINTS.GET_PRODUCT_DETAIL(id))
    } catch (error) {
      console.error(`获取产品(ID:${id})详情失败:`, error)
      throw error
    }
  }

  /**
   * 获取推荐产品
   * @param {number} [limit=6] - 获取数量
   * @returns {Promise<Array>} 推荐产品列表
   */
  async getFeaturedProducts(limit = 6) {
    try {
      return await API.get(PRODUCT_ENDPOINTS.GET_FEATURED_PRODUCTS, { limit })
    } catch (error) {
      console.error('获取推荐产品失败:', error)
      throw error
    }
  }

  /**
   * 获取用户发布的产品
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.limit=10] - 每页数量
   * @returns {Promise<Object>} 带分页的产品列表
   */
  async getUserProducts(params = {}) {
    try {
      return await API.get(PRODUCT_ENDPOINTS.GET_USER_PRODUCTS, params)
    } catch (error) {
      console.error('获取用户产品列表失败:', error)
      throw error
    }
  }

  /**
   * 发布新产品
   * @param {FormData} formData - 产品表单数据，包含图片
   * @returns {Promise<Object>} 创建的产品信息
   */
  async createProduct(formData) {
    try {
      return await API.upload(PRODUCT_ENDPOINTS.CREATE_PRODUCT, formData)
    } catch (error) {
      console.error('发布产品失败:', error)
      throw error
    }
  }

  /**
   * 更新产品
   * @param {number} id - 产品ID
   * @param {FormData} formData - 产品表单数据
   * @returns {Promise<Object>} 更新后的产品信息
   */
  async updateProduct(id, formData) {
    try {
      return await API.put(PRODUCT_ENDPOINTS.UPDATE_PRODUCT(id), formData)
    } catch (error) {
      console.error(`更新产品(ID:${id})失败:`, error)
      throw error
    }
  }

  /**
   * 删除产品
   * @param {number} id - 产品ID
   * @returns {Promise}
   */
  async deleteProduct(id) {
    try {
      return await API.delete(PRODUCT_ENDPOINTS.DELETE_PRODUCT(id))
    } catch (error) {
      console.error(`删除产品(ID:${id})失败:`, error)
      throw error
    }
  }
}

export default new ProductService()
