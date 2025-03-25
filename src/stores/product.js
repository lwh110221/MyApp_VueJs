import { defineStore } from 'pinia'
import { productService, messageService } from '../api'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    product: null,
    categories: [],
    featuredProducts: [],
    loading: false,
    pagination: {
      total: 0,
      page: 1,
      limit: 10
    },
    filters: {
      category_id: null,
      keyword: '',
      min_price: null,
      max_price: null,
      sort_by: 'created_at',
      sort_order: 'desc'
    }
  }),

  getters: {
    // 获取产品图片，处理可能的路径问题
    getProductImage: (state) => (product, index = 0) => {
      if (!product) {
        return '/public/default-avatar.png'
      }

      let images = []
      try {
        // 检查product.images是否存在
        if (!product.images) {
          return '/public/default-avatar.png'
        }

        // 处理来自购物车的商品，购物车中通常有product_image字段
        if (product.product_image) {
          // 处理product_image为数组的情况
          if (Array.isArray(product.product_image)) {
            const img = product.product_image[index] || product.product_image[0];
            return img.startsWith('http')
              ? img
              : `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${img}`
          }

          // 处理字符串情况
          return product.product_image.startsWith('http')
            ? product.product_image
            : `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${product.product_image}`
        }

        if (typeof product.images === 'string') {
          // 只有在确认是JSON字符串时才解析
          if (product.images.trim().startsWith('[') || product.images.trim().startsWith('{')) {
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
        console.error('解析图片失败:', e, product)
        images = []
      }

      if (!images || images.length === 0) {
        return '/public/default-avatar.png'
      }

      const image = images[index] || images[0]
      if (!image) {
        return '/public/default-avatar.png'
      }

      if (image.startsWith('http')) {
        return image
      }

      return `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${image}`
    },

    // 格式化价格
    formatPrice: () => (price) => {
      return Number(price).toFixed(2)
    }
  },

  actions: {
    // 重置过滤器
    resetFilters() {
      this.filters = {
        category_id: null,
        keyword: '',
        min_price: null,
        max_price: null,
        sort_by: 'created_at',
        sort_order: 'desc'
      }
    },

    // 设置过滤器
    setFilter(filter, value) {
      this.filters[filter] = value
    },

    // 获取产品分类
    async fetchCategories() {
      if (this.categories.length > 0) return this.categories

      try {
        this.loading = true
        const response = await productService.getCategories()
        this.categories = response.data || []
        return this.categories
      } catch (error) {
        console.error('获取产品分类失败:', error)
        messageService.error('获取产品分类失败')
        return []
      } finally {
        this.loading = false
      }
    },

    // 获取产品列表
    async fetchProducts(params = {}) {
      try {
        this.loading = true
        // 合并过滤器和传入的参数
        const queryParams = { ...this.filters, ...params }
        const response = await productService.getProducts(queryParams)

        if (response && response.data) {
          this.products = response.data.list || []
          this.pagination = response.data.pagination || {
            total: 0,
            page: 1,
            limit: 10
          }
        }

        return this.products
      } catch (error) {
        console.error('获取产品列表失败:', error)
        messageService.error('获取产品列表失败')
        return []
      } finally {
        this.loading = false
      }
    },

    // 获取产品详情
    async fetchProductById(id) {
      try {
        this.loading = true
        const response = await productService.getProductById(id)

        if (response && response.data) {
          this.product = response.data
        }

        return this.product
      } catch (error) {
        console.error(`获取产品(ID:${id})详情失败:`, error)
        messageService.error('获取产品详情失败')
        return null
      } finally {
        this.loading = false
      }
    },

    // 获取首页推荐产品
    async fetchFeaturedProducts(limit = 6) {
      try {
        this.loading = true
        const response = await productService.getFeaturedProducts(limit)

        if (response && response.data) {
          this.featuredProducts = response.data
        }

        return this.featuredProducts
      } catch (error) {
        console.error('获取推荐产品失败:', error)
        messageService.error('获取推荐产品失败')
        return []
      } finally {
        this.loading = false
      }
    },

    // 获取用户发布的产品
    async fetchUserProducts(params = {}) {
      try {
        this.loading = true
        const response = await productService.getUserProducts(params)

        // 检查response是否存在且包含data属性
        if (response && response.data) {
          return {
            list: response.data.list || [],
            pagination: response.data.pagination || {
              total: 0,
              page: 1,
              limit: 10
            }
          }
        } else {
          console.error('获取用户产品列表返回格式不正确:', response)
          return { list: [], pagination: { total: 0, page: 1, limit: 10 } }
        }
      } catch (error) {
        console.error('获取用户产品列表失败:', error)
        messageService.error('获取您发布的产品失败')
        return { list: [], pagination: { total: 0, page: 1, limit: 10 } }
      } finally {
        this.loading = false
      }
    },

    // 发布产品
    async createProduct(formData) {
      try {
        this.loading = true
        const response = await productService.createProduct(formData)
        messageService.success('产品发布成功')
        return response
      } catch (error) {
        console.error('发布产品失败:', error)
        messageService.error(error.response?.data?.message || '发布产品失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新产品
    async updateProduct(id, formData) {
      try {
        this.loading = true
        const response = await productService.updateProduct(id, formData)
        messageService.success('产品更新成功')
        return response
      } catch (error) {
        console.error(`更新产品(ID:${id})失败:`, error)
        messageService.error(error.response?.data?.message || '更新产品失败')
        throw error
      } finally {
        this.loading = false
      }
    },

    // 删除产品
    async deleteProduct(id) {
      try {
        this.loading = true
        await productService.deleteProduct(id)
        messageService.success('产品已删除')
        return true
      } catch (error) {
        console.error(`删除产品(ID:${id})失败:`, error)
        messageService.error(error.response?.data?.message || '删除产品失败')
        return false
      } finally {
        this.loading = false
      }
    }
  }
})
