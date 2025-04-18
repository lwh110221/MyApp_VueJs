<template>
  <div class="order-list-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <i class="fa-solid fa-list-ul"></i> 我的订单
        </h1>
      </div>

      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>加载中...</span>
        </div>
      </div>


      <!-- 订单为空 -->
      <div v-if="!loading && orders.length === 0" class="empty-orders">
        <div class="empty-orders-icon">
          <i class="fa-solid fa-clipboard-list"></i>
        </div>
        <h2 class="empty-orders-title">
          {{ activeStatus ? `没有${getStatusText(activeStatus)}的订单` : '暂无订单' }}
        </h2>
        <p class="empty-orders-message">
          {{ activeStatus ? '切换到其他状态查看更多订单' : '快去选购新鲜的农产品吧' }}
        </p>
        <router-link to="/products" class="shop-now-btn">
          <i class="fa-solid fa-shopping-basket"></i> 去购物
        </router-link>
      </div>

      <!-- 订单列表 -->
      <div v-else-if="!loading && orders.length > 0" class="order-list">
        <OrderItem
          v-for="order in orders"
          :key="order.id"
          :order="order"
        />

        <!-- 分页 -->
        <div v-if="orders.length > 0" class="pagination">
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
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores'
import { messageService } from '@/api'
import OrderItem from '@/components/product/OrderItem.vue'

export default {
  name: 'OrderList',

  components: {
    OrderItem
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const orderStore = useOrderStore()

    const loading = ref(true)
    const orders = ref([])
    const orderStats = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(5)
    const totalItems = ref(0)
    const activeStatus = ref('')

    // 分页计算
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / pageSize.value)
    })

    // 获取订单状态文本
    const getStatusText = (status) => {
      return orderStore.getStatusText(status)
    }

    // 按状态筛选
    const filterByStatus = (status) => {
      const statusStr = status.toString();

      if (activeStatus.value === statusStr) {
        // 如果点击的是当前选中的状态，取消筛选
        activeStatus.value = '';
        router.push({
          query: {
            ...route.query,
            status: undefined,
            page: 1
          }
        });
      } else {
        // 确保status是0-5范围内的有效值
        const statusNum = parseInt(status);
        if (!isNaN(statusNum) && statusNum >= 0 && statusNum <= 5) {
          activeStatus.value = statusStr;
          // 更新URL查询参数，保持路由同步
          router.push({
            query: {
              ...route.query,
              status: statusStr,
              page: 1
            }
          });
        } else {
          console.warn('无效的订单状态:', status);
        }
      }
    }

    // 获取订单列表
    const fetchOrders = async () => {
      loading.value = true

      try {
        const params = {
          page: currentPage.value,
          limit: pageSize.value
        }

        // 如果有状态筛选，添加到参数中
        if (activeStatus.value !== undefined && activeStatus.value !== '') {
          params.status = activeStatus.value
        }

        await orderStore.fetchOrders(params)
        orders.value = orderStore.orders
        totalItems.value = orderStore.pagination.total

        // 如果还没有获取订单统计，也获取一下
        if (!orderStats.value) {
          await fetchOrderStats()
        }
      } catch (error) {
        console.error('获取订单列表失败:', error)
        messageService.error('获取订单列表失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    // 获取订单统计
    const fetchOrderStats = async () => {
      const stats = await orderStore.fetchOrderStats()
      orderStats.value = stats
    }

    // 切换页码
    const changePage = (page) => {
      currentPage.value = page
      fetchOrders()

      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // 从URL获取过滤条件
    const loadFiltersFromQuery = () => {
      const query = route.query

      // 处理页码参数
      if (query.page) {
        const parsedPage = parseInt(query.page);
        currentPage.value = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      } else {
        currentPage.value = 1;
      }

      // 处理状态参数
      if (query.status !== undefined && query.status !== '') {
        const parsedStatus = parseInt(query.status);
        // 确保解析后的值是0-5之间的有效状态
        if (!isNaN(parsedStatus) && parsedStatus >= 0 && parsedStatus <= 5) {
          activeStatus.value = parsedStatus.toString();
        } else {
          // 无效状态，清除筛选
          activeStatus.value = '';
          // 从URL中移除无效的status参数
          if (query.status) {
            router.replace({
              query: {
                ...query,
                status: undefined
              }
            });
          }
        }
      } else {
        activeStatus.value = '';
      }
    }

    // 监听路由变化
    watch(() => route.query, () => {
      loadFiltersFromQuery()
      fetchOrders()
    })

    // 获取图片完整URL
    const getImageUrl = (path) => {
      if (!path) return '/images/default-product.png';
      if (typeof path === 'object' && path.url) {
        path = path.url;
      }
      if (typeof path === 'string' && path.startsWith('http')) return path;
      const baseUrl = import.meta.env.VITE_BASE_API_URL?.replace('/api', '') || process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';
      return `${baseUrl}${path}`;
    };

    // 组件挂载时
    onMounted(() => {
      loadFiltersFromQuery()
      fetchOrders()
    })

    return {
      loading,
      orders,
      orderStats,
      currentPage,
      totalPages,
      activeStatus,
      getStatusText,
      filterByStatus,
      changePage,
      getImageUrl
    }
  }
}
</script>

<style scoped>
.order-list-page {
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

.order-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 15px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.stat-item:hover {
  background-color: #f9f9f9;
}

.stat-item.active {
  background-color: #e8f5e9;
  color: #4caf50;
}

.stat-count {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.stat-item.active .stat-label {
  color: #4caf50;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.empty-orders-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-orders-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.empty-orders-message {
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

.order-list {
  margin-bottom: 40px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
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

@media (max-width: 768px) {
  .order-list-page {
    padding: 20px 0;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .order-stats {
    flex-wrap: wrap;
    gap: 10px;
  }

  .stat-item {
    min-width: calc(50% - 10px);
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
