<template>
  <div v-if="identities && identities.length > 0" class="flex flex-wrap gap-1 mt-2">
    <IdentityBadge
      v-for="identity in identities"
      :key="identity.id"
      :identity="identity"
    />
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
      type: Array,
      default: () => []
    }
  }
}
</script>
