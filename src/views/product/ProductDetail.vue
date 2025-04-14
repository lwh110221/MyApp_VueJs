<template>
  <div class="product-detail-page">
    <div class="container">
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>加载中...</span>
        </div>
      </div>

      <!-- 产品未找到 -->
      <div v-else-if="!product" class="product-not-found">
        <div class="not-found-icon">
          <i class="fa-solid fa-circle-exclamation"></i>
        </div>
        <h2 class="not-found-title">产品不存在或已下架</h2>
        <p class="not-found-message">无法找到您请求的产品，可能已被删除或下架</p>
        <button @click="goBack" class="back-button">
          <i class="fa-solid fa-arrow-left"></i> 返回列表
        </button>
      </div>

      <!-- 产品详情 -->
      <div v-else class="product-detail">
        <!-- 面包屑导航 -->
        <div class="breadcrumb">
          <router-link to="/products" class="breadcrumb-item">
            <i class="fa-solid fa-home"></i> 农产品列表
          </router-link>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item active">{{ product.title }}</span>
        </div>

        <div class="product-main">
          <!-- 产品图片区域 -->
          <div class="product-images">
            <div class="main-image">
              <img :src="currentImage" :alt="product.title" />
            </div>

            <div v-if="product.images && product.images.length > 1" class="image-thumbnails">
              <div
                v-for="(image, index) in product.images"
                :key="index"
                class="thumbnail"
                :class="{ active: currentImageIndex === index }"
                @click="setCurrentImage(index)"
              >
                <img :src="getProductImage(product, index)" :alt="`${product.title} - 图片 ${index + 1}`" />
              </div>
            </div>
          </div>

          <!-- 产品信息区域 -->
          <div class="product-info">
            <h1 class="product-name">{{ product.title }}</h1>

            <div class="product-category">
              <span class="category-label">分类:</span>
              <span class="category-tag">{{ product.category_name }}</span>
            </div>

            <div class="product-meta">
              <div class="meta-item">
                <span class="meta-label">产地:</span>
                <span class="meta-value">{{ product.location || '未知产地' }}</span>
              </div>

              <div class="meta-item">
                <span class="meta-label">库存:</span>
                <span class="meta-value">{{ product.stock }} {{ product.unit }}</span>
              </div>

              <div v-if="product.is_bulk" class="meta-item bulk-order">
                <span class="meta-label">批量订购:</span>
                <span class="meta-value">最低起订 {{ product.min_order_quantity }} {{ product.unit }}</span>
              </div>
            </div>

            <div class="product-price">
              <div class="current-price">¥{{ formatPrice(product.price) }}</div>
              <div v-if="product.original_price" class="original-price">
                ¥{{ formatPrice(product.original_price) }}
              </div>
              <div v-if="getDiscountPercentage" class="discount-tag">
                {{ getDiscountPercentage }}% 折扣
              </div>
            </div>

            <div class="product-actions">
              <div class="quantity-control">
                <button
                  class="quantity-btn decrease"
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                >
                  <i class="fa-solid fa-minus"></i>
                </button>
                <input
                  type="number"
                  v-model.number="quantity"
                  min="1"
                  :max="product.stock"
                  @change="handleQuantityChange"
                />
                <button
                  class="quantity-btn increase"
                  @click="increaseQuantity"
                  :disabled="quantity >= product.stock"
                >
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>

              <button
                @click="addToCart"
                class="add-to-cart-btn"
                :disabled="isAddingToCart || isInCart || isProductOwner"
              >
                <i v-if="isAddingToCart" class="fa-solid fa-spinner fa-spin"></i>
                <i v-else-if="isInCart" class="fa-solid fa-check"></i>
                <i v-else class="fa-solid fa-cart-plus"></i>
                {{ isInCart ? '已加入购物车' : '加入购物车' }}
              </button>
            </div>

            <div v-if="isProductOwner" class="owner-notice">
              <i class="fa-solid fa-info-circle"></i> 您是此产品的发布者，不能购买自己的产品
            </div>

            <div class="seller-info">
              <h3 class="seller-title">
                <i class="fa-solid fa-store"></i> 卖家
              </h3>
              <div class="seller-name">
                <router-link :to="`/user/${product.user_id}`" class="seller-link">
                  {{ product.username }}
                </router-link>
              </div>
              <div v-if="product.seller_phone" class="seller-contact">
                联系电话: {{ product.seller_phone }}
              </div>
              <div class="seller-actions" v-if="authStore && authStore.isLoggedIn && !isProductOwner">
                <button @click="redirectToChat" class="contact-seller-btn">
                  <i class="fa-solid fa-comment"></i> 联系卖家
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 产品详情描述 -->
        <div class="product-description">
          <h2 class="section-title">产品详情</h2>
          <div class="description-content">
            {{ product.description }}
          </div>

          <div v-if="productAttributes && Object.keys(productAttributes).length > 0" class="product-attributes">
            <h3 class="attributes-title">产品属性</h3>
            <div class="attributes-list">
              <div v-for="(value, key) in productAttributes" :key="key" class="attribute-item">
                <span class="attribute-key">{{ key }}:</span>
                <span class="attribute-value">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 推荐产品 -->
        <div v-if="relatedProducts.length > 0" class="related-products">
          <h2 class="section-title">相关推荐</h2>
          <div class="related-product-list">
            <div
              v-for="item in relatedProducts"
              :key="item.id"
              class="related-product-item"
            >
              <ProductCard :product="item" :isInCart="isProductInCart(item.id)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore, useCartStore } from '@/stores'
