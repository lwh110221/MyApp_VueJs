<template>
  <div class="cart-item" :class="{ 'selected': isSelected }">
    <div class="cart-item__select">
      <input
        type="checkbox"
        :checked="isSelected"
        @change="toggleSelect"
      />
    </div>
    <div class="cart-item__image" @click="goToProduct">
      <img :src="productImage" :alt="item.name" />
    </div>
    <div class="cart-item__info">
      <h3 class="cart-item__title" @click="goToProduct">{{ item.name }}</h3>
      <div class="cart-item__meta">
        <span class="cart-item__seller">卖家: {{ item.seller_name }}</span>
        <span class="cart-item__origin">产地: {{ item.origin }}</span>
      </div>
      <div class="cart-item__price">
        <span class="current-price">¥{{ formatPrice(item.price) }}</span>
        <span v-if="item.original_price" class="original-price">
          ¥{{ formatPrice(item.original_price) }}
        </span>
      </div>
    </div>
    <div class="cart-item__actions">
      <div class="quantity-control">
        <button
          class="quantity-btn decrease"
          @click="updateQuantity(-1)"
          :disabled="item.quantity <= 1 || loading"
        >
          <i class="fa-solid fa-minus"></i>
        </button>
        <input
          type="number"
          v-model.number="quantity"
          min="1"
          :max="item.stock"
          @change="handleQuantityChange"
          :disabled="loading"
        />
        <button
          class="quantity-btn increase"
          @click="updateQuantity(1)"
          :disabled="item.quantity >= item.stock || loading"
        >
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
      <div class="subtotal">
        <span>小计: </span>
        <span class="subtotal-price">¥{{ calculateSubtotal }}</span>
      </div>
      <button
        class="remove-btn"
        @click="removeItem"
        :disabled="loading"
      >
        <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
        <i v-else class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore, useCartStore } from '@/stores'

export default {
  name: 'CartItem',

  props: {
    item: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },

  emits: ['select-change'],

  setup(props, { emit }) {
    const router = useRouter()
    const cartStore = useCartStore()
    const productStore = useProductStore()
    const loading = ref(false)
    const quantity = ref(props.item.quantity)

    // 监听item的quantity变化
    watch(() => props.item.quantity, (newVal) => {
      quantity.value = newVal
    })

    // 获取产品图片
    const productImage = computed(() => {
      return productStore.getProductImage(props.item)
    })

    // 格式化价格
    const formatPrice = (price) => {
      return productStore.formatPrice(price)
    }

    // 计算小计金额
    const calculateSubtotal = computed(() => {
      return productStore.formatPrice(props.item.price * props.item.quantity)
    })

    // 跳转到产品详情页
    const goToProduct = () => {
      router.push(`/products/${props.item.product_id}`)
    }

    // 切换选中状态
    const toggleSelect = () => {
      emit('select-change', props.item.id)
    }

    // 更新数量
    const updateQuantity = async (delta) => {
      const newQuantity = props.item.quantity + delta
      if (newQuantity < 1 || newQuantity > props.item.stock) return

      loading.value = true
      try {
        await cartStore.updateCartItemQuantity(props.item.id, newQuantity)
      } finally {
        loading.value = false
      }
    }

    // 处理数量手动输入
    const handleQuantityChange = async () => {
      if (!quantity.value || quantity.value < 1) {
        quantity.value = 1
      } else if (quantity.value > props.item.stock) {
        quantity.value = props.item.stock
      }

      if (quantity.value !== props.item.quantity) {
        loading.value = true
        try {
          await cartStore.updateCartItemQuantity(props.item.id, quantity.value)
        } finally {
          loading.value = false
        }
      }
    }

    // 从购物车移除
    const removeItem = async () => {
      if (loading.value) return

      loading.value = true
      try {
        await cartStore.removeFromCart(props.item.id)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      quantity,
      productImage,
      formatPrice,
      calculateSubtotal,
      goToProduct,
      toggleSelect,
      updateQuantity,
      handleQuantityChange,
      removeItem
    }
  }
}
</script>

<style scoped>
.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  transition: background-color 0.3s;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item.selected {
  background-color: #f9fff9;
}

.cart-item__select {
  margin-right: 15px;
}

.cart-item__select input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4caf50;
}

.cart-item__image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 15px;
  cursor: pointer;
}

.cart-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item__info {
  flex: 1;
  min-width: 0;
}

.cart-item__title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item__title:hover {
  color: #4caf50;
}

.cart-item__meta {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  color: #666;
}

.cart-item__price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff6b6b;
}

.original-price {
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
}

.cart-item__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
  min-width: 150px;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
  transition: all 0.3s;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
  color: #333;
}

.quantity-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.quantity-control input {
  width: 40px;
  height: 36px;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  text-align: center;
  font-size: 0.95rem;
}

.quantity-control input:focus {
  outline: none;
}

.subtotal {
  font-weight: 500;
  color: #333;
}

.subtotal-price {
  font-size: 1.1rem;
  color: #ff6b6b;
  font-weight: 700;
}

.remove-btn {
  background-color: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover:not(:disabled) {
  color: #ff6b6b;
}

.remove-btn:disabled {
  cursor: not-allowed;
  color: #ddd;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .cart-item__image {
    width: 100%;
    height: auto;
    max-height: 200px;
    margin-right: 0;
  }

  .cart-item__actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .subtotal {
    order: -1;
  }
}
</style>
