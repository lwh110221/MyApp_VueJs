<template>
  <div class="product-filter" :class="{ 'mobile-collapsed': isMobile && !isExpanded }">
    <div class="filter-header" @click="toggleMobileExpand">
      <h3 class="filter-title">
        <i class="fa-solid fa-filter"></i> 过滤条件
      </h3>
      <!-- 移动端展开/折叠按钮 -->
      <button v-if="isMobile" class="expand-toggle-btn">
        <i :class="isExpanded ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
      </button>
    </div>

    <div class="filter-content" :class="{ 'mobile-hidden': isMobile && !isExpanded }">
      <!-- 分类过滤 -->
      <div class="filter-group">
        <h4 class="filter-group-title">分类</h4>
        <div class="category-list">
          <div
            class="category-item"
            :class="{ active: !selectedCategory }"
            @click="selectCategory(null)"
          >
            全部分类
          </div>
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-item"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </div>
        </div>
      </div>

      <!-- 价格过滤 -->
      <div class="filter-group">
        <h4 class="filter-group-title">价格范围</h4>
        <div class="price-filter">
          <input
            type="number"
            v-model="minPrice"
            placeholder="最低价"
            class="price-input"
          />
          <span class="price-separator">至</span>
          <input
            type="number"
            v-model="maxPrice"
            placeholder="最高价"
            class="price-input"
          />
          <button @click="applyPriceFilter" class="apply-btn">确定</button>
        </div>
      </div>

      <!-- 排序方式 -->
      <div class="filter-group">
        <h4 class="filter-group-title">排序方式</h4>
        <div class="sort-options">
          <div
            class="sort-item"
            :class="{ active: activeSortOption === 'created_at_desc' }"
            @click="setSortOption('created_at', 'desc')"
          >
            最新上架
          </div>
          <div
            class="sort-item"
            :class="{ active: activeSortOption === 'price_asc' }"
            @click="setSortOption('price', 'asc')"
          >
            价格从低到高
          </div>
          <div
            class="sort-item"
            :class="{ active: activeSortOption === 'price_desc' }"
            @click="setSortOption('price', 'desc')"
          >
            价格从高到低
          </div>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="filter-group">
        <h4 class="filter-group-title">搜索产品</h4>
        <div class="search-box">
          <input
            type="text"
            v-model="keyword"
            @keyup.enter="applyFilters"
            placeholder="输入产品关键词"
            class="search-input"
          />
          <button @click="applyFilters" class="search-btn">
            <i class="fa-solid fa-search"></i>
          </button>
        </div>
      </div>

      <!-- 重置按钮 -->
      <div class="filter-actions">
        <button @click="resetFilters" class="reset-btn">
          <i class="fa-solid fa-rotate"></i> 重置筛选
        </button>
      </div>
    </div>

    <!-- 移动端快速筛选工具栏 -->
    <div v-if="isMobile && !isExpanded" class="mobile-quick-filters">
      <div class="quick-filter-badges">
        <div v-if="selectedCategory" class="filter-badge" @click="toggleMobileExpand">
          <span>分类: {{ getCategoryName(selectedCategory) }}</span>
          <i class="fa-solid fa-xmark" @click.stop="selectCategory(null)"></i>
        </div>
        <div v-if="minPrice || maxPrice" class="filter-badge" @click="toggleMobileExpand">
          <span>价格: {{ formatPriceRange() }}</span>
          <i class="fa-solid fa-xmark" @click.stop="clearPriceFilter"></i>
        </div>
        <div v-if="activeSortOption !== 'created_at_desc'" class="filter-badge" @click="toggleMobileExpand">
          <span>排序: {{ getSortOptionText() }}</span>
          <i class="fa-solid fa-xmark" @click.stop="resetSortOption"></i>
        </div>
        <div v-if="keyword" class="filter-badge" @click="toggleMobileExpand">
          <span>关键词: {{ keyword }}</span>
          <i class="fa-solid fa-xmark" @click.stop="clearKeyword"></i>
        </div>
      </div>
      <button v-if="hasActiveFilters" @click="resetFilters" class="mobile-reset-btn">
        <i class="fa-solid fa-rotate"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useProductStore } from '@/stores'

