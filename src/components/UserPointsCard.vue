<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-800">我的积分</h3>
      <span class="text-2xl font-bold text-blue-600">{{ points.total || 0 }}</span>
    </div>

    <button
      @click="showRecords = !showRecords"
      class="text-blue-500 hover:text-blue-700 text-sm flex items-center"
    >
      {{ showRecords ? '收起积分记录' : '查看积分记录' }}
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" :class="{'transform rotate-180': showRecords}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="showRecords" class="mt-4">
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <div v-else-if="points.records && points.records.length > 0">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">积分</th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(record, index) in points.records" :key="index">
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ formatDate(record.created_at) }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ getPointTypeText(record.type) }}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm" :class="record.points > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ record.points > 0 ? '+' : '' }}{{ record.points }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{{ record.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页器 -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">
            共 {{ pagination.total || 0 }} 条记录
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1 || loading"
              class="px-3 py-1 rounded border"
              :class="pagination.page <= 1 ? 'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              上一页
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= Math.ceil(pagination.total / pagination.limit) || loading"
              class="px-3 py-1 rounded border"
              :class="pagination.page >= Math.ceil(pagination.total / pagination.limit) ? 'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-4 text-gray-500">
        暂无积分记录
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '../stores/user'
import { onMounted, ref, reactive, computed } from 'vue'

export default {
  name: 'UserPointsCard',
  setup() {
    const userStore = useUserStore()

    const showRecords = ref(false)
    const loading = computed(() => userStore.pointRecordsLoading)
    const points = computed(() => userStore.points)
    const pagination = computed(() => userStore.pagination.pointRecords)

    // 获取积分信息
    const fetchPoints = async () => {
      try {
        await userStore.fetchPoints()
      } catch (error) {
        console.error('获取积分失败:', error)
      }
    }

    // 获取积分记录
    const fetchPointRecords = async (page = 1, limit = 10) => {
      try {
        await userStore.fetchPointRecords({ page, limit })
      } catch (error) {
        console.error('获取积分记录失败:', error)
      }
    }

    // 切换页码
    const changePage = (page) => {
      if (page < 1 || page > Math.ceil(pagination.value.total / pagination.value.limit)) {
        return
      }
      fetchPointRecords(page, pagination.value.limit)
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未知'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }

    // 获取积分类型文本
    const getPointTypeText = (type) => {
      const typeMap = {
        1: '签到',
        2: '发帖',
        3: '评论',
        4: '被点赞',
        5: '系统奖励',
        6: '积分消费',
        7: '发布动态',
        8: '回答问题',
        9: '问题被采纳'
      }
      return typeMap[type] || '其他'
    }

    onMounted(() => {
      fetchPoints()
    })

    return {
      userStore,
      showRecords,
      loading,
      points,
      pagination,
      fetchPoints,
      fetchPointRecords,
      changePage,
      formatDate,
      getPointTypeText
    }
  }
}
</script>
