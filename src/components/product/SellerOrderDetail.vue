<template>
  <div class="bg-white rounded-lg shadow p-6">
    <!-- 返回按钮 -->
    <div class="mb-6">
      <button
        @click="router.back()"
        class="flex items-center text-gray-600 hover:text-gray-800"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        返回订单列表
      </button>
    </div>

    <div v-if="order" class="space-y-6">
      <!-- 订单状态和金额 -->
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">订单详情</h2>
          <p class="text-gray-500 mt-2">订单号: {{ order.order_no }}</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-green-600">￥{{ order.seller_total }}</p>
          <p class="text-gray-600 mt-1">{{ order.status_text }}</p>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p class="text-gray-500">下单时间</p>
          <p class="font-medium">{{ formatDate(order.created_at) }}</p>
        </div>
        <div>
          <p class="text-gray-500">支付方式</p>
          <p class="font-medium">{{ getPaymentMethod(order.payment_method) }}</p>
        </div>
        <div>
          <p class="text-gray-500">支付时间</p>
          <p class="font-medium">{{ order.payment_time ? formatDate(order.payment_time) : '-' }}</p>
        </div>
        <div>
          <p class="text-gray-500">发货时间</p>
          <p class="font-medium">{{ order.shipping_time ? formatDate(order.shipping_time) : '-' }}</p>
        </div>
      </div>

      <!-- 物流信息 -->
      <div v-if="order.tracking_number" class="p-4 bg-gray-50 rounded-lg">
        <h3 class="font-bold text-gray-800 mb-2">物流信息</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-gray-500">物流单号</p>
            <p class="font-medium">{{ order.tracking_number }}</p>
          </div>
          <div>
            <p class="text-gray-500">物流公司</p>
            <p class="font-medium">{{ order.shipping_company || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div>
        <h3 class="font-bold text-gray-800 mb-4">商品信息</h3>
        <div class="space-y-4">
          <div v-for="item in order.items" :key="item.id"
            class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <img :src="getProductImage(item)" :alt="item.product_title"
              class="w-20 h-20 object-cover rounded-md">
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ item.product_title }}</p>
              <p class="text-gray-500 mt-1">
                单价: ￥{{ item.price }}
              </p>
              <p class="text-gray-500">
                数量: {{ item.quantity }}
              </p>
              <p class="text-green-600 font-medium mt-1">
                小计: ￥{{ item.total_amount }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 收货信息 -->
      <div class="p-4 bg-gray-50 rounded-lg">
        <h3 class="font-bold text-gray-800 mb-2">收货信息</h3>
        <div class="space-y-2">
          <p class="text-gray-600">收货人: {{ order.contact_name }}</p>
          <p class="text-gray-600">联系电话: {{ order.contact_phone }}</p>
          <p class="text-gray-600">收货地址: {{ order.address }}</p>
          <p v-if="order.note" class="text-gray-600">
            备注: {{ order.note }}
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="order.status === 1" class="flex justify-end">
        <button
          @click="handleShip"
          class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          发货
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">加载中...</p>
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores'
import axios from 'axios'

export default {
  name: 'SellerOrderDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const productStore = useProductStore()
    const order = ref(null)
    const showShipModal = ref(false)
    const shipForm = ref({
      tracking_number: '',
      shipping_company: ''
    })
    const productCache = ref({}) // 用于缓存产品信息

    // 获取订单详情
    const fetchOrderDetail = async () => {
      try {
        const orderId = route.params.id
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_API_URL}/orders/seller/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/json'
            }
          }
        )
        if (response.data.code === 200) {
          order.value = response.data.data

          // 加载产品图片信息
          await loadProductImages()
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
      }
    }

    // 加载产品图片信息
    const loadProductImages = async () => {
      if (!order.value || !order.value.items || order.value.items.length === 0) return;

      const productIds = order.value.items
        .map(item => item.product_id)
        .filter(id => id && !productCache.value[id]);

      if (productIds.length === 0) return;

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

    // 处理发货
    const handleShip = () => {
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
          `${import.meta.env.VITE_BASE_API_URL}/orders/${order.value.id}/ship`,
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
          await fetchOrderDetail()
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

    // 获取支付方式文本
    const getPaymentMethod = (method) => {
      const methods = {
        1: '微信支付',
        2: '支付宝',
        3: '银行卡'
      }
      return methods[method] || '-'
    }

    onMounted(() => {
      fetchOrderDetail()
    })

    return {
      router,
      order,
      showShipModal,
      shipForm,
      formatDate,
      getPaymentMethod,
      handleShip,
      confirmShip,
      getProductImage
    }
  }
}
</script>
