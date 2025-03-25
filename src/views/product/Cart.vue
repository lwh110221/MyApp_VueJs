<template>
  <div class="cart-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <i class="fa-solid fa-shopping-cart"></i> 我的购物车
        </h1>
      </div>

      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>加载中...</span>
        </div>
      </div>

      <!-- 空购物车 -->
      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">
          <i class="fa-solid fa-cart-arrow-down"></i>
        </div>
        <h2 class="empty-cart-title">购物车还是空的</h2>
        <p class="empty-cart-message">快去挑选您喜欢的农产品吧</p>
        <router-link to="/products" class="shop-now-btn">
          <i class="fa-solid fa-shopping-basket"></i> 去购物
        </router-link>
      </div>

      <!-- 购物车内容 -->
      <div v-else class="cart-content">
        <div class="cart-header">
          <div class="select-all">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              id="select-all"
            />
            <label for="select-all">全选</label>
          </div>
          <div class="header-info">商品信息</div>
          <div class="header-actions">
            <button @click="clearCart" class="clear-cart-btn">
              <i class="fa-solid fa-trash"></i> 清空购物车
            </button>
          </div>
        </div>

        <div class="cart-list">
          <CartItem
            v-for="item in cartItems"
            :key="item.id"
            :item="item"
            :isSelected="isItemSelected(item.id)"
            @select-change="toggleSelectItem"
          />
        </div>

        <div class="cart-footer">
          <div class="cart-summary">
            <div class="summary-item">
              <span>已选商品:</span>
              <span>{{ selectedItems.length }} 件</span>
            </div>
            <div class="summary-item">
              <span>总金额:</span>
              <span class="total-price">¥{{ cartTotal }}</span>
            </div>
          </div>

          <div class="cart-actions">
            <router-link to="/products" class="continue-shopping-btn">
              <i class="fa-solid fa-arrow-left"></i> 继续购物
            </router-link>
            <button
              @click="goToCheckout"
              class="checkout-btn"
              :disabled="selectedItems.length === 0"
            >
              <i class="fa-solid fa-check"></i> 结算 ({{ selectedItems.length }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores'
import CartItem from '@/components/product/CartItem.vue'

export default {
  name: 'Cart',

  components: {
    CartItem
  },

  setup() {
    const router = useRouter()
    const cartStore = useCartStore()
    const loading = ref(true)

    // 购物车商品
    const cartItems = computed(() => cartStore.cartItems)

    // 已选中商品
    const selectedItems = computed(() => cartStore.selectedItems)

    // 是否全选
    const isAllSelected = computed(() => cartStore.isAllSelected)

    // 购物车总金额
    const cartTotal = computed(() => cartStore.cartTotal)

    // 切换全选/全不选
    const toggleSelectAll = async () => {
      await cartStore.toggleSelectAll()
    }

    // 商品是否被选中
    const isItemSelected = (itemId) => {
      return selectedItems.value.includes(itemId)
    }

    // 切换单个商品选中状态
    const toggleSelectItem = async (itemId) => {
      await cartStore.toggleSelectItem(itemId)
    }

    // 清空购物车
    const clearCart = async () => {
      if (confirm('确定要清空购物车吗？')) {
        loading.value = true
        await cartStore.clearCart()
        loading.value = false
      }
    }

    // 去结算
    const goToCheckout = () => {
      if (selectedItems.value.length === 0) {
        alert('请至少选择一件商品')
        return
      }

      // 直接跳转到结算页面，因为选择状态已经在每次变更时同步到了服务器
      router.push('/checkout')
    }

    // 组件挂载时获取购物车数据
    onMounted(async () => {
      loading.value = true
      await cartStore.fetchCart()
      loading.value = false
    })

    return {
      loading,
      cartItems,
      selectedItems,
      isAllSelected,
      cartTotal,
      toggleSelectAll,
      isItemSelected,
      toggleSelectItem,
      clearCart,
      goToCheckout
    }
  }
}
</script>

<style scoped>
.cart-page {
  padding: 40px 0;
  min-height: calc(100vh - 60px);
  background-color: #f9f9f9;
}

.container {
  width: 100%;
  max-width: 1200px;
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

.cart-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cart-header {
  padding: 15px 20px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-all input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4caf50;
}

.select-all label {
  cursor: pointer;
}

.header-info {
  font-weight: 500;
}

.clear-cart-btn {
  background-color: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.clear-cart-btn:hover {
  color: #ff6b6b;
}

.cart-list {
  max-height: 500px;
  overflow-y: auto;
}

.cart-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.total-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
}

.cart-actions {
  display: flex;
  gap: 15px;
}

.continue-shopping-btn,
.checkout-btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.continue-shopping-btn {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
  text-decoration: none;
}

.continue-shopping-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

.checkout-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  cursor: pointer;
}

.checkout-btn:hover:not(:disabled) {
  background-color: #ff5252;
}

.checkout-btn:disabled {
  background-color: #ffd6d6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-page {
    padding: 20px 0;
  }

  .cart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-info,
  .header-actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .cart-footer {
    flex-direction: column;
    gap: 20px;
  }

  .cart-summary {
    width: 100%;
  }

  .cart-actions {
    width: 100%;
  }

  .continue-shopping-btn,
  .checkout-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
