<template>
  <Transition name="message">
    <div
      v-if="visible"
      :class="[
        'fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50',
        typeClasses[type]
      ]"
    >
      {{ message }}
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'GlobalMessage',
  data() {
    return {
      visible: false,
      message: '',
      type: 'info',
      timer: null,
      typeClasses: {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-white'
      }
    }
  },
  methods: {
    show(message, type = 'info', duration = 3000) {
      this.message = message
      this.type = type
      this.visible = true

      if (this.timer) {
        clearTimeout(this.timer)
      }

      this.timer = setTimeout(() => {
        this.visible = false
      }, duration)
    }
  },
  beforeUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }
}
</script>

<style scoped>
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
