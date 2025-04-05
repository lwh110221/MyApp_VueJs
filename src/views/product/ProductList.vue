<template>
  <div class="product-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">农产品交易市场</h1>
      <p class="page-subtitle">直连农户，品质保障</p>
    </div>

    <!-- 移动端操作栏 -->
    <div class="mobile-action-bar" v-if="isMobileView">
      <button class="create-product-btn" v-if="isUserFarmer" @click="goToCreateProduct">
        <i class="fa-solid fa-plus"></i> 发布农产品
      </button>
      <div class="mobile-search-box">
        <input
          type="text"
          v-model="mobileSearchKeyword"
          @keyup.enter="applyMobileSearch"
          placeholder="搜索农产品"
          class="mobile-search-input"
        />
        <button @click="applyMobileSearch" class="mobile-search-btn">
          <i class="fa-solid fa-search"></i>
        </button>
      </div>
    </div>

    <div class="product-container">
      <!-- 过滤侧边栏 -->
      <div class="product-sidebar" :class="{ 'mobile-sidebar': isMobileView }">
        <ProductFilter
          :initialCategory="initialFilters.category_id"
          :initialKeyword="initialFilters.keyword"
          @filter-change="handleFilterChange"
        />
      </div>

      <!-- 产品列表容器 -->
      <div class="product-list-container">
        <!-- 桌面版操作栏 -->
        <div class="action-bar" v-if="!isMobileView">
          <button class="create-product-btn" v-if="isUserFarmer" @click="goToCreateProduct">
            <i class="fa-solid fa-plus"></i> 发布农产品
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="productStore.loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载农产品...</p>
        </div>

        <!-- 搜索结果提示 -->
        <div v-else-if="hasSearchFilters && productStore.products.length > 0" class="search-result-info">
          <p>
            找到 {{ productStore.totalProducts }} 个符合条件的农产品
            <button @click="clearSearch" class="clear-search-btn">
              <i class="fa-solid fa-xmark"></i> 清除筛选
            </button>
          </p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="productStore.products.length === 0" class="empty-state">
          <i class="fa-solid fa-seedling empty-icon"></i>
          <h3>暂无农产品</h3>
          <p>{{ emptyStateMessage }}</p>
          <button v-if="hasSearchFilters" @click="clearSearch" class="clear-search-btn">
            <i class="fa-solid fa-xmark"></i> 清除筛选
          </button>
        </div>

        <!-- 产品列表 -->
        <div v-if="!productStore.loading && productStore.products.length > 0" class="product-list" :class="{ 'mobile-grid': isMobileView }">
          <ProductCard
            v-for="product in productStore.products"
            :key="product.id"
            :product="product"
            :isInCart="isProductInCart(product.id)"
            :class="{ 'mobile-card': isMobileView }"
          />
        </div>

        <!-- 分页 -->
        <div
          v-if="productStore.products.length > 0 && productStore.totalPages > 1"
          class="pagination"
        >
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <div class="page-numbers">
            <button
              v-for="page in displayedPages"
              :key="page"
              class="page-number"
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="pagination-btn"
            :disabled="currentPage === productStore.totalPages"
            @click="changePage(currentPage + 1)"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore, useCartStore } from '@/stores'
import { useIdentityStore } from '@/stores'
import ProductFilter from '@/components/product/ProductFilter.vue'
import ProductCard from '@/components/product/ProductCard.vue'

