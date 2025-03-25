<template>
  <div class="product-form-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">{{ isEdit ? '编辑产品' : '发布新产品' }}</h1>
        <p class="page-subtitle">{{ isEdit ? '更新您的产品信息' : '在此填写您要发布的产品信息' }}</p>
      </div>

      <div class="form-container">
        <form @submit.prevent="submitForm" class="product-form">
          <!-- 基本信息 -->
          <div class="form-section">
            <h2 class="section-title">基本信息</h2>

            <div class="form-field">
              <label for="title">产品名称 <span class="required">*</span></label>
              <input
                type="text"
                id="title"
                v-model="form.title"
                required
                placeholder="输入产品名称"
              >
              <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
            </div>

            <div class="form-field">
              <label for="category">产品分类 <span class="required">*</span></label>
              <select
                id="category"
                v-model="form.category_id"
                required
              >
                <option value="">请选择分类</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
              <span v-if="errors.category_id" class="error-message">{{ errors.category_id }}</span>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label for="price">价格 (¥) <span class="required">*</span></label>
                <input
                  type="number"
                  id="price"
                  v-model="form.price"
                  required
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                >
                <span v-if="errors.price" class="error-message">{{ errors.price }}</span>
              </div>

              <div class="form-field">
                <label for="original_price">原价 (¥)</label>
                <input
                  type="number"
                  id="original_price"
                  v-model="form.original_price"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label for="stock">库存数量 <span class="required">*</span></label>
                <input
                  type="number"
                  id="stock"
                  v-model="form.stock"
                  required
                  min="1"
                  placeholder="1"
                >
                <span v-if="errors.stock" class="error-message">{{ errors.stock }}</span>
              </div>

              <div class="form-field">
                <label for="unit">计量单位 <span class="required">*</span></label>
                <input
                  type="text"
                  id="unit"
                  v-model="form.unit"
                  required
                  placeholder="如：公斤、箱、包"
                >
                <span v-if="errors.unit" class="error-message">{{ errors.unit }}</span>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="form-section">
            <h2 class="section-title">详细信息</h2>

            <div class="form-field">
              <label for="description">产品描述 <span class="required">*</span></label>
              <textarea
                id="description"
                v-model="form.description"
                rows="5"
                required
                placeholder="详细描述您的产品特点、适用人群等信息"
              ></textarea>
              <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
            </div>

            <div class="form-field">
              <label for="origin">产地</label>
              <input
                type="text"
                id="origin"
                v-model="form.origin"
                placeholder="例如：山东青岛"
              >
            </div>
          </div>

          <!-- 产品属性 -->
          <div class="form-section">
            <h2 class="section-title">产品属性</h2>
            <p class="section-subtitle">添加产品的特殊属性（如：品种、等级、保质期等）</p>

            <div class="attributes-container">
              <div
                v-for="(attribute, index) in form.attributes"
                :key="index"
                class="attribute-item"
              >
                <div class="attribute-row">
                  <input
                    type="text"
                    v-model="attribute.key"
                    placeholder="属性名称"
                    class="attribute-key"
                  />
                  <input
                    type="text"
                    v-model="attribute.value"
                    placeholder="属性值"
                    class="attribute-value"
                  />
                  <button
                    type="button"
                    class="remove-attribute-btn"
                    @click="removeAttribute(index)"
                  >
                    <i class="fa-solid fa-times"></i>
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="add-attribute-btn"
                @click="addAttribute"
              >
                <i class="fa-solid fa-plus"></i> 添加属性
              </button>
            </div>
          </div>

          <!-- 附加选项 -->
          <div class="form-section">
            <h2 class="section-title">批发设置</h2>

            <div class="form-field">
              <div class="checkbox-field">
                <input
                  type="checkbox"
                  id="is_bulk"
                  v-model="form.is_bulk"
                >
                <label for="is_bulk">支持批量订购</label>
              </div>
            </div>

            <div class="form-field" v-if="form.is_bulk">
              <label for="min_order_quantity">最低起订数量</label>
              <input
                type="number"
                id="min_order_quantity"
                v-model="form.min_order_quantity"
                min="1"
                placeholder="1"
              >
              <span v-if="errors.min_order_quantity" class="error-message">{{ errors.min_order_quantity }}</span>
            </div>
          </div>

          <!-- 产品图片 -->
          <div class="form-section">
            <h2 class="section-title">产品图片</h2>
            <p class="section-subtitle">上传清晰的产品图片可以提高销量 (至少上传1张)</p>

            <div class="image-uploader">
              <div
                v-for="(image, index) in previewImages"
                :key="index"
                class="image-preview"
              >
                <img :src="image.url" alt="预览图片">
                <button
                  type="button"
                  class="remove-image-btn"
                  @click="removeImage(index)"
                >
                  <i class="fa-solid fa-times"></i>
                </button>
              </div>

              <div v-if="previewImages.length < 5" class="upload-placeholder">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  @change="handleImageUpload"
                  ref="fileInput"
                  :required="previewImages.length === 0 && !isEdit"
                >
                <div class="placeholder-content">
                  <i class="fa-solid fa-cloud-upload-alt"></i>
                  <span>点击上传图片</span>
                </div>
              </div>
            </div>

            <span v-if="errors.images" class="error-message">{{ errors.images }}</span>
          </div>

          <!-- 表单按钮 -->
          <div class="form-actions">
            <button
              type="button"
              class="cancel-btn"
              @click="goBack"
            >
              取消
            </button>
            <button
              type="submit"
              class="submit-btn"
              :disabled="submitting"
            >
              <i v-if="submitting" class="fa-solid fa-spinner fa-spin"></i>
              {{ isEdit ? '保存修改' : '发布产品' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores'
import { messageService } from '@/api'

export default {
  name: 'CreateProduct',

  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    productId: {
      type: Number,
      default: null
    }
  },

  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const productStore = useProductStore()
    const fileInput = ref(null)

    // 表单数据
    const form = reactive({
      title: '',
      description: '',
      category_id: '',
      price: '',
      original_price: '',
      stock: 1,
      unit: '公斤',
      origin: '',
      is_bulk: false,
      min_order_quantity: 1,
      images: [],
      attributes: []
    })

    // 图片预览
    const previewImages = ref([])

    // 表单状态
    const submitting = ref(false)
    const errors = reactive({})

    // 获取分类列表
    const categories = computed(() => {
      return productStore.categories || []
    })

    // 加载产品数据（编辑模式）
    const loadProductData = async () => {
      try {
        const productId = props.productId || parseInt(route.params.id)
        if (!productId) return

        // 获取产品详情
        await productStore.fetchProductById(productId)
        const product = productStore.product

        if (!product) {
          messageService.error('找不到该产品')
          router.push('/my-products')
          return
        }

        console.log('加载编辑产品数据:', product)

        // 填充表单数据
        form.title = product.title || product.name  // 兼容后端可能返回name或title
        form.description = product.description
        form.category_id = product.category_id
        form.price = product.price
        form.original_price = product.original_price || ''
        form.stock = product.stock
        form.unit = product.unit
        form.origin = product.location || ''  // 使用location字段
        form.is_bulk = product.is_bulk || false
        form.min_order_quantity = product.min_order_quantity || 1

        // 处理attributes
        form.attributes = []
        if (product.attributes) {
          try {
            const attrs = typeof product.attributes === 'string'
              ? JSON.parse(product.attributes)
              : product.attributes;

            // 将对象转换为键值对数组
            if (attrs && typeof attrs === 'object') {
              Object.keys(attrs).forEach(key => {
                form.attributes.push({
                  key: key,
                  value: attrs[key]
                });
              });
            }
          } catch (e) {
            console.error('解析产品属性失败:', e);
          }
        }

        // 处理图片
        let images = []
        if (product.images) {
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
            }
          } catch (err) {
            console.error('解析产品图片失败:', err)
            images = []
          }
        }

        // 清空预览图片列表并添加图片
        previewImages.value = []
        if (images && images.length > 0) {
          images.forEach((image, index) => {
            previewImages.value.push({
              url: productStore.getProductImage({images: [image]}, 0),  // 使用getter方法获取完整URL
              file: null,
              exists: true,
              path: image
            })
          })
        }
      } catch (error) {
        console.error('加载产品数据失败:', error)
        messageService.error('加载产品数据失败')
      }
    }

    // 处理图片上传
    const handleImageUpload = (event) => {
      const files = event.target.files

      if (!files || files.length === 0) return

      // 检查图片总数
      if (previewImages.value.length + files.length > 5) {
        messageService.error('最多只能上传5张图片')
        fileInput.value.value = ''
        return
      }

      // 预览上传的图片
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // 验证文件类型
        if (!file.type.match('image.*')) {
          messageService.error('请上传图片文件')
          continue
        }

        // 验证文件大小 (最大5MB)
        if (file.size > 5 * 1024 * 1024) {
          messageService.error('图片大小不能超过5MB')
          continue
        }

        const reader = new FileReader()

        reader.onload = (e) => {
          previewImages.value.push({
            url: e.target.result,
            file: file,
            exists: false
          })
        }

        reader.readAsDataURL(file)
      }

      // 清空文件输入框，以便可以重新选择相同的文件
      fileInput.value.value = ''
    }

    // 移除图片
    const removeImage = (index) => {
      previewImages.value.splice(index, 1)
    }

    // 表单校验
    const validateForm = () => {
      errors.title = form.title ? '' : '请输入产品名称'
      errors.category_id = form.category_id ? '' : '请选择产品分类'
      errors.price = form.price > 0 ? '' : '请输入有效的价格'
      errors.stock = form.stock > 0 ? '' : '请输入有效的库存数量'
      errors.unit = form.unit ? '' : '请输入计量单位'
      errors.description = form.description ? '' : '请输入产品描述'

      if (previewImages.value.length === 0 && !props.isEdit) {
        errors.images = '请至少上传一张产品图片'
      } else {
        errors.images = ''
      }

      // 批发设置校验
      if (form.is_bulk && (!form.min_order_quantity || form.min_order_quantity < 1)) {
        errors.min_order_quantity = '批量订购的最低起订数量必须大于或等于1'
      } else {
        errors.min_order_quantity = ''
      }

      // 检查是否有错误
      return !Object.values(errors).some(error => error)
    }

    // 提交表单
    const submitForm = async () => {
      // 验证表单
      if (!validateForm()) {
        messageService.error('请完善表单信息')
        return
      }

      try {
        submitting.value = true

        // 准备FormData
        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('description', form.description)
        formData.append('category_id', form.category_id)
        formData.append('price', form.price)
        formData.append('stock', form.stock)
        formData.append('unit', form.unit)

        if (form.original_price) {
          formData.append('original_price', form.original_price)
        }

        // 产地保存到location字段
        if (form.origin) {
          formData.append('location', form.origin)
        }

        // 批发设置
        formData.append('is_bulk', form.is_bulk ? 1 : 0)
        if (form.is_bulk) {
          formData.append('min_order_quantity', form.min_order_quantity)
        }

        // 处理图片
        // 新上传的图片
        const newImages = previewImages.value.filter(img => !img.exists)
        newImages.forEach(img => {
          if (img.file) {
            formData.append('images', img.file)
          }
        })

        // 编辑模式下，处理已有图片
        if (props.isEdit) {
          const existingImagePaths = previewImages.value
            .filter(img => img.exists)
            .map(img => img.path)

          formData.append('existing_images', JSON.stringify(existingImagePaths))
        }

        // 处理attributes
        if (form.attributes && form.attributes.length > 0) {
          // 过滤掉空的属性
          const validAttributes = form.attributes.filter(attr =>
            attr.key.trim() !== '' && attr.value.trim() !== ''
          );

          // 将数组转换为对象格式
          if (validAttributes.length > 0) {
            const attributesObj = {};
            validAttributes.forEach(attr => {
              attributesObj[attr.key.trim()] = attr.value.trim();
            });

            formData.append('attributes', JSON.stringify(attributesObj));
          }
        } else {
          formData.append('attributes', JSON.stringify({}));
        }

        // 保存数据
        let response

        if (props.isEdit) {
          // 更新产品
          const productId = props.productId || parseInt(route.params.id)
          response = await productStore.updateProduct(productId, formData)
        } else {
          // 创建新产品
          response = await productStore.createProduct(formData)
        }

        // 处理成功
        if (response) {
          messageService.success(props.isEdit ? '产品更新成功' : '产品发布成功')
          router.push('/my-products')
        }
      } catch (error) {
        console.error(props.isEdit ? '更新产品失败:' : '发布产品失败:', error)
        messageService.error(error.response?.data?.message || (props.isEdit ? '更新产品失败' : '发布产品失败'))
      } finally {
        submitting.value = false
      }
    }

    // 返回上一页
    const goBack = () => {
      router.back()
    }

    // 添加属性
    const addAttribute = () => {
      form.attributes.push({ key: '', value: '' })
    }

    // 移除属性
    const removeAttribute = (index) => {
      form.attributes.splice(index, 1)
    }

    onMounted(async () => {
      // 获取分类列表
      if (categories.value.length === 0) {
        await productStore.fetchCategories()
      }

      // 编辑模式下，加载产品数据
      if (props.isEdit) {
        loadProductData()
      }
    })

    return {
      form,
      categories,
      previewImages,
      submitting,
      errors,
      fileInput,
      handleImageUpload,
      removeImage,
      submitForm,
      goBack,
      addAttribute,
      removeAttribute
    }
  }
}
</script>

