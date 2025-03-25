import { defineStore } from 'pinia'
import { cartService, messageService } from '../api'
import { useProductStore } from './product'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [],
    loading: false,
    selectedItems: [],
    cartCount: 0
  }),

  getters: {
    // 计算购物车总金额
    cartTotal: (state) => {
      const productStore = useProductStore()
      return state.selectedItems.reduce((total, item) => {
        const cartItem = state.cartItems.find(i => i.id === item)
        return total + (cartItem ? parseFloat(cartItem.price) * cartItem.quantity : 0)
      }, 0).toFixed(2)
    },

    // 计算商品总数
    cartItemCount: (state) => {
      return state.cartItems.reduce((total, item) => total + item.quantity, 0)
    },

    // 获取选中的购物车商品
    selectedCartItems: (state) => {
      return state.cartItems.filter(item => state.selectedItems.includes(item.id))
    },

    // 是否全选
    isAllSelected: (state) => {
      return state.cartItems.length > 0 && state.selectedItems.length === state.cartItems.length
    }
  },

  actions: {
    // 获取购物车列表
    async fetchCart() {
      try {
        this.loading = true
        const response = await cartService.getCart()

        if (response && response.data) {
          this.cartItems = response.data.items || []
          this.cartCount = this.cartItems.length

          // 初始化选中状态
          if (this.selectedItems.length === 0) {
            this.selectedItems = this.cartItems.map(item => item.id)
          } else {
            // 清理不存在的选中项
            this.selectedItems = this.selectedItems.filter(id =>
              this.cartItems.some(item => item.id === id)
            )
          }
        }

        return this.cartItems
      } catch (error) {
        console.error('获取购物车失败:', error)
        messageService.error('获取购物车失败')
        return []
      } finally {
        this.loading = false
      }
    },

    // 添加商品到购物车
    async addToCart(productId, quantity = 1) {
      try {
        this.loading = true
        await cartService.addToCart({
          product_id: productId,
          quantity: quantity
        })
        messageService.success('添加到购物车成功')
        await this.fetchCart()
        return true
      } catch (error) {
        console.error('添加到购物车失败:', error)
        messageService.error(error.response?.data?.message || '添加到购物车失败')
        return false
      } finally {
        this.loading = false
      }
    },

    // 更新购物车商品数量
    async updateCartItemQuantity(itemId, quantity) {
      try {
        this.loading = true
        await cartService.updateCartItem(itemId, { quantity })
        // 本地更新数量，避免重新请求
        const item = this.cartItems.find(i => i.id === itemId)
        if (item) {
          item.quantity = quantity
        }

        return true
      } catch (error) {
        console.error('更新购物车数量失败:', error)
        messageService.error('更新购物车数量失败')
        await this.fetchCart() // 获取最新数据
        return false
      } finally {
        this.loading = false
      }
    },

    // 从购物车移除商品
    async removeFromCart(itemId) {
      try {
        this.loading = true
        await cartService.removeFromCart(itemId)

        // 从本地移除
        this.cartItems = this.cartItems.filter(item => item.id !== itemId)
        this.selectedItems = this.selectedItems.filter(id => id !== itemId)
        this.cartCount = this.cartItems.length

        messageService.success('已从购物车移除')
        return true
      } catch (error) {
        console.error('从购物车移除失败:', error)
        messageService.error('从购物车移除失败')
        await this.fetchCart() // 获取最新数据
        return false
      } finally {
        this.loading = false
      }
    },

    // 选择/取消选择购物车商品
    async toggleSelectItem(itemId) {
      const index = this.selectedItems.indexOf(itemId)
      if (index >= 0) {
        this.selectedItems.splice(index, 1)
      } else {
        this.selectedItems.push(itemId)
      }

      // 尝试同步到服务器，但不等待结果
      try {
        await cartService.updateSelected({
          selected: true,
          items: this.selectedItems
        })
      } catch (error) {
        console.error('更新商品选中状态失败:', error)
      }
    },

    // 全选/全不选
    async toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedItems = []
      } else {
        this.selectedItems = this.cartItems.map(item => item.id)
      }

      // 尝试同步到服务器，但不等待结果
      try {
        await cartService.updateSelected({
          selected: this.selectedItems.length > 0,
          items: this.selectedItems
        })
      } catch (error) {
        console.error('更新购物车全选状态失败:', error)
      }
    },

    // 批量更新选中状态
    updateSelectedItems(itemIds) {
      this.selectedItems = itemIds
    },

    // 清空购物车
    async clearCart() {
      try {
        this.loading = true
        await cartService.clearCart()
        this.cartItems = []
        this.selectedItems = []
        this.cartCount = 0
        messageService.success('购物车已清空')
        return true
      } catch (error) {
        console.error('清空购物车失败:', error)
        messageService.error('清空购物车失败')
        return false
      } finally {
        this.loading = false
      }
    },

    // 更新服务器端批量选中状态
    async updateSelection() {
      try {
        this.loading = true
        await cartService.updateSelected({
          selected: true,
          items: this.selectedItems
        })
        return true
      } catch (error) {
        console.error('更新购物车选择状态失败:', error)
        messageService.error('更新购物车选择状态失败')
        return false
      } finally {
        this.loading = false
      }
    }
  }
})
