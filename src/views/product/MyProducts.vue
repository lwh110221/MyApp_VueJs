<template>
  <div class="my-products-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">我发布的产品</h1>
        <p class="page-subtitle">管理您发布的所有农产品</p>

        <div class="header-actions">
          <router-link to="/products/create" class="create-btn">
            <i class="fa-solid fa-plus"></i> 发布新产品
          </router-link>
        </div>
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
          <i class="fa-solid fa-box-open"></i>
        </div>
        <h3 class="empty-state-title">您还没有发布过产品</h3>
        <p class="empty-state-message">
          点击"发布新产品"开始创建您的第一个农产品
        </p>
        <router-link to="/products/create" class="create-btn">
          <i class="fa-solid fa-plus"></i> 发布新产品
        </router-link>
      </div>

      <!-- 产品列表 -->
      <div v-else class="product-list">
        <div class="product-card" v-for="product in products" :key="product.id">
          <div class="product-image">
            <img :src="getProductImage(product)" :alt="product.title">

            <div class="product-status" :class="getStatusClass(product.status)">
              {{ getStatusText(product.status) }}
            </div>
          </div>

          <div class="product-info">
            <h3 class="product-name">{{ product.title }}</h3>

            <div class="product-meta">
              <span class="product-category">{{ product.category_name }}</span>
              <span class="product-price">¥{{ formatPrice(product.price) }}</span>
            </div>

            <div class="product-stats">
              <div class="stat-item">
                <i class="fa-solid fa-cubes"></i>
                <span>库存: {{ product.stock }} {{ product.unit }}</span>
              </div>

              <div class="stat-item">
                <i class="fa-solid fa-eye"></i>
                <span>浏览: {{ product.view_count || 0 }}</span>
              </div>

              <div class="stat-item">
                <i class="fa-solid fa-shopping-cart"></i>
                <span>销量: {{ product.sales_count || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="product-actions">
            <router-link :to="`/products/${product.id}`" class="action-btn view-btn">
              <i class="fa-solid fa-eye"></i> 查看
            </router-link>

            <router-link :to="`/products/edit/${product.id}`" class="action-btn edit-btn">
              <i class="fa-solid fa-edit"></i> 编辑
            </router-link>

            <button
              v-if="parseInt(product.status) === 1"
              class="action-btn shelf-btn off-btn"
              @click="confirmChangeStatus(product.id, product.title, 0)"
            >
              <i class="fa-solid fa-arrow-down"></i> 下架
            </button>

            <button
              v-else
              class="action-btn shelf-btn on-btn"
              @click="confirmChangeStatus(product.id, product.title, 1)"
            >
              <i class="fa-solid fa-arrow-up"></i> 上架
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="products.length > 0" class="pagination">
        <button
          class="page-btn prev"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="fa-solid fa-chevron-left"></i> 上一页
        </button>

        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>

        <button
          class="page-btn next"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页 <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- 状态变更确认对话框 -->
    <div v-if="showStatusConfirm" class="delete-confirm-modal">
      <div class="modal-overlay" @click="cancelStatusChange"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">确认{{ statusChangeData.newStatus === 1 ? '上架' : '下架' }}</h3>
          <button class="close-btn" @click="cancelStatusChange">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p>您确定要{{ statusChangeData.newStatus === 1 ? '上架' : '下架' }}产品 <strong>{{ statusChangeData.name }}</strong> 吗？</p>
          <p v-if="statusChangeData.newStatus === 0" class="delete-warning">
            下架后，该产品将不会显示在产品列表中，但您可以随时再次上架。
          </p>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="cancelStatusChange">取消</button>
          <button
            class="confirm-btn"
            :class="statusChangeData.newStatus === 1 ? 'confirm-on-btn' : 'confirm-off-btn'"
            :disabled="isStatusChanging"
            @click="changeProductStatus"
          >
            <i v-if="isStatusChanging" class="fa-solid fa-spinner fa-spin"></i>
            确认{{ statusChangeData.newStatus === 1 ? '上架' : '下架' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { messageService } from '@/api'

export default {
  name: 'MyProducts',

  setup() {
    const loading = ref(false)
    const products = ref([])
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    // 状态变更确认
    const showStatusConfirm = ref(false)
    const isStatusChanging = ref(false)
    const statusChangeData = ref({
      id: null,
      name: '',
      newStatus: null
    })

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(total.value / pageSize.value) || 1
    })

    // 直接使用axios请求，绕过store层
    const fetchProducts = async (page = 1) => {
      loading.value = true

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          messageService.error('请先登录')
          return
        }

        const response = await axios({
          method: 'get',
          url: `${import.meta.env.VITE_BASE_API_URL}/products/user`,
          params: {
            page: page,
            limit: pageSize.value
          },
          headers: {
            'Authorization': `Bearer ${token.trim()}`,
            'Accept': 'application/json'
          }
        })

        console.log('产品列表响应:', response.data)

        // ResponseUtil.page返回的结构是 { code: 200, data: { list, pagination: { total, page, pageSize } }, message: '获取成功' }
        if (response.data && response.data.code === 200 && response.data.data) {
          const data = response.data.data
          products.value = data.list || []
          total.value = data.pagination?.total || 0
          currentPage.value = data.pagination?.page || page
        } else {
          products.value = []
          total.value = 0
          messageService.error('获取产品列表失败，返回数据格式不正确')
        }
      } catch (error) {
        console.error('获取产品列表失败:', error)
        products.value = []
        total.value = 0
        messageService.error(error.response?.data?.message || '获取产品列表失败')
      } finally {
        loading.value = false
      }
    }

    // 切换页码
    const changePage = (page) => {
      if (page < 1 || page > totalPages.value) return
      fetchProducts(page)
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // 获取产品图片
    const getProductImage = (product) => {
      if (!product || !product.images) {
        return '/images/default-product.jpg'
      }

      let images = []
      try {
        if (typeof product.images === 'string') {
          // 只有在确认是JSON字符串时才解析
          if (product.images.startsWith('[') || product.images.startsWith('{')) {
            images = JSON.parse(product.images)
          } else {
            // 如果是单个路径字符串，则直接将其作为第一个图片
            images = [product.images]
          }
        } else if (Array.isArray(product.images)) {
          images = product.images
        } else {
          images = []
        }
      } catch (e) {
        console.error('解析图片失败:', e)
        images = []
      }

      if (!images || images.length === 0) {
        return '/images/default-product.jpg'
      }

      const image = images[0]

      if (!image) {
        return '/images/default-product.jpg'
      }

      if (image.startsWith('http')) {
        return image
      }

      return `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${image}`
    }

    // 格式化价格
    const formatPrice = (price) => {
      return Number(price).toFixed(2)
    }

    // 获取状态类名
    const getStatusClass = (status) => {
      switch (parseInt(status)) {
        case 0: return 'status-draft'
        case 1: return 'status-active'
        case 2: return 'status-soldout'
        case 3: return 'status-removed'
        default: return 'status-unknown'
      }
    }

    // 获取状态文本
    const getStatusText = (status) => {
      switch (parseInt(status)) {
        case 0: return '下架'
        case 1: return '在售'
        case 2: return '售罄'
        case 3: return '已下架'
        default: return '未知'
      }
    }

    // 打开状态变更确认框
    const confirmChangeStatus = (id, name, newStatus) => {
      statusChangeData.value = {
        id: id,
        name: name,
        newStatus: newStatus
      }
      showStatusConfirm.value = true
    }

    // 取消状态变更
    const cancelStatusChange = () => {
      showStatusConfirm.value = false
    }

    // 更改产品状态
    const changeProductStatus = async () => {
      isStatusChanging.value = true

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          messageService.error('请先登录')
          return
        }

        await axios({
          method: 'put',
          url: `${import.meta.env.VITE_BASE_API_URL}/products/${statusChangeData.value.id}/status`,
          params: {
            status: statusChangeData.value.newStatus
          },
          headers: {
            'Authorization': `Bearer ${token.trim()}`,
            'Accept': 'application/json'
          }
        })

        messageService.success('产品状态已更改')
        showStatusConfirm.value = false

        // 重新加载当前页面数据
        await fetchProducts(currentPage.value)
      } catch (error) {
        console.error('更改产品状态失败:', error)
        messageService.error(error.response?.data?.message || '更改产品状态失败')
      } finally {
        isStatusChanging.value = false
      }
    }

    // 组件挂载时
    onMounted(() => {
      fetchProducts()
    })

    return {
      loading,
      products,
      currentPage,
      totalPages,
      showStatusConfirm,
      isStatusChanging,
      statusChangeData,
      getProductImage,
      formatPrice,
      getStatusClass,
      getStatusText,
      changePage,
      confirmChangeStatus,
      cancelStatusChange,
      changeProductStatus
    }
  }
}
</script>

