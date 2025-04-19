<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">我的销售订单</h2>
      <div class="flex space-x-4">
        <select
          v-model="currentStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">全部订单</option>
          <option value="1">待发货</option>
          <option value="2">已发货</option>
          <option value="3">已完成</option>
          <option value="4">已取消</option>
        </select>
      </div>
    </div>

    <!-- 订单列表 -->
    <div v-if="orders.length > 0" class="space-y-4">
      <div v-for="order in orders" :key="order.id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-gray-500">订单号: {{ order.order_no }}</p>
            <p class="text-gray-500">下单时间: {{ formatDate(order.created_at) }}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold text-green-600">￥{{ order.seller_total }}</p>
            <p class="text-gray-600">{{ order.status_text }}</p>
          </div>
        </div>

        <!-- 订单商品 -->
        <div class="space-y-3">
          <div v-for="item in order.items" :key="item.id" class="flex items-center space-x-4">
            <img :src="getProductImage(item)" :alt="item.product_title"
              class="w-16 h-16 object-cover rounded-md">
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ item.product_title }}</p>
              <p class="text-gray-500">
                ￥{{ item.price }} × {{ item.quantity }}
              </p>
            </div>
          </div>
        </div>

        <!-- 收货人信息 -->
        <div class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-gray-600">
            收货人: {{ order.contact_name }} {{ order.contact_phone }}
          </p>
          <p class="text-gray-600">地址: {{ order.address }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="mt-4 flex justify-end space-x-4">
          <button
            v-if="order.status === 1"
            @click="handleShip(order)"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            发货
          </button>
          <button
            @click="viewOrderDetail(order.id)"
            class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">暂无订单</p>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center space-x-2">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="currentPage = page"
        :class="[
          'px-4 py-2 rounded-lg',
          currentPage === page
            ? 'bg-green-500 text-white'
            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
        ]"
      >
        {{ page }}
      </button>
    </div>

    <!-- 发货弹窗 -->
    <div v-if="showShipModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">订单发货</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 mb-2">物流单号</label>
            <input
              v-model="shipForm.tracking_number"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="请输入物流单号"
            >
          </div>
          <div>
            <label class="block text-gray-700 mb-2">物流公司</label>
            <input
              v-model="shipForm.shipping_company"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="请输入物流公司名称"
            >
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-4">
          <button
            @click="showShipModal = false"
            class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="confirmShip"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            确认发货
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores'
import axios from 'axios'

export default {
  name: 'SellerOrders',
  setup() {
    const router = useRouter()
    const productStore = useProductStore()
    const orders = ref([])
    const currentStatus = ref('')
    const currentPage = ref(1)
    const totalPages = ref(1)
    const showShipModal = ref(false)
    const currentOrder = ref(null)
    const shipForm = ref({
      tracking_number: '',
      shipping_company: ''
    })
    const productCache = ref({}) // 用于缓存产品信息

    // 获取订单列表
    const fetchOrders = async () => {
      try {
        const params = {
          page: currentPage.value,
          limit: 10
        }
        if (currentStatus.value) {
          params.status = currentStatus.value
        }

        const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/orders/seller`, {
          params,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        })
        if (response.data.code === 200) {
          orders.value = response.data.data.orders
          totalPages.value = response.data.data.totalPages

          // 获取产品图片信息
          await loadProductImages();
        }
      } catch (error) {
        console.error('获取订单列表失败:', error)
      }
    }

    // 查看订单详情
    const viewOrderDetail = (orderId) => {
      router.push(`/seller/orders/${orderId}`)
    }

    // 处理发货
    const handleShip = (order) => {
      currentOrder.value = order
      showShipModal.value = true
    }

    // 确认发货
    const confirmShip = async () => {
      if (!shipForm.value.tracking_number) {
        alert('请输入物流单号')
        return
      }

      try {
        const response = await axios.put(
          `${import.meta.env.VITE_BASE_API_URL}/orders/${currentOrder.value.id}/ship`,
          shipForm.value,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/json'
            }
          }
        )
        if (response.data.success) {
          showShipModal.value = false
          shipForm.value = {
            tracking_number: '',
            shipping_company: ''
          }
          await fetchOrders()
        }
      } catch (error) {
        console.error('发货失败:', error)
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 获取订单列表后加载产品信息
    const loadProductImages = async () => {
      if (!orders.value || orders.value.length === 0) return;

      const productIds = [];

      // 收集所有订单中的产品ID
      orders.value.forEach(order => {
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            if (item.product_id && !productCache.value[item.product_id]) {
              productIds.push(item.product_id);
            }
          });
        }
      });

      // 批量获取产品信息
      if (productIds.length > 0) {
        try {
          for (const productId of productIds) {
            const product = await productStore.fetchProductById(productId);
            if (product) {
              productCache.value[productId] = product;
            }
          }
        } catch (error) {
          console.error('获取产品信息失败:', error);
        }
      }
    }

    // 获取产品图片
    const getProductImage = (item) => {
      if (!item) return '/images/default-product.png';

      // 如果有 product_image 且不为空，直接使用
      if (item.product_image) {
        return getImageUrl(item.product_image);
      }

      // 从缓存中获取产品信息
      if (item.product_id && productCache.value[item.product_id]) {
        const cachedProduct = productCache.value[item.product_id];
        if (cachedProduct.images) {
          return productStore.getProductImage(cachedProduct);
        }
      }

      // 都没有则返回默认图片
      return '/images/default-product.png';
    }

    // 处理图片URL
    const getImageUrl = (path) => {
      if (!path) return '/images/default-product.png';
      if (typeof path === 'object' && path.url) {
        path = path.url;
      }
      if (typeof path === 'string' && path.startsWith('http')) return path;
      const baseUrl = import.meta.env.VITE_BASE_API_URL?.replace('/api', '') || process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000';
      return `${baseUrl}${path}`;
    };

    // 监听筛选条件变化
    watch([currentStatus, currentPage], () => {
      fetchOrders()
    })

    onMounted(() => {
      fetchOrders()
    })

    return {
      orders,
      currentStatus,
      currentPage,
      totalPages,
      showShipModal,
      shipForm,
      formatDate,
      fetchOrders,
      viewOrderDetail,
      handleShip,
      confirmShip,
      getProductImage
    }
  }
}
</script>
