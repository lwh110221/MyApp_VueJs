<template>
  <div class="product-list-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">农产品交易平台</h1>
        <p class="page-subtitle">新鲜、健康、安全的农产品直供平台</p>
      </div>

      <div class="main-content">
        <!-- 左侧筛选栏 -->
        <div class="filter-sidebar">
          <ProductFilter
            :initialCategory="$route.query.category_id"
            :initialKeyword="$route.query.keyword"
            @filter-change="handleFilterChange"
          />
        </div>

        <!-- 右侧产品列表 -->
        <div class="product-list-container">
          <!-- 搜索结果提示 -->
          <div v-if="searchActive" class="search-results-info">
            {{ searchInfo }}
            <button @click="clearSearch" class="clear-search-btn">
              <i class="fa-solid fa-times"></i> 清除搜索
            </button>
          </div>

          <!-- 加载中状态 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>加载中...</span>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else-if="products.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <i class="fa-solid fa-basket-shopping"></i>
            </div>
            <h3 class="empty-state-title">未找到符合条件的产品</h3>
            <p class="empty-state-message">
              尝试使用其他过滤条件或清除搜索
            </p>
            <button @click="resetFilters" class="reset-btn">
              <i class="fa-solid fa-rotate"></i> 清除所有过滤
            </button>
          </div>

          <!-- 产品列表 -->
          <div v-else class="product-list">
            <div
              v-for="product in products"
              :key="product.id"
              class="product-card-wrapper"
            >
              <ProductCard
                :product="product"
                :isInCart="isProductInCart(product.id)"
              />
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="products.length > 0" class="pagination">
            <button
              class="pagination-button prev"
              :disabled="currentPage <= 1"
              @click="changePage(currentPage - 1)"
            >
              <i class="fa-solid fa-chevron-left"></i> 上一页
            </button>

            <div class="pagination-info">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </div>

            <button
              class="pagination-button next"
              :disabled="currentPage >= totalPages"
              @click="changePage(currentPage + 1)"
            >
              下一页 <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore, useCartStore } from '@/stores'
import ProductFilter from '@/components/product/ProductFilter.vue'
import ProductCard from '@/components/product/ProductCard.vue'

export default {
  name: 'ProductList',

  components: {
    ProductFilter,
    ProductCard
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const productStore = useProductStore()
    const cartStore = useCartStore()

    const loading = ref(false)
    const products = ref([])
    const currentPage = ref(1)
    const pageSize = ref(12)
    const totalItems = ref(0)

    // 分页计算
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / pageSize.value)
    })

    // 当前搜索/过滤状态
    const filters = reactive({
      category_id: null,
      keyword: '',
      min_price: null,
      max_price: null,
      sort_by: 'created_at',
      sort_order: 'desc'
    })

    // 是否在搜索/过滤中
    const searchActive = computed(() => {
      return filters.category_id || filters.keyword || filters.min_price || filters.max_price ||
        (filters.sort_by !== 'created_at' || filters.sort_order !== 'desc')
    })

    // 搜索信息文本
    const searchInfo = computed(() => {
      let info = '当前搜索条件: '
      const conditions = []

      if (filters.keyword) {
        conditions.push(`关键词"${filters.keyword}"`)
      }

      if (filters.category_id) {
        const category = productStore.categories.find(c => c.id == filters.category_id)
        if (category) {
          conditions.push(`分类"${category.name}"`)
        }
      }

      if (filters.min_price && filters.max_price) {
        conditions.push(`价格 ${filters.min_price} - ${filters.max_price} 元`)
      } else if (filters.min_price) {
        conditions.push(`价格 >= ${filters.min_price} 元`)
      } else if (filters.max_price) {
        conditions.push(`价格 <= ${filters.max_price} 元`)
      }

      if (conditions.length === 0) {
        return '当前显示所有产品'
      }

      return info + conditions.join('，')
    })

    // 检查产品是否在购物车中
    const isProductInCart = (productId) => {
      return cartStore.cartItems.some(item => item.product_id === productId)
    }

    // 获取产品列表
    const fetchProducts = async (resetPage = false) => {
      if (resetPage) {
        currentPage.value = 1
      }

      loading.value = true

      try {
        const params = {
          ...filters,
          page: currentPage.value,
          limit: pageSize.value
        }

        // 清理空值
        Object.keys(params).forEach(key => {
          if (params[key] === null || params[key] === '') {
            delete params[key]
          }
        })

        await productStore.fetchProducts(params)
        products.value = productStore.products
        totalItems.value = productStore.pagination.total
      } catch (error) {
        console.error('获取产品列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 处理过滤器变化
    const handleFilterChange = (newFilters) => {
      Object.assign(filters, newFilters)

      // 更新URL查询参数
      updateRouteQuery()

      // 重置到第一页并获取数据
      fetchProducts(true)
    }

    // 更新路由查询参数
    const updateRouteQuery = () => {
      // 准备查询参数
      const query = {}
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== '') {
          query[key] = filters[key]
        }
      })

      // 添加分页参数
      query.page = currentPage.value

      // 更新路由
      router.replace({ query })
    }

    // 切换页码
    const changePage = (page) => {
      currentPage.value = page
      updateRouteQuery()
      fetchProducts()

      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // 清除搜索
    const clearSearch = () => {
      Object.assign(filters, {
        category_id: null,
        keyword: '',
        min_price: null,
        max_price: null,
        sort_by: 'created_at',
        sort_order: 'desc'
      })

      updateRouteQuery()
      fetchProducts(true)
    }

    // 重置过滤器
    const resetFilters = () => {
      clearSearch()
      productStore.resetFilters()
    }

    // 从URL参数加载过滤条件
    const loadFiltersFromQuery = () => {
      const query = route.query

      if (query.page) {
        currentPage.value = parseInt(query.page) || 1
      }

      Object.keys(filters).forEach(key => {
        if (query[key] !== undefined) {
          filters[key] = query[key]
        }
      })
    }

    // 监听路由变化
    watch(() => route.query, () => {
      loadFiltersFromQuery()
      fetchProducts()
    })

    // 组件挂载时
    onMounted(async () => {
      // 获取购物车数据（如果还未获取）
      if (cartStore.cartItems.length === 0) {
        await cartStore.fetchCart()
      }

      // 获取分类数据
      if (productStore.categories.length === 0) {
        await productStore.fetchCategories()
      }

      // 加载URL过滤条件并获取产品
      loadFiltersFromQuery()
      fetchProducts()
    })

    return {
      loading,
      products,
      currentPage,
      totalPages,
      searchActive,
      searchInfo,
      isProductInCart,
      handleFilterChange,
      changePage,
      clearSearch,
      resetFilters
    }
  }
}
</script>

<style scoped>
.product-list-page {
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
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
}

.main-content {
  display: flex;
  gap: 30px;
}

.filter-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.product-list-container {
  flex: 1;
}

.search-results-info {
  background-color: #f0f9ff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #555;
}

.clear-search-btn {
  background-color: transparent;
  border: none;
  color: #1890ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.clear-search-btn:hover {
  text-decoration: underline;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
}

.empty-state-icon {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.empty-state-message {
  color: #666;
  margin-bottom: 20px;
}

.reset-btn {
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

.reset-btn:hover {
  background-color: #388e3c;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card-wrapper {
  height: 100%;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
}

.pagination-button {
  padding: 10px 16px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.pagination-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  color: #666;
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }

  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .product-list-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .pagination {
    flex-direction: column;
    gap: 15px;
  }

  .pagination-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
