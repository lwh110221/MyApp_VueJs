<template>
  <div class="checkout-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <i class="fa-solid fa-credit-card"></i> 订单结算
        </h1>
      </div>

      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>加载中...</span>
        </div>
      </div>

      <!-- 购物车为空 -->
      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">
          <i class="fa-solid fa-cart-arrow-down"></i>
        </div>
        <h2 class="empty-cart-title">您的购物车为空，无法结算</h2>
        <p class="empty-cart-message">请先将商品添加到购物车</p>
        <router-link to="/products" class="shop-now-btn">
          <i class="fa-solid fa-shopping-basket"></i> 去购物
        </router-link>
      </div>

      <!-- 结算表单 -->
      <div v-else class="checkout-container">
        <CheckoutForm @submit="handleOrderCreated" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores'
import CheckoutForm from '@/components/product/CheckoutForm.vue'

export default {
  name: 'Checkout',

  components: {
    CheckoutForm
  },

  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const loading = ref(true)

    // 购物车中已选中的商品
    const cartItems = computed(() => cartStore.selectedCartItems)

    // 处理订单创建成功
    const handleOrderCreated = (orderData) => {
      // 跳转到订单详情页，带上支付动作
      router.push(`/orders/${orderData.id}?action=pay`)
    }

    // 组件挂载时获取购物车数据
    onMounted(async () => {
      loading.value = true

      try {
        // 获取购物车数据
        await cartStore.fetchCart()

        // 如果没有选中任何商品，跳回购物车页面
        if (cartStore.selectedItems.length === 0) {
          router.push('/cart')
        }
      } finally {
        loading.value = false
      }
    })

    return {
      loading,
      cartItems,
      handleOrderCreated
    }
  }
}
</script>

<style scoped>
.checkout-page {
  padding: 40px 0;
  min-height: calc(100vh - 60px);
  background-color: #f9f9f9;
}

.container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 15px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
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

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.empty-cart-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-cart-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.empty-cart-message {
  color: #666;
  margin-bottom: 30px;
}

.shop-now-btn {
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

.shop-now-btn:hover {
  background-color: #388e3c;
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 1.3rem;
  }
}
</style>
