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
      if (!product || !product.images || !product.images.length) {
        return '/images/default-product.jpg'
      }

      const image = product.images[index]
      if (!image) return '/images/default-product.jpg'

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

        if (response && response.data) {
          return {
            list: response.data.list || [],
            pagination: response.data.pagination || {
              total: 0,
              page: 1,
              limit: 10
            }
          }
        }

        return { list: [], pagination: { total: 0, page: 1, limit: 10 } }
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
