<template>
  <div class="product-form">
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">产品名称 <span class="required">*</span></label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          required
          placeholder="请输入产品名称"
          :class="{ 'error': errors.name }"
        />
        <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
      </div>

      <div class="form-group">
        <label for="category">产品分类 <span class="required">*</span></label>
        <select
          id="category"
          v-model="form.category_id"
          required
          :class="{ 'error': errors.category_id }"
        >
          <option value="" disabled>请选择产品分类</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <div v-if="errors.category_id" class="error-message">{{ errors.category_id }}</div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="price">价格 (¥) <span class="required">*</span></label>
          <input
            type="number"
            id="price"
            v-model="form.price"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
            :class="{ 'error': errors.price }"
          />
          <div v-if="errors.price" class="error-message">{{ errors.price }}</div>
        </div>

        <div class="form-group">
          <label for="originalPrice">原价 (可选，¥)</label>
          <input
            type="number"
            id="originalPrice"
            v-model="form.original_price"
            min="0"
            step="0.01"
            placeholder="0.00"
            :class="{ 'error': errors.original_price }"
          />
          <div v-if="errors.original_price" class="error-message">{{ errors.original_price }}</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="stock">库存 <span class="required">*</span></label>
          <input
            type="number"
            id="stock"
            v-model="form.stock"
            required
            min="0"
            placeholder="0"
            :class="{ 'error': errors.stock }"
          />
          <div v-if="errors.stock" class="error-message">{{ errors.stock }}</div>
        </div>

        <div class="form-group">
          <label for="unit">单位 <span class="required">*</span></label>
          <input
            type="text"
            id="unit"
            v-model="form.unit"
            required
            placeholder="如：斤、箱、个"
            :class="{ 'error': errors.unit }"
          />
          <div v-if="errors.unit" class="error-message">{{ errors.unit }}</div>
        </div>
      </div>

      <div class="form-group">
        <label for="description">产品描述 <span class="required">*</span></label>
        <textarea
          id="description"
          v-model="form.description"
          required
          placeholder="请详细描述您的产品，包括特点、产地、种植方式等"
          rows="5"
          :class="{ 'error': errors.description }"
        ></textarea>
        <div v-if="errors.description" class="error-message">{{ errors.description }}</div>
      </div>

      <div class="form-group">
        <label>产品图片 <span class="required">*</span></label>
        <div class="image-upload-container">
          <!-- 已上传图片预览区域 -->
          <div class="image-preview-list">
            <div
              v-for="(image, index) in imagePreviewList"
              :key="index"
              class="image-preview-item"
            >
              <img :src="image" alt="产品图片预览" />
              <button
                type="button"
                class="remove-image-btn"
                @click="removeImage(index)"
              >
                <i class="fa-solid fa-times"></i>
              </button>
            </div>

            <!-- 上传按钮 -->
            <div
              v-if="imagePreviewList.length < 5"
              class="image-upload-button"
              @click="triggerFileInput"
            >
              <i class="fa-solid fa-plus"></i>
              <span>上传图片</span>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileChange"
                accept="image/*"
                multiple
                class="file-input"
              />
            </div>
          </div>
          <div class="image-upload-hint">
            支持 jpg、png、jpeg 格式，最多上传5张图片
          </div>
          <div v-if="errors.images" class="error-message">{{ errors.images }}</div>
        </div>
      </div>

      <div class="form-group">
        <label for="origin">产地 <span class="required">*</span></label>
        <input
          type="text"
          id="origin"
          v-model="form.origin"
          required
          placeholder="请输入产品产地"
          :class="{ 'error': errors.origin }"
        />
        <div v-if="errors.origin" class="error-message">{{ errors.origin }}</div>
      </div>

      <div class="form-group">
        <label>批发设置</label>
        <div class="bulk-settings">
          <div class="checkbox-wrapper">
            <input
              type="checkbox"
              id="is_bulk"
              v-model="form.is_bulk"
            />
            <label for="is_bulk">支持批量订购</label>
          </div>

          <div v-if="form.is_bulk" class="min-order-quantity">
            <label for="min_order_quantity">最低起订数量</label>
            <input
              type="number"
              id="min_order_quantity"
              v-model="form.min_order_quantity"
              min="1"
              placeholder="1"
              :class="{ 'error': errors.min_order_quantity }"
            />
            <div v-if="errors.min_order_quantity" class="error-message">{{ errors.min_order_quantity }}</div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>产品属性</label>
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

      <div class="form-button-group">
        <button type="button" class="cancel-btn" @click="$emit('cancel')">取消</button>
        <button type="submit" class="submit-btn" :disabled="loading">
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          {{ isEditing ? '更新产品' : '发布产品' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useProductStore } from '@/stores'

export default {
  name: 'ProductForm',

  props: {
    product: {
      type: Object,
      default: () => null
    }
  },

  emits: ['submit', 'cancel'],

  setup(props, { emit }) {
    const productStore = useProductStore()
    const loading = ref(false)
    const errors = ref({})
    const fileInput = ref(null)

    // 是否是编辑模式
    const isEditing = ref(!!props.product)

    // 表单数据
    const form = reactive({
      name: '',
      category_id: '',
      price: '',
      original_price: '',
      stock: '',
      unit: '',
      description: '',
      images: [],
      origin: '',
      is_bulk: false,
      min_order_quantity: 1,
      attributes: []
    })

    // 图片预览列表
    const imagePreviewList = ref([])

    // 原始图片列表（用于编辑模式）
    const originalImages = ref([])

    // 分类列表
    const categories = ref([])

    // 加载分类数据
    const loadCategories = async () => {
      try {
        categories.value = await productStore.fetchCategories()
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    }

    // 如果存在product属性，加载产品数据
    const loadProductData = () => {
      if (!props.product) return

      // 基本信息
      Object.keys(form).forEach(key => {
        if (key !== 'images' && key !== 'origin' && key !== 'is_bulk' && key !== 'min_order_quantity' && props.product[key] !== undefined) {
          form[key] = props.product[key]
        }
      })

      // 处理产地 (location字段)
      form.origin = props.product.location || ''

      // 批发设置
      form.is_bulk = props.product.is_bulk === 1 || props.product.is_bulk === true
      form.min_order_quantity = props.product.min_order_quantity || 1

      // 处理attributes
      form.attributes = []
      if (props.product.attributes) {
        try {
          const attrs = typeof props.product.attributes === 'string'
            ? JSON.parse(props.product.attributes)
            : props.product.attributes;

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
      if (props.product.images && props.product.images.length > 0) {
        originalImages.value = [...props.product.images]
        imagePreviewList.value = props.product.images.map(img => {
          if (img.startsWith('http')) {
            return img
          }
          return `${import.meta.env.VITE_BASE_API_URL.replace('/api', '')}${img}`
        })
      }
    }

    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value.click()
    }

    // 处理文件选择
    const handleFileChange = (event) => {
      const files = event.target.files
      if (!files.length) return

      const newFiles = Array.from(files)
      const totalImages = imagePreviewList.value.length + newFiles.length

      // 检查是否超过最大图片数量
      if (totalImages > 5) {
        errors.value.images = `最多只能上传5张图片，当前已选择${totalImages}张`
        return
      }

      // 检查文件格式
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
      const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type))
      if (invalidFiles.length > 0) {
        errors.value.images = '只支持JPG、PNG格式的图片'
        return
      }

      // 清除错误
      errors.value.images = null

      // 添加到文件列表
      newFiles.forEach(file => {
        form.images.push(file)

        // 创建预览
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreviewList.value.push(e.target.result)
        }
        reader.readAsDataURL(file)
      })

      // 清空input，确保可以再次选择相同文件
      event.target.value = ''
    }

    // 移除图片
    const removeImage = (index) => {
      // 检查是否是原始图片
      const isOriginalImage = index < originalImages.value.length

      if (isOriginalImage) {
        // 记录要删除的原始图片
        originalImages.value.splice(index, 1)
      } else {
        // 调整新上传图片的索引
        const newImageIndex = index - originalImages.value.length
        form.images.splice(newImageIndex, 1)
      }

      // 移除预览
      imagePreviewList.value.splice(index, 1)
    }

    // 添加属性
    const addAttribute = () => {
      form.attributes.push({ key: '', value: '' })
    }

    // 移除属性
    const removeAttribute = (index) => {
      form.attributes.splice(index, 1)
    }

    // 验证表单
    const validateForm = () => {
      const newErrors = {}

      if (!form.name.trim()) {
        newErrors.name = '请输入产品名称'
      }

      if (!form.category_id) {
        newErrors.category_id = '请选择产品分类'
      }

      if (!form.price || parseFloat(form.price) <= 0) {
        newErrors.price = '请输入有效的价格'
      }

      if (form.original_price && parseFloat(form.original_price) < parseFloat(form.price)) {
        newErrors.original_price = '原价不能低于现价'
      }

      if (!form.stock || parseInt(form.stock) < 0) {
        newErrors.stock = '请输入有效的库存数量'
      }

      if (!form.unit.trim()) {
        newErrors.unit = '请输入产品单位'
      }

      if (!form.description.trim()) {
        newErrors.description = '请输入产品描述'
      }

      if (!form.origin.trim()) {
        newErrors.origin = '请输入产品产地'
      }

      // 批发设置验证
      if (form.is_bulk && (!form.min_order_quantity || form.min_order_quantity < 1)) {
        newErrors.min_order_quantity = '批量订购的最低起订数量必须大于或等于1'
      }

      // 图片验证
      if (!isEditing.value && (!form.images || form.images.length === 0) && imagePreviewList.value.length === 0) {
        newErrors.images = '请至少上传一张产品图片'
      }

      errors.value = newErrors
      return Object.keys(newErrors).length === 0
    }

    // 提交表单
    const submitForm = () => {
      if (!validateForm()) return

      try {
        loading.value = true

        // 构建表单数据
        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('category_id', form.category_id)
        formData.append('price', form.price)
        formData.append('stock', form.stock)
        formData.append('unit', form.unit)
        formData.append('description', form.description)

        // 产地保存到location字段
        if (form.origin) {
          formData.append('location', form.origin)
        }

        if (form.original_price) {
          formData.append('original_price', form.original_price)
        }

        // 批发设置
        formData.append('is_bulk', form.is_bulk ? 1 : 0)
        if (form.is_bulk) {
          formData.append('min_order_quantity', form.min_order_quantity)
        }

        // 添加原始图片路径
        if (isEditing.value && originalImages.value.length > 0) {
          formData.append('keepImages', JSON.stringify(originalImages.value))
        }

        // 添加新上传的图片文件
        form.images.forEach(file => {
          formData.append('images', file)
        })

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

        emit('submit', formData)
      } finally {
        loading.value = false
      }
    }

    // 监听产品变化
    watch(() => props.product, () => {
      isEditing.value = !!props.product
      loadProductData()
    }, { deep: true })

    // 组件挂载时加载数据
    onMounted(() => {
      loadCategories()
      loadProductData()
    })

    return {
      form,
      loading,
      errors,
      categories,
      fileInput,
      imagePreviewList,
      isEditing,
      triggerFileInput,
      handleFileChange,
      removeImage,
      addAttribute,
      removeAttribute,
      submitForm
    }
  }
}
</script>

