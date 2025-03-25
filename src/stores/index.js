import { useAuthStore } from './auth'
import { useProductStore } from './product'
import { useCartStore } from './cart'
import { useOrderStore } from './order'
import { useUserStore } from './user'
import { useIdentityStore } from './identity'
import { useMomentStore } from './moment'
import { useHelpStore } from './help'

export {
  useAuthStore,
  useProductStore,
  useCartStore,
  useOrderStore,
  useUserStore,
  useIdentityStore,
  useMomentStore,
  useHelpStore
}

// 导出一个辅助函数，用于检查用户是否已认证
export const isAuthenticated = () => {
  const authStore = useAuthStore()
  return authStore.isLoggedIn
}

// 导出默认对象，包含所有store的访问方法
export default {
  getters: {
    'auth/isAuthenticated': isAuthenticated
  }
}
