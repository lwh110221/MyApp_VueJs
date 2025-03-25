import API from '../http'
import { ORDER_ENDPOINTS } from '../endpoints'

class OrderService {
  /**
   * 获取订单列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.limit=10] - 每页数量
   * @param {number} [params.status] - 订单状态
   * @returns {Promise<Object>} 带分页的订单列表
   */
  async getOrders(params = {}) {
    try {
      return await API.get(ORDER_ENDPOINTS.GET_ORDERS, params)
    } catch (error) {
      console.error('获取订单列表失败:', error)
      throw error
    }
  }

  /**
   * 获取订单统计
   * @returns {Promise<Object>} 订单统计数据
   */
  async getOrderStats() {
    try {
      return await API.get(ORDER_ENDPOINTS.GET_ORDER_STATS)
    } catch (error) {
      console.error('获取订单统计失败:', error)
      throw error
    }
  }

  /**
   * 获取订单详情
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 订单详情
   */
  async getOrderDetail(orderId) {
    try {
      return await API.get(ORDER_ENDPOINTS.GET_ORDER_DETAIL(orderId))
    } catch (error) {
      console.error(`获取订单(ID:${orderId})详情失败:`, error)
      throw error
    }
  }

  /**
   * 创建订单
   * @param {Object} data - 订单数据
   * @param {string} data.contact_name - 联系人姓名
   * @param {string} data.contact_phone - 联系电话
   * @param {string} data.contact_address - 收货地址
   * @param {Array<number>} data.cart_items - 购物车商品ID数组
   * @param {string} [data.note] - 订单备注
   * @returns {Promise<Object>} 创建的订单信息
   */
  async createOrder(data) {
    try {
      // 将contact_address字段重命名为address字段，以匹配后端接口要求
      const orderData = { ...data };
      if (orderData.contact_address) {
        orderData.address = orderData.contact_address;
        delete orderData.contact_address;
      }

      return await API.post(ORDER_ENDPOINTS.CREATE_ORDER, orderData)
    } catch (error) {
      console.error('创建订单失败:', error)
      throw error
    }
  }

  /**
   * 取消订单
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>}
   */
  async cancelOrder(orderId) {
    try {
      return await API.put(ORDER_ENDPOINTS.CANCEL_ORDER(orderId))
    } catch (error) {
      console.error(`取消订单(ID:${orderId})失败:`, error)
      throw error
    }
  }

  /**
   * 确认收货
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>}
   */
  async confirmReceived(orderId) {
    try {
      return await API.put(ORDER_ENDPOINTS.CONFIRM_ORDER(orderId))
    } catch (error) {
      console.error(`确认收货订单(ID:${orderId})失败:`, error)
      throw error
    }
  }

  /**
   * 支付订单
   * @param {number} orderId - 订单ID
   * @param {Object} data - 支付数据
   * @param {number} data.payment_method - 支付方式：1-微信，2-支付宝，3-银行卡
   * @returns {Promise<Object>}
   */
  async payOrder(orderId, data) {
    try {
      return await API.put(ORDER_ENDPOINTS.PAY_ORDER(orderId), data)
    } catch (error) {
      console.error(`支付订单(ID:${orderId})失败:`, error)
      throw error
    }
  }
}

export default new OrderService()
