import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orderService, messageService } from '../api'

export const useOrderStore = defineStore('order', () => {
  // 订单列表
  const orders = ref([])

  // 分页信息
  const pagination = ref({
    total: 0,
    currentPage: 1,
    totalPages: 0
  })

  // 当前订单详情
  const currentOrder = ref(null)

  // 加载状态
  const loading = ref(false)

  // 获取订单列表
  const fetchOrders = async (params = {}) => {
    loading.value = true

    try {
      // 创建请求参数的副本，以免修改原始对象
      const requestParams = { ...params };

      // 确保status是数字类型或undefined（移除无效值）
      if (requestParams.status !== undefined && requestParams.status !== '') {
        const statusNum = Number(requestParams.status);
        if (isNaN(statusNum) || statusNum < 0 || statusNum > 5) {
          console.warn('无效的订单状态过滤:', requestParams.status);
          delete requestParams.status; // 移除无效的status参数
        }
      }

      // 确保分页参数是数字
      if (requestParams.page) {
        requestParams.page = Number(requestParams.page);
        if (isNaN(requestParams.page) || requestParams.page < 1) {
          requestParams.page = 1;
        }
      }

      if (requestParams.limit) {
        requestParams.limit = Number(requestParams.limit);
        if (isNaN(requestParams.limit) || requestParams.limit < 1) {
          requestParams.limit = 10;
        }
      }

      const response = await orderService.getOrders(requestParams);

      if (response && response.data) {
        orders.value = response.data.orders || [];

        // 更新分页信息
        pagination.value = {
          total: response.data.total || 0,
          currentPage: response.data.page || 1,
          totalPages: response.data.totalPages || 1
        };

        return orders.value;
      } else {
        console.error('获取订单列表返回格式异常:', response);
        orders.value = [];
        return [];
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      messageService.error(error.response?.data?.message || '获取订单列表失败');
      orders.value = [];
      return [];
    } finally {
      loading.value = false;
    }
  }

  // 获取订单统计
  const fetchOrderStats = async () => {
    try {
      const response = await orderService.getOrderStats()
      return response.data
    } catch (error) {
      console.error('获取订单统计失败:', error)
      return {}
    }
  }

  // 获取订单详情
  const fetchOrderDetail = async (orderId) => {
    loading.value = true

    try {
      // 确保orderId是数字
      if (!orderId || isNaN(Number(orderId))) {
        throw new Error(`无效的订单ID: ${orderId}`);
      }

      const response = await orderService.getOrderDetail(Number(orderId));

      if (!response || !response.data) {
        throw new Error('获取订单详情失败: 服务器返回数据格式错误');
      }

      currentOrder.value = response.data;
      return currentOrder.value;
    } catch (error) {
      console.error(`获取订单(ID:${orderId})详情失败:`, error);
      messageService.error(error.response?.data?.message || '获取订单详情失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // 创建订单
  const createOrder = async (orderData) => {
    loading.value = true

    try {
      const response = await orderService.createOrder(orderData)
      messageService.success('订单创建成功')

      // 确保正确返回订单信息
      if (response && response.order && response.success) {
        return response.order
      } else {
        console.error('订单创建成功但返回格式异常:', response)
        messageService.warning('订单创建成功，但返回数据格式异常')
        return null
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      messageService.error(error.response?.data?.message || '创建订单失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  // 取消订单
  const cancelOrder = async (orderId) => {
    loading.value = true

    try {
      await orderService.cancelOrder(orderId)
      messageService.success('订单已取消')

      // 如果是当前订单，更新状态
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value.status = 4
      }

      // 如果订单列表中有该订单，也更新状态
      const orderIndex = orders.value.findIndex(order => order.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = 4
      }

      return true
    } catch (error) {
      console.error('取消订单失败:', error)
      messageService.error(error.response?.data?.message || '取消订单失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 确认收货
  const confirmReceived = async (orderId) => {
    loading.value = true

    try {
      await orderService.confirmReceived(orderId)
      messageService.success('已确认收货')

      // 如果是当前订单，更新状态
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value.status = 3
      }

      // 如果订单列表中有该订单，也更新状态
      const orderIndex = orders.value.findIndex(order => order.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = 3
      }

      return true
    } catch (error) {
      console.error('确认收货失败:', error)
      messageService.error(error.response?.data?.message || '确认收货失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 支付订单
  const payOrder = async (orderId, paymentData) => {
    loading.value = true

    try {
      const response = await orderService.payOrder(orderId, paymentData)
      messageService.success('支付成功')

      // 如果是当前订单，更新状态
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value.status = 1
        currentOrder.value.payment_method = paymentData.payment_method
      }

      // 如果订单列表中有该订单，也更新状态
      const orderIndex = orders.value.findIndex(order => order.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = 1
        orders.value[orderIndex].payment_method = paymentData.payment_method
      }

      return response
    } catch (error) {
      console.error('支付订单失败:', error)
      messageService.error(error.response?.data?.message || '支付失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取订单状态文本
  const getStatusText = (status) => {
    const statusMap = {
      0: '待付款',
      1: '已付款待发货',
      2: '已发货',
      3: '已完成',
      4: '已取消',
      5: '已退款'
    }

    return statusMap[status] || status
  }

  // 获取订单状态颜色
  const getStatusColor = (status) => {
    const colorMap = {
      0: 'orange',
      1: 'blue',
      2: 'purple',
      3: 'green',
      4: 'red',
      5: 'gray'
    }

    return colorMap[status] || 'gray'
  }

  // 格式化订单号
  const formatOrderNo = (orderNo) => {
    if (!orderNo) return '--'
    // 不足10位前面补0
    return orderNo.toString().padStart(10, '0')
  }

  return {
    orders,
    pagination,
    currentOrder,
    loading,
    fetchOrders,
    fetchOrderStats,
    fetchOrderDetail,
    createOrder,
    cancelOrder,
    confirmReceived,
    payOrder,
    getStatusText,
    getStatusColor,
    formatOrderNo
  }
})
