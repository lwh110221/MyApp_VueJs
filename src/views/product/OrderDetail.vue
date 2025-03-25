<template>
  <div class="order-detail-page">
    <div class="container">
      <div class="page-header">
        <div class="back-link" @click="goBack">
          <i class="fa-solid fa-arrow-left"></i>
          返回订单列表
        </div>
        <h1 class="page-title">订单详情</h1>
      </div>

      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>加载中...</span>
        </div>
      </div>

      <!-- 订单不存在 -->
      <div v-else-if="!loading && !order" class="not-found-container">
        <div class="not-found-icon">
          <i class="fa-solid fa-face-frown"></i>
        </div>
        <h2 class="not-found-title">订单不存在</h2>
        <p class="not-found-message">该订单可能已被删除或您没有权限访问</p>
        <router-link to="/orders" class="back-btn">
          <i class="fa-solid fa-list"></i> 返回订单列表
        </router-link>
      </div>

      <!-- 订单详情 -->
      <div v-else-if="!loading && order" class="order-detail">
        <!-- 订单状态和基本信息 -->
        <div class="order-status-card">
          <div class="order-status">
            <div class="status-badge" :class="statusClass">
              {{ getStatusText(order.status) }}
            </div>
            <div class="order-created-time">
              下单时间: {{ formatDate(order.created_at) }}
            </div>
          </div>

          <div class="order-actions">
            <button
              v-if="order.status === 0"
              class="action-btn cancel"
              @click="handleCancelOrder"
            >
              取消订单
            </button>
            <button
              v-if="order.status === 0"
              class="action-btn primary"
              @click="handlePayOrder"
            >
              去支付
            </button>
            <button
              v-if="order.status === 2"
              class="action-btn primary"
              @click="handleConfirmReceived"
            >
              确认收货
            </button>
          </div>
        </div>

        <!-- 订单号和配送信息 -->
        <div class="order-info-card">
          <h3 class="card-title">
            <i class="fa-solid fa-circle-info"></i> 订单信息
          </h3>
          <div class="info-item">
            <div class="info-label">订单编号:</div>
            <div class="info-value">{{ order.order_no }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">支付方式:</div>
            <div class="info-value">{{ getPaymentMethodText(order.payment_method) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">收货人:</div>
            <div class="info-value">{{ order.contact_name }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">联系电话:</div>
            <div class="info-value">{{ order.contact_phone }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">收货地址:</div>
            <div class="info-value">{{ order.address }}</div>
          </div>
          <div v-if="order.note" class="info-item">
            <div class="info-label">订单备注:</div>
            <div class="info-value">{{ order.note }}</div>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="order-items-card">
          <h3 class="card-title">
            <i class="fa-solid fa-box"></i> 商品信息
          </h3>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-image">
                <img :src="item.product_image || '/images/default-product.png'" :alt="item.product_title" />
              </div>
              <div class="item-details">
                <div class="item-name">{{ item.product_title }}</div>
                <div class="item-price">¥{{ Number(item.price).toFixed(2) }} × {{ item.quantity }}</div>
              </div>
              <div class="item-total">
                ¥{{ (Number(item.price) * Number(item.quantity)).toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- 订单合计 -->
          <div class="order-summary">
            <div class="summary-item">
              <div class="summary-label">商品总价:</div>
              <div class="summary-value">¥{{ getItemsTotal().toFixed(2) }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">运费:</div>
              <div class="summary-value">¥{{ (0).toFixed(2) }}</div>
            </div>
            <div class="summary-item total">
              <div class="summary-label">订单总价:</div>
              <div class="summary-value">¥{{ Number(order.total_amount).toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <!-- 物流信息 -->
        <div v-if="order.status !== 0 && order.status !== 4" class="order-tracking-card">
          <h3 class="card-title">
            <i class="fa-solid fa-truck"></i> 物流信息
          </h3>

          <div v-if="order.shipping_time" class="tracking-info">
            <div class="info-item">
              <div class="info-label">发货时间:</div>
              <div class="info-value">{{ formatDate(order.shipping_time) }}</div>
            </div>
          </div>

          <div v-else class="no-tracking">
            <i class="fa-solid fa-circle-info"></i>
            暂无物流信息，商家将尽快为您发货
          </div>
        </div>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <div v-if="showPayModal" class="payment-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>选择支付方式</h3>
          <button class="close-btn" @click="showPayModal = false">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="payment-methods">
            <div
              v-for="method in paymentMethods"
              :key="method.value"
              class="payment-method-item"
              :class="{ active: selectedPaymentMethod === method.value }"
              @click="selectedPaymentMethod = method.value"
            >
              <i :class="method.icon"></i>
              <span>{{ method.label }}</span>
            </div>
          </div>

          <div class="payment-amount">
            <div class="amount-label">支付金额</div>
            <div class="amount-value">¥{{ order ? Number(order.total_amount).toFixed(2) : '0.00' }}</div>
          </div>

          <button class="pay-btn" @click="confirmPayment">
            确认支付
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores'
import { messageService } from '@/api'

export default {
  name: 'OrderDetail',

  setup() {
    const route = useRoute()
    const router = useRouter()
    const orderStore = useOrderStore()

    const loading = ref(true)
    const order = ref(null)
    const showPayModal = ref(false)
    const selectedPaymentMethod = ref('alipay')

    // 支付方式列表
    const paymentMethods = [
      { label: '支付宝', value: 'alipay', icon: 'fa-brands fa-alipay' },
      { label: '微信支付', value: 'wechat', icon: 'fa-brands fa-weixin' },
      { label: '银行卡', value: 'bankcard', icon: 'fa-solid fa-credit-card' }
    ]

    // 状态样式类
    const statusClass = computed(() => {
      if (!order.value) return ''

      const statusMap = {
        0: 'status-pending',
        1: 'status-paid',
        2: 'status-shipped',
        3: 'status-completed',
        4: 'status-cancelled',
        5: 'status-refunded'
      }

      return statusMap[order.value.status] || ''
    })

    // 获取订单详情
    const fetchOrderDetail = async () => {
      loading.value = true

      try {
        const orderId = parseInt(route.params.id);
        if (!orderId || isNaN(orderId)) {
          console.error('无效的订单ID:', route.params.id);
          messageService.error('无效的订单ID');
          router.push('/orders');
          return;
        }

        order.value = await orderStore.fetchOrderDetail(orderId);

        // 如果URL中有action=pay参数，自动打开支付弹窗
        if (route.query.action === 'pay' && order.value && order.value.status === 0) {
          showPayModal.value = true;
        }
      } catch (error) {
        console.error('获取订单详情失败:', error);
        messageService.error(error.response?.data?.message || '获取订单详情失败');
        order.value = null;
      } finally {
        loading.value = false;
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
      return statusMap[status] || '未知状态'
    }

    // 获取支付方式文本
    const getPaymentMethodText = (method) => {
      const methodMap = {
        1: '微信支付',
        2: '支付宝',
        3: '银行卡',
        null: '未选择'
      }

      return methodMap[method] || '其他方式'
    }

    // 计算商品总价
    const getItemsTotal = () => {
      if (!order.value || !order.value.items) return 0

      return order.value.items.reduce((total, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return total + (price * quantity);
      }, 0)
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '无'
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 返回上一页
    const goBack = () => {
      router.push('/orders')
    }

    // 取消订单
    const handleCancelOrder = async () => {
      if (!order.value) return

      if (!confirm('确定要取消该订单吗？取消后无法恢复。')) {
        return
      }

      try {
        await orderStore.cancelOrder(order.value.id)
        await fetchOrderDetail() // 刷新订单详情
      } catch (error) {
        console.error('取消订单失败:', error)
        alert('取消订单失败，请稍后再试')
      }
    }

    // 确认收货
    const handleConfirmReceived = async () => {
      if (!order.value) return

      if (!confirm('确认已收到商品吗？确认后订单将完成。')) {
        return
      }

      try {
        await orderStore.confirmReceived(order.value.id)
        await fetchOrderDetail() // 刷新订单详情
      } catch (error) {
        console.error('确认收货失败:', error)
        alert('确认收货失败，请稍后再试')
      }
    }

    // 去支付
    const handlePayOrder = () => {
      showPayModal.value = true
    }

    // 确认支付
    const confirmPayment = async () => {
      if (!order.value) return

      try {
        // 将字符串支付方式转换为后端需要的数字格式
        let paymentMethodNumber = 2; // 默认支付宝
        if (selectedPaymentMethod.value === 'wechat') {
          paymentMethodNumber = 1;
        } else if (selectedPaymentMethod.value === 'bank') {
          paymentMethodNumber = 3;
        }

        await orderStore.payOrder(order.value.id, {
          payment_method: paymentMethodNumber
        })

        showPayModal.value = false
        await fetchOrderDetail() // 刷新订单详情
      } catch (error) {
        console.error('支付失败:', error)
        alert('支付处理失败，请稍后再试')
      }
    }

    // 组件挂载时
    onMounted(() => {
      fetchOrderDetail()
    })

    return {
      loading,
      order,
      showPayModal,
      selectedPaymentMethod,
      paymentMethods,
      statusClass,
      getStatusText,
      getPaymentMethodText,
      getItemsTotal,
      formatDate,
      goBack,
      handleCancelOrder,
      handleConfirmReceived,
      handlePayOrder,
      confirmPayment
    }
  }
}
</script>

<style scoped>
.order-detail-page {
  padding: 40px 0;
  min-height: calc(100vh - 60px);
  background-color: #f9f9f9;
}

.container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 15px;
}

.page-header {
  margin-bottom: 30px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #666;
  margin-bottom: 10px;
  cursor: pointer;
  padding: 5px 0;
}

.back-link:hover {
  color: #4caf50;
}

.page-title {
  font-size: 1.5rem;
  color: #333;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #666;
}

.loading-spinner i {
  font-size: 2rem;
  color: #4caf50;
}

.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.not-found-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.not-found-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.not-found-message {
  color: #666;
  margin-bottom: 30px;
}

.back-btn {
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  padding: 10px 25px;
  border-radius: 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #388e3c;
}

.order-detail > div {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.order-status-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 8px;
}

.status-pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-paid, .status-processing {
  background-color: #e3f2fd;
  color: #2196f3;
}

.status-shipped {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-completed {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-cancelled {
  background-color: #fafafa;
  color: #9e9e9e;
}

.order-created-time {
  color: #666;
  font-size: 0.9rem;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.action-btn.primary {
  background-color: #4caf50;
  color: white;
}

.action-btn.primary:hover {
  background-color: #388e3c;
}

.action-btn.cancel {
  background-color: white;
  color: #f44336;
  border: 1px solid #f44336;
}

.action-btn.cancel:hover {
  background-color: #fff5f5;
}

.card-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.info-label {
  width: 100px;
  color: #666;
}

.info-value {
  flex: 1;
  color: #333;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  border-radius: 4px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-weight: 500;
  margin-bottom: 5px;
}

.item-price {
  color: #666;
  font-size: 0.9rem;
}

.item-total {
  font-weight: 600;
  color: #f44336;
}

.order-summary {
  border-top: 1px dashed #f0f0f0;
  padding-top: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-item.total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.summary-label {
  color: #666;
}

.summary-value {
  font-weight: 600;
}

.summary-item.total .summary-value {
  color: #f44336;
  font-size: 1.2rem;
}

.no-tracking {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.payment-method-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-method-item i {
  font-size: 1.5rem;
  color: #666;
}

.payment-method-item.active {
  border-color: #4caf50;
  background-color: #f1f8e9;
}

.payment-method-item.active i {
  color: #4caf50;
}

.payment-amount {
  text-align: center;
  margin-bottom: 30px;
}

.amount-label {
  color: #666;
  margin-bottom: 5px;
}

.amount-value {
  font-size: 2rem;
  font-weight: 600;
  color: #f44336;
}

.pay-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pay-btn:hover {
  background-color: #388e3c;
}

@media (max-width: 768px) {
  .order-detail-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .order-status-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-actions {
    margin-top: 15px;
    align-self: flex-end;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }
}
</style>
