<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">销售订单管理</h1>
      <p class="text-gray-600 mt-2">管理您的商品销售订单</p>
    </div>

    <!-- 订单列表组件 -->
    <SellerOrders />
  </div>
</template>

<script>
import SellerOrders from '@/components/product/SellerOrders.vue'

export default {
  name: 'SellerOrderList',
  components: {
    SellerOrders
  }
}
</script>

<style scoped>
.container {
  min-height: calc(100vh - 60px);
}
</style>
