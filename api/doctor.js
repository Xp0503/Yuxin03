import request from '@/utils/request';
import { useDoctorTokenStore } from '@/stores/token';

/**
 * 发送短信验证码（医生）
 * @param {string} phone 手机号
 * @param {number} type 短信类型（1：注册，2：登录，3：重置密码）
 */
export const sendDoctorSmsCode = (phone, type) => {
  return request.post('/doctors/send-sms', null, {
    params: { phone, type }
  });
};

/**
 * 医生注册
 * @param {Object} doctor 医生对象
 * @param {string} smsCode 短信验证码
 */
export const registerDoctor = (doctor, smsCode) => {
  return request.post('/doctors/register', doctor, {
    params: { smsCode }
  });
};

/**
 * 医生密码登录
 * @param {string} phone 手机号
 * @param {string} password 密码
 */
export const loginDoctor = (phone, password) => {
  return request.post('/doctors/login', null, {
    params: { phone, password }
  }).then(response => {
    console.log('医生登录响应:', response);
    
    // 存储医生信息到 Pinia
    const doctorTokenStore = useDoctorTokenStore();
    doctorTokenStore.setDoctor(response);
    
    // 存储到 uni-app 存储
    uni.setStorageSync('doctor', response);
    
    return response;
  });
};

/**
 * 医生短信验证码登录
 * @param {string} phone 手机号
 * @param {string} smsCode 短信验证码
 */
export const loginDoctorWithSms = (phone, smsCode) => {
  return request.post('/doctors/login/sms', null, {
    params: { phone, smsCode }
  }).then(response => {
    console.log('医生短信登录响应:', response);
    
    // 存储医生信息到 Pinia
    const doctorTokenStore = useDoctorTokenStore();
    doctorTokenStore.setDoctor(response);
    
    // 存储到 uni-app 存储
    uni.setStorageSync('doctor', response);
    
    return response;
  });
};

/**
 * 获取当前医生信息
 */
export const getCurrentDoctor = () => {
  const doctorTokenStore = useDoctorTokenStore();
  return doctorTokenStore.doctor;
};

/**
 * 检查医生登录状态
 */
export const checkDoctorLogin = () => {
  const doctorTokenStore = useDoctorTokenStore();
  return doctorTokenStore.isDoctorLoggedIn;
};

/**
 * 通过原密码修改医生密码
 * @param {string} phone 手机号
 * @param {string} oldPassword 原密码
 * @param {string} newPassword 新密码
 * @param {string} confirmPassword 确认密码
 */
export const changeDoctorPasswordByOld = (phone, oldPassword, newPassword, confirmPassword) => {
  return request.post('/doctors/change-password/by-password', null, {
    params: { phone, oldPassword, newPassword, confirmPassword }
  });
};

/**
 * 通过短信修改医生密码
 * @param {string} phone 手机号
 * @param {string} smsCode 短信验证码
 * @param {string} newPassword 新密码
 * @param {string} confirmPassword 确认密码
 */
export const changeDoctorPasswordBySms = (phone, smsCode, newPassword, confirmPassword) => {
  return request.post('/doctors/change-password/by-sms', null, {
    params: { phone, smsCode, newPassword, confirmPassword }
  });
};

/**
 * 更新医生信息
 * @param {Object} doctor 医生对象
 */
export const updateDoctor = (doctor) => {
  return request.put('/doctors/update', doctor);
};

/**
 * 医生登出
 */
export const logoutDoctor = () => {
  return request.post('/doctors/logout').then(() => {
    const doctorTokenStore = useDoctorTokenStore();
    doctorTokenStore.clearDoctor();
  });
};