<style scoped>
.my-products-page {
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 20px;
}

.header-actions {
  margin-top: 15px;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #4caf50;
  color: white;
  border-radius: 4px;
  padding: 10px 20px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.3s, transform 0.2s;
}

.create-btn:hover {
  background-color: #388e3c;
  transform: translateY(-2px);
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
}

.loading-spinner i {
  font-size: 2rem;
  color: #4caf50;
}

.empty-state {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 60px 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state-icon {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 20px;
}

.empty-state-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 15px;
}

.empty-state-message {
  color: #666;
  margin-bottom: 30px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 180px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: white;
  font-weight: 500;
}

.status-draft {
  background-color: #9e9e9e;
}

.status-active {
  background-color: #4caf50;
}

.status-soldout {
  background-color: #ff9800;
}

.status-removed {
  background-color: #f44336;
}

.status-unknown {
  background-color: #607d8b;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.product-category {
  background-color: #e8f5e9;
  color: #388e3c;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.product-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff6b6b;
}

.product-stats {
  border-top: 1px solid #eee;
  padding-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: #666;
  margin-right: 15px;
}

.product-actions {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.3s;
}

.view-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.view-btn:hover {
  background-color: #bbdefb;
}

.edit-btn {
  background-color: #e8f5e9;
  color: #388e3c;
}

.edit-btn:hover {
  background-color: #c8e6c9;
}

.shelf-btn {
  background-color: #e8f5e9;
  color: #388e3c;
}

.shelf-btn:hover {
  background-color: #c8e6c9;
}

.off-btn {
  background-color: #ffebee;
  color: #d32f2f;
}

.off-btn:hover {
  background-color: #ffcdd2;
}

.on-btn {
  background-color: #e8f5e9;
  color: #388e3c;
}

.on-btn:hover {
  background-color: #c8e6c9;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.page-btn {
  padding: 8px 16px;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.page-btn:disabled {
  color: #aaa;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

/* 状态变更确认对话框 */
.delete-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow: hidden;
}

.modal-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.delete-warning {
  color: #f44336;
  margin-top: 10px;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e5e5e5;
}

.confirm-btn {
  background-color: #f44336;
  color: white;
  display: flex;
  align-items: center;
  gap: 5px;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

.confirm-off-btn {
  background-color: #f44336;
}

.confirm-on-btn {
  background-color: #4caf50;
}

.confirm-btn:disabled {
  background-color: #ffcdd2;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .product-list {
    grid-template-columns: 1fr;
  }

  .product-actions {
    flex-wrap: wrap;
    gap: 10px;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
