<template>
  <div v-if="displayIdentities.length > 0" class="flex flex-wrap gap-1 mt-2">
    <IdentityBadge
      v-for="identity in displayIdentities"
      :key="identity.id || index"
      :identity="identity"
    />
  </div>
  <div v-else-if="showEmptyMessage" class="text-gray-500 text-sm italic mt-2">
    该用户暂无身份认证
  </div>
</template>

<script>
import IdentityBadge from './IdentityBadge.vue'

export default {
  name: 'UserIdentities',
  components: {
    IdentityBadge
  },
  props: {
    identities: {
      type: [Array, Object],
      default: () => []
    },
    showEmptyMessage: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    displayIdentities() {
      // 确保identities是数组
      if (!this.identities) return [];
      return Array.isArray(this.identities) ? this.identities : [];
    }
  }
}
</script>
