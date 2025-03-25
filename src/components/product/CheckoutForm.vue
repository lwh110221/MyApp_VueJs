<template>
  <div class="checkout-form">
    <h2 class="form-title">填写订单信息</h2>

    <form @submit.prevent="submitOrder">
      <!-- 收货人信息 -->
      <div class="form-section">
        <h3 class="section-title">收货人信息</h3>

        <div class="form-group">
          <label for="contact_name">收货人姓名 <span class="required">*</span></label>
          <input
            type="text"
            id="contact_name"
            v-model="form.contact_name"
            required
            placeholder="请输入收货人姓名"
            :class="{ 'error': errors.contact_name }"
          />
          <div v-if="errors.contact_name" class="error-message">{{ errors.contact_name }}</div>
        </div>

        <div class="form-group">
          <label for="contact_phone">联系电话 <span class="required">*</span></label>
          <input
            type="tel"
            id="contact_phone"
            v-model="form.contact_phone"
            required
            placeholder="请输入联系电话"
            :class="{ 'error': errors.contact_phone }"
          />
          <div v-if="errors.contact_phone" class="error-message">{{ errors.contact_phone }}</div>
        </div>

        <div class="form-group">
          <label for="contact_address">收货地址 <span class="required">*</span></label>
          <textarea
            id="contact_address"
            v-model="form.contact_address"
            required
            placeholder="请输入详细收货地址"
            rows="3"
            :class="{ 'error': errors.contact_address }"
          ></textarea>
          <div v-if="errors.contact_address" class="error-message">{{ errors.contact_address }}</div>
        </div>
      </div>

      <!-- 订单备注 -->
      <div class="form-section">
        <h3 class="section-title">订单备注</h3>

        <div class="form-group">
          <label for="note">备注 (可选)</label>
          <textarea
            id="note"
            v-model="form.note"
            placeholder="如有特殊要求，请在此备注"
            rows="2"
          ></textarea>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="form-section">
        <h3 class="section-title">支付方式</h3>

        <div class="payment-options">
          <div
            v-for="option in paymentOptions"
            :key="option.value"
            class="payment-option"
            :class="{ 'selected': form.payment_method === option.value }"
            @click="selectPaymentMethod(option.value)"
          >
            <div class="payment-option-inner">
              <i :class="option.icon"></i>
              <span>{{ option.label }}</span>
            </div>
          </div>
        </div>
        <div v-if="errors.payment_method" class="error-message">{{ errors.payment_method }}</div>
      </div>

      <!-- 订单商品 -->
      <div class="form-section">
        <h3 class="section-title">订单商品</h3>

        <div class="cart-items">
          <div v-if="cartItems.length === 0" class="empty-cart">
            购物车为空，请先选择商品
          </div>

          <div v-else class="checkout-item" v-for="item in cartItems" :key="item.id">
            <div class="checkout-item-image">
              <img :src="getProductImage(item)" :alt="item.name" />
            </div>
            <div class="checkout-item-info">
              <h4 class="checkout-item-title">{{ item.name }}</h4>
              <div class="checkout-item-meta">
                <span class="checkout-item-price">¥{{ formatPrice(item.price) }}</span>
                <span class="checkout-item-quantity">x {{ item.quantity }}</span>
              </div>
            </div>
            <div class="checkout-item-subtotal">
              <span>¥{{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单金额 -->
      <div class="form-section total-section">
        <div class="total-row">
          <span>商品总金额:</span>
          <span class="amount">¥{{ cartTotal }}</span>
        </div>
        <div class="total-row">
          <span>运费:</span>
          <span class="amount">¥{{ formatPrice(0) }}</span>
        </div>
        <div class="total-row total-amount">
          <span>应付金额:</span>
          <span class="amount">¥{{ cartTotal }}</span>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <button type="button" class="back-btn" @click="goBack">返回购物车</button>
        <button type="submit" class="submit-btn" :disabled="loading || cartItems.length === 0">
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          提交订单
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore, useOrderStore, useProductStore } from '@/stores'
import { messageService } from '@/api'

export default {
  name: 'CheckoutForm',

  emits: ['submit'],

  setup(props, { emit }) {
    const router = useRouter()
    const cartStore = useCartStore()
    const orderStore = useOrderStore()
    const productStore = useProductStore()

    const loading = ref(false)
    const errors = ref({})

    // 表单数据
    const form = reactive({
      contact_name: '',
      contact_phone: '',
      contact_address: '',
      note: '',
      payment_method: 'alipay',
      cart_item_ids: []
    })

    // 支付方式选项
    const paymentOptions = [
      { value: 'alipay', label: '支付宝', icon: 'fa-brands fa-alipay' },
      { value: 'wechat', label: '微信支付', icon: 'fa-brands fa-weixin' },
      { value: 'bank', label: '银行卡支付', icon: 'fa-solid fa-credit-card' }
    ]

    // 选择支付方式
    const selectPaymentMethod = (method) => {
      form.payment_method = method
    }

    // 获取购物车中已选中的商品
    const cartItems = computed(() => {
      return cartStore.selectedCartItems
    })

    // 计算商品总金额
    const cartTotal = computed(() => {
      return cartStore.cartTotal
    })

    // 格式化价格
    const formatPrice = (price) => {
      return productStore.formatPrice(price)
    }

    // 获取产品图片
    const getProductImage = (item) => {
      return productStore.getProductImage(item)
    }

    // 验证表单
    const validateForm = () => {
      const newErrors = {}

      if (!form.contact_name.trim()) {
        newErrors.contact_name = '请输入收货人姓名'
      }

      if (!form.contact_phone.trim()) {
        newErrors.contact_phone = '请输入联系电话'
      } else if (!/^1[3-9]\d{9}$/.test(form.contact_phone)) {
        newErrors.contact_phone = '请输入有效的手机号码'
      }

      if (!form.contact_address.trim()) {
        newErrors.contact_address = '请输入收货地址'
      }

      if (!form.payment_method) {
        newErrors.payment_method = '请选择支付方式'
      }

      if (cartItems.value.length === 0) {
        newErrors.cart = '购物车为空，请先选择商品'
      }

      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }

    // 提交订单
    const submitOrder = async () => {
      if (!validateForm()) return

      loading.value = true

      try {
        // 设置选中商品ID列表
        form.cart_item_ids = cartItems.value.map(item => item.id)

        // 创建订单
        const orderData = { ...form }
        // 将contact_address字段重命名为address字段，以匹配后端要求
        orderData.address = orderData.contact_address
        delete orderData.contact_address

        // 将cart_item_ids字段重命名为cart_items字段，以匹配后端要求
        orderData.cart_items = orderData.cart_item_ids
        delete orderData.cart_item_ids

        console.log('提交订单数据:', orderData)
        const result = await orderStore.createOrder(orderData)
        console.log('订单创建结果:', result)

        if (result && result.id) {
          // 触发事件通知父组件
          emit('submit', result)
          console.log('订单ID:', result.id, '跳转到支付页面')

          // 跳转到订单详情页
          router.push(`/orders/${result.id}?action=pay`)
        } else {
          console.error('订单创建成功但未返回ID:', result)
          messageService.error('订单创建成功，但无法获取订单ID')
        }
      } catch (error) {
        console.error('提交订单失败:', error)

        // 处理后端返回的错误
        if (error.response && error.response.data && error.response.data.errors) {
          errors.value = error.response.data.errors
        }
      } finally {
        loading.value = false
      }
    }

    // 返回购物车
    const goBack = () => {
      router.push('/cart')
    }

    // 组件挂载时获取购物车数据
    onMounted(async () => {
      // 如果没有商品，先获取购物车数据
      if (cartStore.cartItems.length === 0) {
        await cartStore.fetchCart()
      }

      // 填充用户信息（如果有）
      const user = JSON.parse(localStorage.getItem('user')) || {}
      if (user.name) {
        form.contact_name = user.name
      }
      if (user.phone) {
        form.contact_phone = user.phone
      }
      if (user.address) {
        form.contact_address = user.address
      }
    })

    return {
      form,
      loading,
      errors,
      paymentOptions,
      cartItems,
      cartTotal,
      formatPrice,
      getProductImage,
      selectPaymentMethod,
      submitOrder,
      goBack
    }
  }
}
</script>

<style scoped>
.checkout-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.form-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
}

