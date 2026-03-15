// @/api/evaluation.js
import request from '@/utils/request';
import { useTokenStore } from '@/stores/token';

/**
 * 提交评价
 * @param {Object} evaluation 评价对象
 * @returns {Promise}
 */
export const createEvaluation = (evaluation) => {
  const tokenStore = useTokenStore();
  if (!tokenStore.isLoggedIn) {
    return Promise.reject(new Error('用户未登录'));
  }
  
  // 添加用户ID到评价对象
  evaluation.userId = tokenStore.user.id;
  
  return request.post('/api/evaluations', evaluation);
};

/**
 * 获取订单评价
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export const getEvaluationByOrder = (orderId) => {
  return request.get(`/api/evaluations/order/${orderId}`);
};

/**
 * 获取用户评价列表
 * @returns {Promise}
 */
export const getUserEvaluations = () => {
  const tokenStore = useTokenStore();
  const userId = tokenStore.user?.id;
  if (!userId) {
    return Promise.reject(new Error('用户未登录'));
  }
  return request.get(`/api/evaluations/user/${userId}`);
};

/**
 * 获取服务评价列表
 * @param {number} serviceId 服务ID
 * @returns {Promise}
 */
export const getServiceEvaluations = (serviceId) => {
  return request.get(`/api/evaluations/service/${serviceId}`);
};

/**
 * 删除评价
 * @param {number} evaluationId 评价ID
 * @returns {Promise}
 */
export const deleteEvaluation = (evaluationId) => {
  return request.delete(`/api/evaluations/${evaluationId}`);
};