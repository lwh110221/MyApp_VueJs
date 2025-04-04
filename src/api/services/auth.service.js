import API from '../http'
import { AUTH_ENDPOINTS } from '../endpoints'

class AuthService {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.email - 邮箱
   * @param {string} credentials.password - 密码
   * @returns {Promise}
   */
  async login(credentials) {
    try {
      const response = await API.post(AUTH_ENDPOINTS.LOGIN, credentials)
      return response
    } catch (error) {
      // 处理特定的错误情况
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message
        if (errorMessage.includes('密码错误')) {
          throw new Error('密码错误，请重新输入')
        } else if (errorMessage.includes('不存在')) {
          throw new Error('该邮箱未注册，请先注册')
        }
      }
      throw error
    }
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @param {string} userData.captcha - 图形验证码
   * @param {string} userData.verificationCode - 邮箱验证码
   * @returns {Promise}
   */
  async register(userData) {
    try {
      console.log('发送注册请求数据:', userData)
      const response = await API.post(AUTH_ENDPOINTS.REGISTER, userData)
      return response
    } catch (error) {
      console.error('注册请求失败:', error.response?.data || error.message)
      // 处理特定的错误情况
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || ''
        if (errorMessage.includes('邮箱已被注册')) {
          throw new Error('该邮箱已被注册，请使用其他邮箱')
        } else if (errorMessage.includes('验证码')) {
          if (errorMessage.includes('图形验证码')) {
            throw new Error('图形验证码错误或已过期，请重新输入')
          } else {
            throw new Error('邮箱验证码错误或已过期，请重新获取验证码')
          }
        } else {
          throw new Error(errorMessage || '注册失败，请稍后再试')
        }
      }
      throw error
    }
  }

  /**
   * 修改密码
   * @param {Object} passwordData - 密码数据
   * @param {string} passwordData.oldPassword - 旧密码
   * @param {string} passwordData.newPassword - 新密码
   * @param {string} passwordData.captcha - 验证码
   * @returns {Promise}
   */
  async changePassword(passwordData) {
    return API.put(AUTH_ENDPOINTS.CHANGE_PASSWORD, passwordData)
  }

  /**
   * 获取用户信息
   * @returns {Promise<Object>} 用户信息对象
   */
  async getProfile() {
    try {
      const userData = await API.get(AUTH_ENDPOINTS.GET_PROFILE)
      console.log('Profile Response:', userData)

      return {
        id: userData?.id || '',
        username: userData?.username || '',
        email: userData?.email || '',
        bio: userData?.bio || '',
        points: userData?.points || 0,
        profile_picture: userData?.profile_picture || '',
        created_at: userData?.created_at || new Date().toISOString(),
        status: userData?.status
      }
    } catch (error) {
      console.error('Profile Error:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   * @param {Object} profileData - 用户信息
   * @param {string} [profileData.bio] - 个人简介
   * @returns {Promise}
   */
  async updateProfile(profileData) {
    return API.put(AUTH_ENDPOINTS.UPDATE_PROFILE, profileData)
  }

  /**
   * 更新用户头像
   * @param {FormData} formData - 包含头像文件的表单数据
   * @returns {Promise<Object>} 返回更新结果，包含 avatarUrl
   */
  async updateAvatar(formData) {
    try {
      console.log('Updating avatar with formData:', formData)
      const response = await API.put(AUTH_ENDPOINTS.UPDATE_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('Update avatar response:', response)
      return response
    } catch (error) {
      console.error('Update avatar error:', error)
      throw error
    }
  }

  /**
   * 获取验证码
   * @returns {string} 验证码图片URL
   */
  getCaptchaUrl() {
    const timestamp = new Date().getTime()
    return `${import.meta.env.VITE_BASE_API_URL}${AUTH_ENDPOINTS.GENERATE_CAPTCHA}?t=${timestamp}`
  }

  /**
   * 发送邮箱验证码
   * @param {string} email - 用户邮箱
   * @returns {Promise}
   */
  async sendEmailVerificationCode(email) {
    try {
      console.log('发送邮箱验证码:', { email })
      const response = await API.post(AUTH_ENDPOINTS.SEND_EMAIL_VERIFICATION, { email })
      return response
    } catch (error) {
      console.error('发送邮箱验证码错误:', error.response?.data || error.message)
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || ''
        if (errorMessage.includes('邮箱已被注册')) {
          throw new Error('该邮箱已被注册，请使用其他邮箱')
        } else if (errorMessage.includes('有效的邮箱')) {
          throw new Error('请提供有效的邮箱地址')
        }
      }
      throw error
    }
  }

  /**
   * 发送密码重置验证码
   * @param {string} email - 用户邮箱
   * @returns {Promise}
   */
  async sendPasswordResetCode(email) {
    try {
      console.log('发送密码重置验证码:', { email })
      const response = await API.post(AUTH_ENDPOINTS.SEND_RESET_CODE, { email })
      return response
    } catch (error) {
      console.error('发送密码重置验证码错误:', error.response?.data || error.message)
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || ''
        if (errorMessage.includes('有效的邮箱')) {
          throw new Error('请提供有效的邮箱地址')
        } else if (errorMessage.includes('未注册')) {
          throw new Error('该邮箱未注册')
        }
      }
      throw error
    }
  }

  /**
   * 使用验证码重置密码
   * @param {Object} resetData - 重置密码数据
   * @param {string} resetData.email - 邮箱
   * @param {string} resetData.verificationCode - 验证码
   * @param {string} resetData.newPassword - 新密码
   * @returns {Promise}
   */
  async resetPasswordWithCode(resetData) {
    try {
      console.log('重置密码请求数据:', resetData)
      const response = await API.post(AUTH_ENDPOINTS.RESET_PASSWORD, resetData)
      return response
    } catch (error) {
      console.error('重置密码错误:', error.response?.data || error.message)
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || ''
        if (errorMessage.includes('验证码无效') || errorMessage.includes('验证码已过期')) {
          throw new Error('验证码无效或已过期，请重新获取验证码')
        } else if (errorMessage.includes('密码')) {
          throw new Error('新密码至少需要6个字符')
        } else if (errorMessage.includes('邮箱未注册')) {
          throw new Error('该邮箱未注册')
        } else {
          throw new Error(errorMessage || '密码重置失败')
        }
      }
      throw error
    }
  }
}

export default new AuthService()