export default {
  name: 'ProductFilter',

  props: {
    initialCategory: {
      type: [Number, String, null],
      default: null
    },
    initialKeyword: {
      type: String,
      default: ''
    }
  },

  emits: ['filter-change'],

  setup(props, { emit }) {
    const productStore = useProductStore()
    const categories = ref([])
    const loading = ref(false)

    const selectedCategory = ref(props.initialCategory)
    const keyword = ref(props.initialKeyword || '')
    const minPrice = ref('')
    const maxPrice = ref('')
    const sortBy = ref('created_at')
    const sortOrder = ref('desc')

    // 移动端相关状态
    const isMobile = ref(window.innerWidth < 768)
    const isExpanded = ref(false)

    // 监听窗口大小变化
    const handleResize = () => {
      isMobile.value = window.innerWidth < 768
      if (!isMobile.value) {
        isExpanded.value = false
      }
    }

    // 切换移动端展开/折叠状态
    const toggleMobileExpand = () => {
      if (isMobile.value) {
        isExpanded.value = !isExpanded.value
      }
    }

    // 获取激活的排序选项，用于高亮
    const activeSortOption = computed(() => {
      return `${sortBy.value}_${sortOrder.value}`
    })

    // 判断是否有激活的过滤条件
    const hasActiveFilters = computed(() => {
      return selectedCategory.value || keyword.value || minPrice.value || maxPrice.value ||
        (sortBy.value !== 'created_at' || sortOrder.value !== 'desc')
    })

    // 获取分类列表
    const fetchCategories = async () => {
      if (loading.value) return

      loading.value = true
      try {
        categories.value = await productStore.fetchCategories()
      } finally {
        loading.value = false
      }
    }

    // 获取分类名称
    const getCategoryName = (categoryId) => {
      const category = categories.value.find(c => c.id == categoryId)
      return category ? category.name : '未知分类'
    }

    // 获取当前排序方式的文本
    const getSortOptionText = () => {
      if (sortBy.value === 'created_at' && sortOrder.value === 'desc') return '最新上架'
      if (sortBy.value === 'price' && sortOrder.value === 'asc') return '价格低到高'
      if (sortBy.value === 'price' && sortOrder.value === 'desc') return '价格高到低'
      return '默认排序'
    }

    // 格式化价格范围
    const formatPriceRange = () => {
      if (minPrice.value && maxPrice.value) {
        return `${minPrice.value}-${maxPrice.value}元`
      } else if (minPrice.value) {
        return `≥${minPrice.value}元`
      } else if (maxPrice.value) {
        return `≤${maxPrice.value}元`
      }
      return ''
    }

    // 选择分类
    const selectCategory = (categoryId) => {
      selectedCategory.value = categoryId
      applyFilters()
      if (isMobile.value && isExpanded.value) {
        isExpanded.value = false
      }
    }

    // 设置排序方式
    const setSortOption = (by, order) => {
      sortBy.value = by
      sortOrder.value = order
      applyFilters()
      if (isMobile.value && isExpanded.value) {
        isExpanded.value = false
      }
    }

    // 重置排序选项
    const resetSortOption = () => {
      sortBy.value = 'created_at'
      sortOrder.value = 'desc'
      applyFilters()
    }

    // 应用价格过滤
    const applyPriceFilter = () => {
      // 验证价格范围
      if (minPrice.value && maxPrice.value && parseFloat(minPrice.value) > parseFloat(maxPrice.value)) {
        // 交换价格，确保最小不大于最大
        const temp = minPrice.value
        minPrice.value = maxPrice.value
        maxPrice.value = temp
      }

      applyFilters()
      if (isMobile.value && isExpanded.value) {
        isExpanded.value = false
      }
    }

    // 清除价格过滤
    const clearPriceFilter = () => {
      minPrice.value = ''
      maxPrice.value = ''
      applyFilters()
    }

    // 清除关键词
    const clearKeyword = () => {
      keyword.value = ''
      applyFilters()
    }

    // 应用所有过滤条件
    const applyFilters = () => {
      emit('filter-change', {
        category_id: selectedCategory.value,
        keyword: keyword.value,
        min_price: minPrice.value || null,
        max_price: maxPrice.value || null,
        sort_by: sortBy.value,
        sort_order: sortOrder.value
      })
    }

    // 重置所有过滤条件
    const resetFilters = () => {
      selectedCategory.value = null
      keyword.value = ''
      minPrice.value = ''
      maxPrice.value = ''
      sortBy.value = 'created_at'
      sortOrder.value = 'desc'

      applyFilters()
      if (isMobile.value && isExpanded.value) {
        isExpanded.value = false
      }
    }

    // 组件挂载时获取分类和设置窗口大小监听
    onMounted(() => {
      fetchCategories()
      window.addEventListener('resize', handleResize)
    })

    // 组件卸载时清除窗口大小监听
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      categories,
      selectedCategory,
      keyword,
      minPrice,
      maxPrice,
      activeSortOption,
      isMobile,
      isExpanded,
      hasActiveFilters,
      selectCategory,
      setSortOption,
      resetSortOption,
      applyPriceFilter,
      clearPriceFilter,
      clearKeyword,
      applyFilters,
      resetFilters,
      toggleMobileExpand,
      getCategoryName,
      getSortOptionText,
      formatPriceRange
    }
  }
}
</script>

