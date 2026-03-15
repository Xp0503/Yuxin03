import request from '@/utils/request';
import { useTokenStore } from '@/stores/token';

/**
 * 获取用户的预约列表
 * @returns {Promise} 预约列表
 */
export const getUserAppointments = () => {
  const tokenStore = useTokenStore();
  const userId = tokenStore.user?.id;
  if (!userId) {
    return Promise.reject(new Error('用户未登录'));
  }
  return request.get(`/api/orders/user/${userId}`);
};

/**
 * 取消预约
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export const cancelAppointment = (orderId) => {
  return request.post(`/api/orders/${orderId}/cancel`);
};

/**
 * 提交评价
 * @param {Object} evaluation 评价对象
 * @returns {Promise}
 */
export const submitEvaluation = (evaluation) => {
  // 根据实际接口调整
  return request.post('/api/evaluations', evaluation);
};

/**
 * 提交投诉
 * @param {Object} complaint 投诉对象
 * @returns {Promise}
 */
export const submitComplaint = (complaint) => {
  return request.post('/api/complaints', complaint);
};

/**
 * 占用预约时间
 * @param {number} scheduleId 时间表ID
 * @returns {Promise}
 */
export const occupySchedule = (scheduleId) => {
  return request.post(`/api/schedules/${scheduleId}/occupy`);
};

/**
 * 释放预约时间
 * @param {number} scheduleId 时间表ID
 * @returns {Promise}
 */
export const releaseSchedule = (scheduleId) => {
  return request.post(`/api/schedules/${scheduleId}/release`);
};

/**
 * 获取服务时间表
 * @param {number} serviceId 服务ID
 * @returns {Promise}
 */
export const getServiceSchedules = (serviceId) => {
  return request.get(`/api/schedules/service/${serviceId}/next7days`);
};
/**
 * 创建订单
 * @param {Object} orderData 订单数据
 * @returns {Promise}
 */
export const createOrder = (orderData) => {
  // 创建表单数据对象
  const formData = new URLSearchParams();
  formData.append('userId', orderData.userId);
  formData.append('serviceId', orderData.serviceId);
  formData.append('addressId', orderData.addressId);
  formData.append('appointmentTime', orderData.appointmentTime);
  formData.append('amount', orderData.amount);
  if (orderData.remark) formData.append('remark', orderData.remark);
  if (orderData.scheduleId) formData.append('scheduleId', orderData.scheduleId);
  
  return request.post('/api/orders', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};
/**
 * 获取预约详情
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export const getAppointmentDetail = (orderId) => {
  return request.get(`/api/orders/${orderId}/detail`);
};

/**
 * 支付成功回调
 * @param {string} orderNo 订单号
 * @param {number} payMethod 支付方式
 * @returns {Promise}
 */
export const paymentSuccess = (orderNo, payMethod) => {
  // 创建表单数据对象
  const formData = new URLSearchParams();
  formData.append('payMethod', payMethod);
  
  return request.post(`/api/orders/${orderNo}/pay-success`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

/**
 * 医生发布服务可预约时间
 * @param {Object} scheduleData 预约时间数据对象
 * @param {number} scheduleData.doctorId 医生ID
 * @param {number} scheduleData.serviceId 服务ID
 * @param {string} scheduleData.startTime 开始时间（ISO 8601格式）
 * @param {number} scheduleData.duration 持续时间（分钟）
 * @returns {Promise} 操作结果
 */
export const createServiceSchedule = (scheduleData) => {
  // 构建符合后端要求的请求体
  const requestData = {
    doctorId: scheduleData.doctorId,
    serviceId: scheduleData.serviceId,
    startTime: scheduleData.startTime,
    duration: scheduleData.duration
  };
  
  return request.post('/api/schedules', requestData);
};

/**
 * 获取医生的预约订单
 * @param {number} doctorId 医生ID
 * @returns {Promise} 预约订单列表
 */
export const getDoctorAppointments = (doctorId) => {
  return request.get(`/api/orders/doctor/${doctorId}`);
};

/**
 * 接单（将订单状态从1->2）
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export const acceptOrder = (orderId) => {
  return request.post(`/api/orders/${orderId}/accept`);
};

/**
 * 完成订单（将订单状态从2->3）
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export const completeOrder = (orderId) => {
  return request.post(`/api/orders/${orderId}/complete`);
};

/**
 * 拒绝订单（取消订单）
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export const rejectOrder = (orderId) => {
  return request.post(`/api/orders/${orderId}/cancel`);
};
