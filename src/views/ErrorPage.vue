<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-800 mb-4">{{ errorCode }}</h1>
      <p class="text-xl text-gray-600 mb-4">{{ errorMessage }}</p>
      <p class="text-gray-500 mb-8">{{ subMessage }}</p>
      <div class="space-x-4">
        <button
          @click="$router.go(-1)"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
        >
          返回上一页
        </button>
        <router-link
          to="/"
          class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-block"
        >
          返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorPage',
  props: {
    errorCode: {
      type: [String, Number],
      default: '500'
    },
    errorMessage: {
      type: String,
      default: '服务器错误'
    },
    subMessage: {
      type: String,
      default: '抱歉，服务器出现了一些问题'
    }
  }
}
</script>