<style scoped>
.product-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
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
input[type="number"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
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

input.error,
select.error,
textarea.error {
  border-color: #ff6b6b;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 5px;
}

.image-upload-container {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 20px;
  background-color: #fafafa;
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}

.image-preview-item {
  width: 100px;
  height: 100px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-image-btn:hover {
  background-color: rgba(255, 0, 0, 0.7);
}

.image-upload-button {
  width: 100px;
  height: 100px;
  border: 2px dashed #4caf50;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4caf50;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.image-upload-button:hover {
  background-color: #e8f5e9;
}

.image-upload-button i {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.file-input {
  display: none;
}

.image-upload-hint {
  font-size: 0.85rem;
  color: #777;
  margin-top: 5px;
}

.bulk-settings {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 15px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.checkbox-wrapper input[type="checkbox"] {
  width: auto;
}

.min-order-quantity {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ddd;
}

.min-order-quantity label {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.form-button-group {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #555;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn {
  background-color: #4caf50;
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background-color: #388e3c;
}

.submit-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.attributes-container {
  width: 100%;
}

.attribute-item {
  margin-bottom: 10px;
  width: 100%;
}

.attribute-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.attribute-key {
  flex: 1;
}

.attribute-value {
  flex: 2;
}

.remove-attribute-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 0.85rem;
}

.add-attribute-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
}

.add-attribute-btn:hover {
  background-color: #388e3c;
}
</style>
