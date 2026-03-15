import request from '@/utils/request';
import { useTokenStore, useDoctorTokenStore} from '@/stores/token';

/**
 * 获取用户的投诉列表
 * @returns {Promise} 投诉列表
 */
export const getComplaintsByUser = () => {
  const tokenStore = useTokenStore();
  const userId = tokenStore.user?.id;
  if (!userId) {
    return Promise.reject(new Error('用户未登录'));
  }
  return request.get(`/api/complaints/user/${userId}`);
};

/**
 * 获取投诉详情
 * @param {number} id 投诉ID
 * @returns {Promise} 投诉详情
 */
export const getComplaintDetail = (id) => {
  return request.get(`/api/complaints/${id}`);
};

/**
 * 提交投诉
 * @param {Object} complaint 投诉对象
 * @returns {Promise} 创建的投诉
 */
export const createComplaint = (complaint) => {
  return request.post('/api/complaints', complaint);
};

/**
 * 更新投诉（例如处理反馈）
 * @param {number} id 投诉ID
 * @param {Object} data 更新数据（包括状态和反馈）
 * @returns {Promise}
 */
export const updateComplaint = (id, data) => {
  return request.put(`/api/complaints/${id}/process`, null, {
    params: data
  });
};

/**
 * 获取订单相关的投诉
 * @param {number} orderId 订单ID
 * @returns {Promise} 投诉列表
 */
export const getComplaintsByOrder = (orderId) => {
  return request.get(`/api/complaints/order/${orderId}`);
};


/**
 * 获取医生自身的投诉列表（医生作为被投诉对象）
 * @returns {Promise} 投诉列表
 */
export const getComplaintsByDoctor = () => {
  const doctorTokenStore = useDoctorTokenStore(); // ✅ 正确
  const doctorId = doctorTokenStore.doctor?.id; // ✅ 获取医生ID
  
  if (!doctorId) {
    return Promise.reject(new Error('医生未登录'));
  }
  return request.get(`/api/complaints/doctor/${doctorId}`);
};


/**
 * 获取医生处理的投诉列表（医生作为处理人）
 * @returns {Promise} 投诉列表
 */
export const getComplaintsByHandler = () => {
  const doctorTokenStore = useDoctorTokenStore();
  const doctorId = doctorTokenStore.doctor?.id;
  
  if (!doctorId) {
    return Promise.reject(new Error('医生未登录'));
  }
  return request.get(`/api/complaints/handler/${doctorId}`);
};