export default {
  name: 'ProductList',
  components: {
    ProductFilter,
    ProductCard
  },

  setup() {
    const router = useRouter()
    const route = useRoute()
    const productStore = useProductStore()
    const cartStore = useCartStore()
    const identityStore = useIdentityStore()

    // 响应式状态
    const currentPage = ref(1)
    const initialFilters = reactive({
      category_id: null,
      keyword: '',
      min_price: null,
      max_price: null,
      sort_by: 'created_at',
      sort_order: 'desc'
    })
    const mobileSearchKeyword = ref('')
    const isMobileView = ref(window.innerWidth < 768)

    // 计算属性
    const isUserFarmer = computed(() => {
      return identityStore.hasIdentity('FARMER')
    })

    const hasSearchFilters = computed(() => {
      return (
        initialFilters.category_id ||
        initialFilters.keyword ||
        initialFilters.min_price ||
        initialFilters.max_price ||
        (initialFilters.sort_by !== 'created_at' || initialFilters.sort_order !== 'desc')
      )
    })

    const emptyStateMessage = computed(() => {
      if (hasSearchFilters.value) {
        return '没有找到符合条件的农产品，请尝试其他筛选条件'
      }
      return '目前市场上暂无农产品，请稍后再来'
    })

    // 计算要显示的页码
    const displayedPages = computed(() => {
      const total = productStore.totalPages
      const current = currentPage.value

      if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1)
      }

      if (current <= 3) {
        return [1, 2, 3, 4, 5]
      }

      if (current >= total - 2) {
        return [total - 4, total - 3, total - 2, total - 1, total]
      }

      return [current - 2, current - 1, current, current + 1, current + 2]
    })

    // 判断产品是否在购物车中
    const isProductInCart = (productId) => {
      return cartStore.cartItems.some(item => item.product_id === productId)
    }

    // 处理窗口大小变化
    const handleResize = () => {
      isMobileView.value = window.innerWidth < 768
    }

    // 应用移动端搜索
    const applyMobileSearch = () => {
      if (mobileSearchKeyword.value.trim()) {
        initialFilters.keyword = mobileSearchKeyword.value.trim()
        fetchProducts()
      }
    }

    // 更新路由查询参数
    const updateRouteQuery = () => {
      const query = {}

      if (initialFilters.category_id) {
        query.category_id = initialFilters.category_id
      }

      if (initialFilters.keyword) {
        query.keyword = initialFilters.keyword
      }

      if (initialFilters.min_price) {
        query.min_price = initialFilters.min_price
      }

      if (initialFilters.max_price) {
        query.max_price = initialFilters.max_price
      }

      if (initialFilters.sort_by !== 'created_at' || initialFilters.sort_order !== 'desc') {
        query.sort_by = initialFilters.sort_by
        query.sort_order = initialFilters.sort_order
      }

      if (currentPage.value > 1) {
        query.page = currentPage.value
      }

      router.replace({ query })
    }

    // 获取产品列表
    const fetchProducts = () => {
      const params = {
        page: currentPage.value,
        ...initialFilters
      }

      // 清理空值参数
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === '') {
          delete params[key]
        }
      })

      console.log('Fetching products with params:', params);

      productStore.fetchProducts(params)
        .then(() => {
          console.log('Products fetched:', productStore.products.length);
          console.log('Pagination:', productStore.pagination);
          console.log('Total pages:', productStore.totalPages);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        });

      updateRouteQuery()
    }

    // 切换页码
    const changePage = (page) => {
      if (page < 1 || page > productStore.totalPages) return

      currentPage.value = page
      fetchProducts()

      // 滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // 过滤器变更处理
    const handleFilterChange = (filters) => {
      Object.assign(initialFilters, filters)
      currentPage.value = 1
      fetchProducts()
    }

    // 清除搜索
    const clearSearch = () => {
      initialFilters.category_id = null
      initialFilters.keyword = ''
      initialFilters.min_price = null
      initialFilters.max_price = null
      initialFilters.sort_by = 'created_at'
      initialFilters.sort_order = 'desc'
      mobileSearchKeyword.value = ''

      currentPage.value = 1
      fetchProducts()
    }

    // 重置过滤条件
    const resetFilters = () => {
      productStore.resetFilters()
      clearSearch()
    }

    // 跳转到创建产品页面
    const goToCreateProduct = () => {
      router.push('/product/create')
    }

    // 从URL加载过滤条件
    const loadFiltersFromQuery = () => {
      const { query } = route

      if (query.category_id) {
        initialFilters.category_id = parseInt(query.category_id) || query.category_id
      }

      if (query.keyword) {
        initialFilters.keyword = query.keyword
        mobileSearchKeyword.value = query.keyword
      }

      if (query.min_price) {
        initialFilters.min_price = query.min_price
      }

      if (query.max_price) {
        initialFilters.max_price = query.max_price
      }

      if (query.sort_by) {
        initialFilters.sort_by = query.sort_by
      }

      if (query.sort_order) {
        initialFilters.sort_order = query.sort_order
      }

      if (query.page) {
        currentPage.value = parseInt(query.page) || 1
      }
    }

    // 监听路由查询参数变化
    watch(
      () => route.query,
      () => {
        loadFiltersFromQuery()
        fetchProducts()
      }
    )

    // 组件挂载
    onMounted(() => {
      // 获取购物车数据
      cartStore.fetchCart()

      // 加载过滤条件并获取产品
      loadFiltersFromQuery()
      fetchProducts()

      // 添加窗口大小变化监听
      window.addEventListener('resize', handleResize)

      // 获取用户身份信息
      if (localStorage.getItem('token')) {
        try {
          identityStore.fetchUserIdentities()
        } catch (error) {
          console.error('获取用户身份信息失败:', error)
        }
      }
    })

    // 组件卸载
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      currentPage,
      initialFilters,
      productStore,
      isUserFarmer,
      isProductInCart,
      hasSearchFilters,
      emptyStateMessage,
      isMobileView,
      mobileSearchKeyword,
      displayedPages,
      handleFilterChange,
      changePage,
      clearSearch,
      resetFilters,
      goToCreateProduct,
      applyMobileSearch
    }
  }
}
</script>

<style scoped>
.product-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 5px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #555;
}

.mobile-action-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.mobile-search-box {
  display: flex;
  flex: 1;
  max-width: 80%;
}

.mobile-search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 20px 0 0 20px;
  font-size: 0.9rem;
}

.mobile-search-btn {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 0 20px 20px 0;
  cursor: pointer;
}

.product-container {
  display: flex;
  gap: 20px;
}

.product-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.product-list-container {
  flex: 1;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.create-product-btn {
  padding: 10px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.create-product-btn:hover {
  background-color: #388e3c;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 20px;
}

.search-result-info {
  background-color: #e8f5e9;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-search-btn {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  margin-left: 10px;
}

.clear-search-btn:hover {
  background-color: #f5f5f5;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
  margin-bottom: 20px;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number,
.pagination-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.page-number:hover,
.pagination-btn:hover {
  border-color: #4caf50;
  color: #4caf50;
}

.page-number.active {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

.pagination-btn:disabled {
  background-color: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
  border-color: #eee;
}

/* 移动端响应式样式 */
@media (max-width: 1024px) {
  .product-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .product-page {
    padding: 15px;
  }

  .page-header {
    margin-bottom: 15px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .product-container {
    flex-direction: column;
    gap: 15px;
  }

  .product-sidebar {
    width: 100%;
  }

  .mobile-sidebar {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .product-list.mobile-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .search-result-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-result-info .clear-search-btn {
    margin-left: 0;
    margin-top: 10px;
  }

  .pagination {
    margin-top: 20px;
  }

  .page-number,
  .pagination-btn {
    width: 36px;
    height: 36px;
  }

  .mobile-action-bar {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .mobile-search-box {
    width: 100%;
    max-width: 100%;
  }

  .create-product-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .product-list.mobile-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .mobile-card {
    width: 100%;
  }
}
</style>
