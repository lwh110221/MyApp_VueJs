<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-800">身份认证</h3>
      <button
        v-if="availableTypes.length > 0"
        @click="showApplyForm = !showApplyForm"
        class="text-blue-500 hover:text-blue-700 flex items-center text-sm"
      >
        {{ showApplyForm ? '取消申请' : '申请认证' }}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 ml-1"
          :class="{'transform rotate-180': showApplyForm}"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-6">
      <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- 已有身份显示 -->
    <div v-else-if="identities.length > 0" class="space-y-3">
      <div v-for="(identity, index) in identities" :key="index" class="flex items-center p-3 bg-gray-50 rounded-lg">
        <IdentityBadge :identity="identity" class="mr-2" />
        <div class="ml-2">
          <p class="text-sm text-gray-600">认证时间: {{ formatDate(identity.certification_time) }}</p>
          <p v-if="identity.expiration_time" class="text-sm text-gray-600">
            有效期至: {{ formatDate(identity.expiration_time) }}
          </p>
        </div>
      </div>
    </div>

    <!-- 无身份提示 -->
    <div v-else class="text-center py-4 text-gray-500">
      您暂无认证身份
    </div>

    <!-- 申请认证表单 -->
    <div v-if="showApplyForm" class="mt-4 border-t pt-4">
      <h4 class="text-lg font-medium text-gray-700 mb-3">申请身份认证</h4>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">选择身份类型</label>
        <select
          v-model="applyForm.identityType"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="applyLoading"
        >
          <option value="">请选择身份类型</option>
          <option
            v-for="type in availableTypes"
            :key="type.code"
            :value="type.code"
          >
            {{ type.name }}
          </option>
        </select>
      </div>

      <div v-if="selectedType" class="mb-4">
        <div class="text-sm text-gray-600 mb-2">
          认证要求: {{ selectedType.requirements?.description || '无特殊要求' }}
        </div>

        <div v-for="(field, index) in selectedType.requirements?.requiredFields || []" :key="index" class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ getFieldLabel(field) }}
          </label>
          <input
            v-model="applyForm.certificationData[field]"
            type="text"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :placeholder="`请输入${getFieldLabel(field)}`"
            :disabled="applyLoading"
          />
        </div>
      </div>

      <div class="flex justify-end space-x-2 mt-4">
        <button
          @click="showApplyForm = false"
          class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
          :disabled="applyLoading"
        >
          取消
        </button>
        <button
          @click="submitApplication"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          :disabled="!canSubmit || applyLoading"
        >
          {{ applyLoading ? '提交中...' : '提交申请' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useIdentityStore } from '../stores/identity'
import { ref, computed, onMounted, watch } from 'vue'
import IdentityBadge from './IdentityBadge.vue'

export default {
  name: 'IdentityCard',
  components: {
    IdentityBadge
  },
  setup() {
    const identityStore = useIdentityStore()

    const showApplyForm = ref(false)
    const applyForm = ref({
      identityType: '',
      certificationData: {}
    })

    // 计算属性
    const loading = computed(() => identityStore.identitiesLoading || identityStore.typesLoading)
    const applyLoading = computed(() => identityStore.applyLoading)
    const identities = computed(() => identityStore.userIdentities || [])
    const availableTypes = computed(() => identityStore.availableCertificationTypes || [])
    const selectedType = computed(() => {
      if (!applyForm.value.identityType) return null
      return Array.isArray(identityStore.identityTypes) ?
        identityStore.identityTypes.find(type => type.code === applyForm.value.identityType) : null
    })
    const canSubmit = computed(() => {
      if (!applyForm.value.identityType) return false
      if (!selectedType.value) return false

      // 检查是否填写了所有必填字段
      const requiredFields = selectedType.value?.requirements?.requiredFields || []
      return requiredFields.every(field =>
        applyForm.value.certificationData[field] &&
        applyForm.value.certificationData[field].trim() !== ''
      )
    })

    // 获取数据
    const fetchData = async () => {
      try {
        await Promise.all([
          identityStore.fetchIdentityTypes(),
          identityStore.fetchUserIdentities()
        ])
      } catch (error) {
        console.error('获取身份数据失败:', error)
      }
    }

    // 提交申请
    const submitApplication = async () => {
      if (!canSubmit.value || applyLoading.value) return

      try {
        await identityStore.applyCertification({
          identityType: applyForm.value.identityType,
          certificationData: applyForm.value.certificationData
        })

        // 重置表单
        applyForm.value = {
          identityType: '',
          certificationData: {}
        }

        // 刷新用户身份
        await identityStore.fetchUserIdentities()

        // 关闭表单
        showApplyForm.value = false
      } catch (error) {
        console.error('提交认证申请失败:', error)
      }
    }

    // 获取字段显示名称
    const getFieldLabel = (field) => {
      const fieldMap = {
        idCard: '身份证号',
        landCertificate: '土地证明',
        businessLicense: '营业执照号',
        foodPermit: '食品经营许可证',
        professionalCert: '职称证书',
        workProof: '工作证明'
      }
      return fieldMap[field] || field
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '永久有效'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }

    // 监听身份类型变化，重置认证数据
    watch(() => applyForm.value.identityType, (newType) => {
      applyForm.value.certificationData = {}
    })

    onMounted(() => {
      fetchData()
    })

    return {
      identityStore,
      showApplyForm,
      applyForm,
      loading,
      applyLoading,
      identities,
      availableTypes,
      selectedType,
      canSubmit,
      submitApplication,
      getFieldLabel,
      formatDate
    }
  }
}
</script>
