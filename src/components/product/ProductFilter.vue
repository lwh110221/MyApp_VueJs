<template>
  <div class="product-filter">
    <div class="filter-section">
      <h3 class="filter-title">
        <i class="fa-solid fa-filter"></i> 过滤条件
      </h3>

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
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
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

    // 获取激活的排序选项，用于高亮
    const activeSortOption = computed(() => {
      return `${sortBy.value}_${sortOrder.value}`
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

    // 选择分类
    const selectCategory = (categoryId) => {
      selectedCategory.value = categoryId
      applyFilters()
    }

    // 设置排序方式
    const setSortOption = (by, order) => {
      sortBy.value = by
      sortOrder.value = order
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
    }

    // 组件挂载时获取分类
    onMounted(() => {
      fetchCategories()
    })

    return {
      categories,
      selectedCategory,
      keyword,
      minPrice,
      maxPrice,
      activeSortOption,
      selectCategory,
      setSortOption,
      applyPriceFilter,
      applyFilters,
      resetFilters
    }
  }
}
</script>

<style scoped>
.product-filter {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.filter-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
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
}

.price-input {
  width: 70px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.price-separator {
  color: #666;
}

.apply-btn {
  padding: 6px 12px;
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
</style>
