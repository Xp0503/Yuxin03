import request from '@/utils/request';
import { useTokenStore } from '@/stores/token';

/**
 * 获取用户所有地址
 * @returns {Promise} 地址列表
 */
export const getUserAddresses = () => {
  const tokenStore = useTokenStore();
  const userId = tokenStore.user?.id;
  if (!userId) {
    return Promise.reject(new Error('用户未登录'));
  }
  return request.get(`/api/addresses/user/${userId}`);
};

/**
 * 添加新地址
 * @param {Object} address 地址对象
 * @returns {Promise}
 */
export const addAddress = (address) => {
  const tokenStore = useTokenStore();
  if (!tokenStore.isLoggedIn) {
    return Promise.reject(new Error('用户未登录'));
  }
  
  // 将前端字段名映射到后端字段名
  const backendAddress = {
    contactName: address.recipient,
    contactPhone: address.phone,
    province: address.province,
    city: address.city,
    district: address.district,
    detail: address.detail,
    isDefault: address.isDefault ? 1 : 0, // 转换为后端需要的格式 (0/1)
    userId: tokenStore.user.id
  };
  
  return request.post('/api/addresses', backendAddress);
};

/**
 * 更新地址
 * @param {Object} address 地址对象
 * @returns {Promise}
 */
export const updateAddress = (address) => {
  const tokenStore = useTokenStore();
  if (!tokenStore.isLoggedIn) {
    return Promise.reject(new Error('用户未登录'));
  }
  
  // 将前端字段名映射到后端字段名
  const backendAddress = {
    id: address.id, // 确保包含ID
    contactName: address.recipient, // 前端 recipient → 后端 contactName
    contactPhone: address.phone,   // 前端 phone → 后端 contactPhone
    province: address.province,
    city: address.city,
    district: address.district,
    detail: address.detail,
    isDefault: address.isDefault ? 1 : 0, // 转换为后端需要的格式 (0/1)
    userId: tokenStore.user.id
  };
  
  return request.put(`/api/addresses/${address.id}`, backendAddress); // 使用正确的URL格式
};
/**
 * 删除地址
 * @param {number} addressId 地址ID
 * @returns {Promise}
 */
export const deleteAddress = (addressId) => {
  return request.delete(`/api/addresses/${addressId}`);
};

/**
 * 设置默认地址
 * @param {number} addressId 地址ID
 * @returns {Promise}
 */
export const setDefaultAddress = (addressId) => {
  const tokenStore = useTokenStore();
  const userId = tokenStore.user?.id;
  if (!userId) {
    return Promise.reject(new Error('用户未登录'));
  }
  
  return request.post(`/api/addresses/${addressId}/set-default/user/${userId}`);
};

/**
 * 获取地址详情
 * @param {number} addressId 地址ID
 * @returns {Promise}
 */
export const getAddressById = (addressId) => {
  return request.get(`/api/addresses/${addressId}`);
};