.form-section {
  margin-bottom: 30px;
  border-bottom: 1px dashed #eee;
  padding-bottom: 20px;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #ff6b6b;
}

input[type="text"],
input[type="tel"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="tel"]:focus,
textarea:focus {
  border-color: #4caf50;
  outline: none;
}

input.error,
textarea.error {
  border-color: #ff6b6b;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 5px;
}

.payment-options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.payment-option {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s;
  width: calc(33.333% - 10px);
  min-width: 120px;
}

.payment-option-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.payment-option:hover {
  border-color: #4caf50;
  background-color: #f9fff9;
}

.payment-option.selected {
  border-color: #4caf50;
  background-color: #f9fff9;
  color: #4caf50;
}

.payment-option i {
  font-size: 1.2rem;
}

.cart-items {
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.empty-cart {
  text-align: center;
  padding: 20px;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.checkout-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.checkout-item:last-child {
  border-bottom: none;
}

.checkout-item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 15px;
}

.checkout-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.checkout-item-info {
  flex: 1;
}

.checkout-item-title {
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.checkout-item-meta {
  display: flex;
  gap: 10px;
  color: #666;
  font-size: 0.9rem;
}

.checkout-item-price {
  color: #ff6b6b;
}

.checkout-item-subtotal {
  font-weight: 500;
  color: #ff6b6b;
  min-width: 80px;
  text-align: right;
}

.total-section {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #666;
}

.total-row.total-amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.amount {
  font-weight: 500;
}

.total-amount .amount {
  color: #ff6b6b;
  font-weight: 700;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.back-btn,
.submit-btn {
  padding: 12px 25px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background-color: #ff5252;
}

.submit-btn:disabled {
  background-color: #ffd6d6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .checkout-form {
    padding: 15px;
  }

  .payment-option {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .back-btn,
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
