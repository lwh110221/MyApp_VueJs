<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">销售订单详情</h1>
      <p class="text-gray-600 mt-2">查看订单详细信息并进行发货处理</p>
    </div>

    <!-- 订单详情组件 -->
    <SellerOrderDetail />
  </div>
</template>

<script>
import SellerOrderDetail from '@/components/product/SellerOrderDetail.vue'

export default {
  name: 'SellerOrderDetailPage',
  components: {
    SellerOrderDetail
  }
}
</script>

<style scoped>
.container {
  min-height: calc(100vh - 60px);
}
</style>