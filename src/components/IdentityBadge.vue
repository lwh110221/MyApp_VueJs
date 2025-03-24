<template>
  <span
    v-if="identity"
    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    :class="badgeClasses"
  >
    {{ displayName }}
  </span>
</template>

<script>
export default {
  name: 'IdentityBadge',
  props: {
    identity: {
      type: Object,
      required: true
    }
  },
  computed: {
    displayName() {
      // 尝试从不同的可能的数据结构中获取名称
      if (this.identity.typeInfo?.name) {
        return this.identity.typeInfo.name;
      }
      if (this.identity.type_name) {
        return this.identity.type_name;
      }
      if (this.identity.name) {
        return this.identity.name;
      }
      return '未知身份';
    },
    typeCode() {
      // 尝试从不同的可能的数据结构中获取类型代码
      if (this.identity.identity_type) {
        return this.identity.identity_type;
      }
      if (this.identity.type_code) {
        return this.identity.type_code;
      }
      if (this.identity.code) {
        return this.identity.code;
      }
      return 'UNKNOWN';
    },
    badgeClasses() {
      // 根据不同身份类型使用不同颜色
      switch (this.typeCode) {
        case 'EXPERT':
          return 'bg-green-100 text-green-800';
        case 'FARMER':
          return 'bg-blue-100 text-blue-800';
        case 'DEALER':
          return 'bg-purple-100 text-purple-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  }
}
</script>
