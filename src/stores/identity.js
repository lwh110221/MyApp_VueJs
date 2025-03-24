import { defineStore } from 'pinia'
import { identityService, messageService } from '../api'

export const useIdentityStore = defineStore('identity', {
  state: () => ({
    // 身份类型列表
    identityTypes: [],

    // 用户身份列表
    userIdentities: [],

    // 加载状态
    typesLoading: false,
    identitiesLoading: false,
    applyLoading: false
  }),

  getters: {
    // 用户拥有的身份类型
    hasIdentity: (state) => (code) => {
      return Array.isArray(state.userIdentities) &&
        state.userIdentities.some(identity => identity.identity_type === code);
    },

    // 获取指定身份信息
    getIdentity: (state) => (code) => {
      return Array.isArray(state.userIdentities) &&
        state.userIdentities.find(identity => identity.identity_type === code);
    },

    // 需要认证的身份类型
    certificationTypes: (state) => {
      return Array.isArray(state.identityTypes) ?
        state.identityTypes.filter(type => type.needCertification) : [];
    },

    // 用户可以申请的身份类型（排除已拥有的）
    availableCertificationTypes: (state) => {
      if (!Array.isArray(state.identityTypes) || !Array.isArray(state.userIdentities)) {
        return [];
      }

      const existingTypes = state.userIdentities.map(identity => identity.identity_type);
      return state.identityTypes.filter(type =>
        type.needCertification && !existingTypes.includes(type.code)
      );
    }
  },

  actions: {
    /**
     * 获取所有身份类型
     */
    async fetchIdentityTypes() {
      try {
        this.typesLoading = true;
        const response = await identityService.getIdentityTypes();
        this.identityTypes = response?.data || [];
        return this.identityTypes;
      } catch (error) {
        messageService.error('获取身份类型失败');
        console.error('获取身份类型失败:', error);
        throw error;
      } finally {
        this.typesLoading = false;
      }
    },

    /**
     * 获取当前用户的身份列表
     */
    async fetchUserIdentities() {
      try {
        this.identitiesLoading = true;
        const response = await identityService.getMyIdentities();
        this.userIdentities = response?.data || [];
        return this.userIdentities;
      } catch (error) {
        messageService.error('获取身份信息失败');
        console.error('获取身份信息失败:', error);
        throw error;
      } finally {
        this.identitiesLoading = false;
      }
    },

    /**
     * 申请身份认证
     * @param {Object} data 认证数据
     */
    async applyCertification(data) {
      try {
        this.applyLoading = true;
        const response = await identityService.applyCertification(data);
        messageService.success('认证申请提交成功，请等待审核');
        return response;
      } catch (error) {
        messageService.error('认证申请提交失败');
        console.error('认证申请提交失败:', error);
        throw error;
      } finally {
        this.applyLoading = false;
      }
    }
  }
})
