import API from '../http'
import { CART_ENDPOINTS } from '../endpoints'

class CartService {
  /**
   * 获取购物车
   * @returns {Promise<Object>} 购物车信息
   */
  async getCart() {
    try {
      return await API.get(CART_ENDPOINTS.GET_CART)
    } catch (error) {
      console.error('获取购物车失败:', error)
      throw error
    }
  }

  /**
   * 添加商品到购物车
   * @param {Object} data - 添加数据
   * @param {number} data.product_id - 产品ID
   * @param {number} data.quantity - 数量
   * @returns {Promise<Object>}
   */
  async addToCart(data) {
    try {
      return await API.post(CART_ENDPOINTS.ADD_TO_CART, data)
    } catch (error) {
      console.error('添加商品到购物车失败:', error)
      throw error
    }
  }

  /**
   * 更新购物车商品数量
   * @param {number} itemId - 购物车项ID
   * @param {Object} data - 更新数据
   * @param {number} data.quantity - 数量
   * @returns {Promise<Object>}
   */
  async updateCartItem(itemId, data) {
    try {
      return await API.put(CART_ENDPOINTS.UPDATE_CART_ITEM(itemId), data)
    } catch (error) {
      console.error(`更新购物车商品(ID:${itemId})失败:`, error)
      throw error
    }
  }

  /**
   * 从购物车删除商品
   * @param {number} itemId - 购物车项ID
   * @returns {Promise<Object>}
   */
  async removeFromCart(itemId) {
    try {
      return await API.delete(CART_ENDPOINTS.DELETE_CART_ITEM(itemId))
    } catch (error) {
      console.error(`从购物车删除商品(ID:${itemId})失败:`, error)
      throw error
    }
  }

  /**
   * 更新购物车商品选中状态
   * @param {Object} data - 更新数据
   * @param {boolean} data.selected - 是否选中
   * @param {Array<number>} [data.items] - 购物车项ID数组，不提供则更新全部
   * @returns {Promise<Object>}
   */
  async updateSelected(data) {
    try {
      return await API.put(CART_ENDPOINTS.UPDATE_SELECTED, data)
    } catch (error) {
      console.error('更新购物车商品选中状态失败:', error)
      throw error
    }
  }

  /**
   * 清空购物车
   * @returns {Promise<Object>}
   */
  async clearCart() {
    try {
      return await API.delete(CART_ENDPOINTS.CLEAR_CART)
    } catch (error) {
      console.error('清空购物车失败:', error)
      throw error
    }
  }
}

export default new CartService()
