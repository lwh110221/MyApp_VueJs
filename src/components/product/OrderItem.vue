<template>
  <div class="order-item">
    <div class="order-header">
      <div class="order-info">
        <div class="order-number">
          <span class="label">订单号:</span>
          <span class="value">{{ order.order_no }}</span>
        </div>
        <div class="order-date">{{ formatDate(order.created_at) }}</div>
      </div>
      <div class="order-status" :class="statusClass">
        {{ order.status_text || getStatusText(order.status) }}
      </div>
    </div>

    <div class="order-content">
      <!-- 订单商品列表 -->
      <div class="order-products">
        <div v-for="(item, index) in displayItems" :key="index" class="product-item">
          <div class="product-image">
            <img :src="getItemImage(item)" :alt="getItemName(item)" />
          </div>
          <div class="product-info">
            <div class="product-name">{{ getItemName(item) }}</div>
            <div class="product-price">¥{{ (Number(item.price) || 0).toFixed(2) }} × {{ item.quantity }}</div>
          </div>
        </div>

        <!-- 显示更多商品的提示 -->
        <div v-if="hasMoreItems" class="more-items">
          <div class="more-items-text">等{{ order.items.length - MAX_DISPLAY_ITEMS }}件商品</div>
        </div>
      </div>

      <!-- 订单金额和操作 -->
      <div class="order-actions">
        <div class="order-amount">
          <div class="order-total">
            共{{ getTotalQuantity() }}件商品
            <span class="amount">合计: ¥{{ Number(order.total_amount).toFixed(2) }}</span>
          </div>
          <div class="order-shipping">
            (含运费: ¥{{ (0).toFixed(2) }})
          </div>
        </div>

        <div class="action-buttons">
          <router-link :to="`/orders/${order.id}`" class="action-btn detail">
            订单详情
          </router-link>

          <button
            v-if="order.status === 0"
            class="action-btn cancel"
            @click.stop="handleCancelOrder"
          >
            取消订单
          </button>

          <button
            v-if="order.status === 0"
            class="action-btn primary"
            @click.stop="handlePayOrder"
          >
            去支付
          </button>

          <button
            v-if="order.status === 2"
            class="action-btn primary"
            @click.stop="handleConfirmReceived"
          >
            确认收货
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores'

export default {
  name: 'OrderItem',

  props: {
    order: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const router = useRouter()
    const orderStore = useOrderStore()

    // 最大显示商品数量
    const MAX_DISPLAY_ITEMS = 2

    // 需要显示的商品
    const displayItems = computed(() => {
      return props.order.items.slice(0, MAX_DISPLAY_ITEMS)
    })

    // 是否有更多商品
    const hasMoreItems = computed(() => {
      return props.order.items.length > MAX_DISPLAY_ITEMS
    })

    // 计算商品总数量
    const getTotalQuantity = () => {
      return props.order.items.reduce((total, item) => {
        return total + item.quantity
      }, 0)
    }

    // 根据订单状态获取对应的class
    const statusClass = computed(() => {
      const statusMap = {
        0: 'status-pending',
        1: 'status-paid',
        2: 'status-shipped',
        3: 'status-completed',
        4: 'status-cancelled',
        5: 'status-refunded'
      }

      return statusMap[props.order.status] || ''
    })

    // 获取订单状态文本
    const getStatusText = (status) => {
      return orderStore.getStatusText(status)
    }

    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 取消订单
    const handleCancelOrder = async (event) => {
      event.preventDefault()

      if (!confirm('确定要取消该订单吗？取消后无法恢复。')) {
        return
      }

      try {
        await orderStore.cancelOrder(props.order.id)
      } catch (error) {
        console.error('取消订单失败:', error)
        alert('取消订单失败，请稍后再试')
      }
    }

    // 确认收货
    const handleConfirmReceived = async (event) => {
      event.preventDefault()

      if (!confirm('确认已收到商品吗？确认后订单将完成。')) {
        return
      }

      try {
        await orderStore.confirmReceived(props.order.id)
      } catch (error) {
        console.error('确认收货失败:', error)
        alert('确认收货失败，请稍后再试')
      }
    }

    // 去支付
    const handlePayOrder = (event) => {
      event.preventDefault()
      router.push(`/orders/${props.order.id}?action=pay`)
    }

    // 获取商品图片
    const getItemImage = (item) => {
      if (!item) return '';
      return item.product_image || '/images/default-product.png';
    }

    // 获取商品名称
    const getItemName = (item) => {
      if (!item) return '';
      return item.product_title || '未命名商品';
    }

    return {
      MAX_DISPLAY_ITEMS,
      displayItems,
      hasMoreItems,
      statusClass,
      getStatusText,
      formatDate,
      getTotalQuantity,
      handleCancelOrder,
      handleConfirmReceived,
      handlePayOrder,
      getItemImage,
      getItemName
    }
  }
}
</script>

<style scoped>
.order-item {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.order-number {
  font-size: 0.9rem;
}

.order-number .label {
  color: #666;
  margin-right: 5px;
}

.order-number .value {
  font-weight: 500;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.order-status {
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
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

.order-content {
  padding: 20px;
}

.order-products {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.product-item {
  display: flex;
  align-items: center;
  width: calc(50% - 10px);
  min-width: 220px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
  border: 1px solid #f0f0f0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  overflow: hidden;
}

.product-name {
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  color: #666;
  font-size: 0.9rem;
}

.more-items {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.more-items-text {
  font-size: 0.8rem;
  color: #666;
  text-align: center;
}

.order-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #eee;
  padding-top: 15px;
}

.order-total {
  color: #666;
  margin-bottom: 5px;
}

.order-total .amount {
  margin-left: 10px;
  font-weight: 600;
  color: #f44336;
}

.order-shipping {
  font-size: 0.8rem;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s;
}

.action-btn.detail {
  border: 1px solid #ccc;
  background-color: white;
  color: #666;
}

.action-btn.detail:hover {
  background-color: #f5f5f5;
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

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-status {
    margin-top: 10px;
    align-self: flex-start;
  }

  .order-products {
    flex-direction: column;
  }

  .product-item {
    width: 100%;
  }

  .order-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    margin-top: 15px;
    align-self: flex-end;
  }
}
</style>