<style scoped>
.product-filter {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.filter-header {
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-content {
  padding: 0 20px 20px;
}

.filter-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-toggle-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.expand-toggle-btn:hover {
  color: #4caf50;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group-title {
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 12px;
  color: #555;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-item {
  padding: 6px 12px;
  border-radius: 16px;
  background-color: #f5f5f5;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background-color: #e8f5e9;
  color: #388e3c;
}

.category-item.active {
  background-color: #4caf50;
  color: white;
}

.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.price-input {
  width: 70px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.price-separator {
  color: #666;
}

.apply-btn {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.apply-btn:hover {
  background-color: #388e3c;
}

.sort-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sort-item {
  padding: 6px 12px;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-item:hover {
  background-color: #e8f5e9;
  color: #388e3c;
}

.sort-item.active {
  background-color: #4caf50;
  color: white;
}

.search-box {
  display: flex;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-right: none;
  border-radius: 4px 0 0 4px;
  font-size: 0.9rem;
}

.search-btn {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.search-btn:hover {
  background-color: #388e3c;
}

.filter-actions {
  margin-top: 20px;
  text-align: center;
}

.reset-btn {
  width: 100%;
  padding: 8px 16px;
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.reset-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

/* 移动端快速筛选样式 */
.mobile-quick-filters {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
}

.quick-filter-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.filter-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #e8f5e9;
  color: #388e3c;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
}

.filter-badge i {
  font-size: 0.7rem;
  cursor: pointer;
  padding: 3px;
}

.filter-badge i:hover {
  color: #d32f2f;
}

.mobile-reset-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
}

.mobile-reset-btn:hover {
  background-color: #e0e0e0;
  color: #333;
}

/* 移动端响应式样式 */
@media (max-width: 768px) {
  .product-filter {
    position: relative;
    margin-bottom: 10px;
  }

  .mobile-collapsed {
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  }

  .mobile-hidden {
    display: none;
  }

  .filter-header {
    padding: 12px 15px;
  }

  .filter-title {
    font-size: 1rem;
  }

  .price-filter {
    gap: 5px;
  }

  .price-input {
    width: 60px;
    padding: 6px 8px;
  }

  .apply-btn {
    padding: 6px 10px;
  }

  .sort-options {
    gap: 8px;
  }

  .sort-item {
    padding: 5px 10px;
    font-size: 0.85rem;
  }

  .search-input {
    padding: 8px 10px;
  }

  .search-btn {
    padding: 8px 10px;
  }
}
</style>