<style scoped>
.product-form-page {
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
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #666;
}

.form-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.form-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row .form-field {
  flex: 1;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #ff6b6b;
}

input[type="text"],
input[type="number"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="text"]:focus,
input[type="number"]:focus,
input[type="date"]:focus,
select:focus,
textarea:focus {
  border-color: #4caf50;
  outline: none;
}

.error-message {
  display: block;
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 5px;
}

.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.image-preview {
  width: 150px;
  height: 150px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  border: 1px solid #ddd;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ff6b6b;
  transition: background-color 0.3s;
}

.remove-image-btn:hover {
  background-color: rgba(255, 255, 255, 1);
}

.upload-placeholder {
  width: 150px;
  height: 150px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #4caf50;
}

.upload-placeholder input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #777;
}

.placeholder-content i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 30px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s, transform 0.2s;
}

.cancel-btn {
  background-color: #f1f1f1;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e5e5e5;
}

.submit-btn {
  background-color: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #388e3c;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .form-container {
    padding: 20px;
  }

  .cancel-btn,
  .submit-btn {
    padding: 10px 20px;
  }
}

.attributes-container {
  width: 100%;
}

.attribute-item {
  margin-bottom: 10px;
}

.attribute-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.attribute-key {
  flex: 1;
  min-width: 0;
}

.attribute-value {
  flex: 2;
  min-width: 0;
}

.remove-attribute-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-attribute-btn:hover {
  background-color: #e53935;
}

.add-attribute-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-attribute-btn:hover {
  background-color: #388e3c;
}
</style>
