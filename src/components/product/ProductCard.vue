<template>
  <div class="product-card">
    <div class="product-card__image" @click="goToDetail">
      <img :src="productImage" :alt="product.name" />
      <div v-if="product.discount" class="product-card__discount">
        {{ product.discount }}% 折扣
      </div>
    </div>
    <div class="product-card__content">
      <h3 class="product-card__title" @click="goToDetail">{{ product.name }}</h3>
      <div class="product-card__category">
        <span class="category-tag">{{ product.category_name }}</span>
      </div>
      <div class="product-card__description">
        {{ truncateText(product.description, 50) }}
      </div>
      <div class="product-card__price">
        <div class="current-price">¥{{ formatPrice(product.price) }}</div>
        <div v-if="product.original_price" class="original-price">
          ¥{{ formatPrice(product.original_price) }}
        </div>
      </div>
      <div class="product-card__footer">
        <div class="product-card__seller">
          <span>{{ product.seller_name }}</span>
        </div>
        <div class="product-card__actions">
          <button
            class="add-to-cart-btn"
            @click.stop="addToCart"
            :disabled="loading || isInCart"
          >
            <i class="fa-solid" :class="isInCart ? 'fa-check' : 'fa-cart-plus'"></i>
            {{ isInCart ? '已加入' : '加入购物车' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore, useCartStore } from '@/stores'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    },
    isInCart: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const router = useRouter()
    const productStore = useProductStore()
    const cartStore = useCartStore()
    const loading = ref(false)

    // 获取产品图片
    const productImage = computed(() => {
      // 确保使用我们增强的getter方法处理可能的各种图片格式
      return productStore.getProductImage(props.product)
    })

    // 格式化价格
    const formatPrice = (price) => {
      return productStore.formatPrice(price)
    }

    // 截断文本
    const truncateText = (text, maxLength) => {
      if (!text) return ''
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text
    }

    // 跳转到详情页
    const goToDetail = () => {
      router.push(`/products/${props.product.id}`)
    }

    // 添加到购物车
    const addToCart = async () => {
      if (loading.value || props.isInCart) return

      loading.value = true
      try {
        await cartStore.addToCart(props.product.id, 1)
      } finally {
        loading.value = false
      }
    }

    return {
      loading,
      productImage,
      formatPrice,
      truncateText,
      goToDetail,
      addToCart
    }
  }
}
</script>

<style scoped>
.product-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.product-card__image {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.product-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-card__image img {
  transform: scale(1.05);
}

.product-card__discount {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff6b6b;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
}

.product-card__content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  cursor: pointer;
  color: #333;
}

.product-card__title:hover {
  color: #4caf50;
}

.product-card__category {
  margin-bottom: 8px;
}

.category-tag {
  background-color: #e8f5e9;
  color: #388e3c;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.product-card__description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
  flex-grow: 1;
}

.product-card__price {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.current-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff6b6b;
  margin-right: 10px;
}

.original-price {
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
}

.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card__seller {
  font-size: 0.8rem;
  color: #777;
}

.add-to-cart-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #388e3c;
}

.add-to-cart-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}
</style>