import { useAuthStore } from '@/stores'
import ProductCard from '@/components/product/ProductCard.vue'

export default {
  name: 'ProductDetail',

  components: {
    ProductCard
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const productStore = useProductStore()
    const cartStore = useCartStore()
    const authStore = useAuthStore()

    const loading = ref(true)
    const product = ref(null)
    const quantity = ref(1)
    const isAddingToCart = ref(false)
    const currentImageIndex = ref(0)
    const relatedProducts = ref([])

    // 计算折扣百分比
    const getDiscountPercentage = computed(() => {
      if (!product.value || !product.value.original_price) return null

      const discount = 100 - (product.value.price / product.value.original_price * 100)
      return Math.round(discount)
    })

    // 获取当前显示的图片
    const currentImage = computed(() => {
      if (!product.value || !product.value.images || !product.value.images.length) {
        return '/images/default-product.jpg'
      }

      return getProductImage(product.value, currentImageIndex.value)
    })

    // 获取产品属性
    const productAttributes = computed(() => {
      if (!product.value || !product.value.attributes) return null;

      try {
        // 如果是字符串，尝试解析
        if (typeof product.value.attributes === 'string') {
          return JSON.parse(product.value.attributes);
        }
        // 如果已经是对象，直接返回
        else if (typeof product.value.attributes === 'object') {
          return product.value.attributes;
        }
      } catch (e) {
        console.error('解析产品属性失败:', e);
      }

      return null;
    })

    // 检查产品是否已在购物车中
    const isInCart = computed(() => {
      if (!product.value) return false

      return cartStore.cartItems.some(item => item.product_id === product.value.id)
    })

    // 检查当前用户是否为产品发布者
    const isProductOwner = computed(() => {
      if (!product.value || !authStore.isLoggedIn) return false
      return product.value.user_id === authStore.user.id
    })

    // 获取产品图片
    const getProductImage = (product, index = 0) => {
      return productStore.getProductImage(product, index)
    }

    // 格式化价格
    const formatPrice = (price) => {
      return productStore.formatPrice(price)
    }

    // 设置当前图片
    const setCurrentImage = (index) => {
      currentImageIndex.value = index
    }

    // 增加数量
    const increaseQuantity = () => {
      if (quantity.value < product.value.stock) {
        quantity.value += 1
      }
    }

    // 减少数量
    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value -= 1
      }
    }

    // 处理数量变化
    const handleQuantityChange = () => {
      if (!quantity.value || quantity.value < 1) {
        quantity.value = 1
      } else if (quantity.value > product.value.stock) {
        quantity.value = product.value.stock
      }
    }

    // 添加到购物车
    const addToCart = async () => {
      if (isAddingToCart.value || isInCart.value || isProductOwner.value) return

      isAddingToCart.value = true
      try {
        await cartStore.addToCart(product.value.id, quantity.value)
      } finally {
        isAddingToCart.value = false
      }
    }

    // 检查产品是否在购物车中
    const isProductInCart = (productId) => {
      return cartStore.cartItems.some(item => item.product_id === productId)
    }

    // 返回上一页
    const goBack = () => {
      router.push('/products')
    }

    // 获取产品详情
    const fetchProductDetails = async () => {
      loading.value = true

      try {
        const productId = route.params.id
        const fetchedProduct = await productStore.fetchProductById(productId)

        if (fetchedProduct) {
          product.value = fetchedProduct

          // 获取相关产品（同类别的其他产品）
          if (product.value.category_id) {
            await fetchRelatedProducts(product.value.category_id, product.value.id)
          }
        }
      } catch (error) {
        console.error('获取产品详情失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 获取相关产品
    const fetchRelatedProducts = async (categoryId, currentProductId) => {
      try {
        const params = {
          category_id: categoryId,
          limit: 4
        }

        await productStore.fetchProducts(params)

        // 过滤掉当前产品
        relatedProducts.value = productStore.products.filter(p => p.id !== currentProductId)
      } catch (error) {
        console.error('获取相关产品失败:', error)
      }
    }

    // 组件挂载时
    onMounted(async () => {
      // 获取购物车数据（如果还未获取）
      if (cartStore.cartItems.length === 0) {
        await cartStore.fetchCart()
      }

      // 获取产品详情
      await fetchProductDetails()
    })

    // 重定向到聊天页面
    const redirectToChat = () => {
      if (!product.value) return

      console.log('重定向到聊天页面，卖家ID:', product.value.user_id)

      // 确保使用数值类型的用户ID
      const sellerIdNum = Number(product.value.user_id)

      router.push({
        name: 'ChatWithUser',
        params: { partnerId: sellerIdNum.toString() },
        query: {
          partnerName: product.value.username,
          partnerAvatar: product.value.profile_picture || ''
        }
      })
    }

    return {
      loading,
      product,
      quantity,
      isAddingToCart,
      currentImageIndex,
      currentImage,
      relatedProducts,
      isInCart,
      isProductOwner,
      getDiscountPercentage,
      productAttributes,
      getProductImage,
      formatPrice,
      setCurrentImage,
      increaseQuantity,
      decreaseQuantity,
      handleQuantityChange,
      addToCart,
      isProductInCart,
      goBack,
      redirectToChat,
      authStore
    }
  }
}
</script>

<style scoped>
.product-detail-page {
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
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

.product-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.not-found-icon {
  font-size: 4rem;
  color: #ff6b6b;
  margin-bottom: 20px;
}

.not-found-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.not-found-message {
  color: #666;
  margin-bottom: 30px;
}

.back-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #388e3c;
}

.product-detail {
  margin-bottom: 40px;
}

.breadcrumb {
  background-color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.breadcrumb-item {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.breadcrumb-item:hover {
  color: #4caf50;
}

.breadcrumb-item.active {
  color: #333;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 10px;
  color: #ccc;
}

.product-main {
  display: flex;
  gap: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

.product-images {
  width: 50%;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-thumbnails {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.thumbnail:hover {
  border-color: #ddd;
}

.thumbnail.active {
  border-color: #4caf50;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.product-category {
  margin-bottom: 20px;
}

.category-label {
  color: #666;
  margin-right: 10px;
}

.category-tag {
  background-color: #e8f5e9;
  color: #388e3c;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-label {
  color: #666;
}

.meta-value {
  color: #333;
  font-weight: 500;
}

.bulk-order {
  background-color: #f1f8e9;
  padding: 5px 10px;
  border-radius: 4px;
  border-left: 3px solid #4caf50;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.current-price {
  font-size: 2rem;
  font-weight: 700;
  color: #ff6b6b;
}

.original-price {
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
}

.discount-tag {
  background-color: #ff6b6b;
  color: white;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
}

.product-actions {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border: none;
  cursor: pointer;
  font-size: 1rem;
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
  width: 60px;
  height: 40px;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  text-align: center;
  font-size: 1rem;
}

.quantity-control input:focus {
  outline: none;
}

.add-to-cart-btn {
  flex: 1;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #388e3c;
}

.add-to-cart-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.seller-info {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
}

.seller-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
}

.seller-name {
  font-weight: 500;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.seller-link {
  color: #4caf50;
  text-decoration: none;
  transition: color 0.3s;
}

.seller-link:hover {
  color: #388e3c;
  text-decoration: underline;
}

.seller-contact {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
}

.seller-actions {
  margin-top: 10px;
}

.contact-seller-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
  font-size: 0.9rem;
}

.contact-seller-btn:hover {
  background-color: #388e3c;
}

.product-description {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.description-content {
  line-height: 1.6;
  color: #444;
  white-space: pre-wrap;
  margin-bottom: 20px;
}

.product-attributes {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.attributes-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.attributes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.attribute-item {
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.attribute-key {
  font-weight: 500;
  color: #555;
  margin-right: 8px;
}

.attribute-value {
  color: #333;
}

.related-products {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.related-product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.related-product-item {
  flex: 0 0 calc(25% - 15px);
  margin-bottom: 20px;
}

.owner-notice {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-notice i {
  color: #856404;
}

@media (max-width: 992px) {
  .product-main {
    flex-direction: column;
  }

  .product-images {
    width: 100%;
  }

  .related-product-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .product-detail-page {
    padding: 20px 0;
  }

  .product-main {
    padding: 20px;
  }

  .main-image {
    height: 300px;
  }

  .product-name {
    font-size: 1.5rem;
  }

  .current-price {
    font-size: 1.5rem;
  }

  .related-product-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  /* 添加移动端产品操作区域样式 */
  .product-actions {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 15px;
  }

  .quantity-control {
    width: 100%;
    justify-content: center;
  }

  .add-to-cart-btn {
    width: 100%;
    height: 46px;
  }

  .owner-notice {
    margin-bottom: 20px;
    text-align: center;
    padding: 12px;
  }
}
</style>
