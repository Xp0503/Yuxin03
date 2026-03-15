import request from '@/utils/request';
import { useTokenStore } from '@/stores/token';

// 发送短信验证码
export const sendSmsCode = (phone, type) => {
  return request.post('/send-sms', null, {
    params: { phone, type }
  });
};

// 用户注册
export const register = (user, smsCode) => {
  return request.post('/register', user, {
    params: { smsCode }
  });
};

// 密码登录 - 修改：直接返回用户对象
export const login = (phone, password) => {
  return request.post('/login', null, {
    params: { phone, password }
  }).then(response => {
    console.log('登录响应:', response);
    
    // 存储用户信息到 Pinia
    const tokenStore = useTokenStore();
    tokenStore.setUser(response);
    
    // 存储到 uni-app 存储
    uni.setStorageSync('user', response);
    
    return response; // 直接返回用户信息
  });
};

// 短信验证码登录 - 修改：直接返回用户对象
export const loginWithSms = (phone, smsCode) => {
  return request.post('/login/sms', null, {
    params: { phone, smsCode }
  }).then(response => {
    console.log('短信登录响应:', response);
    
    // 存储用户信息到 Pinia
    const tokenStore = useTokenStore();
    tokenStore.setUser(response);
    
    // 存储到 uni-app 存储
    uni.setStorageSync('user', response);
    
    return response; // 直接返回用户信息
  });
};

// 获取当前用户信息 - 修改：直接从 store 获取
export const getCurrentUser = () => {
  const tokenStore = useTokenStore();
  return tokenStore.user;
};

// 检查登录状态 - 修改：简化实现
export const checkLogin = () => {
  const tokenStore = useTokenStore();
  return tokenStore.user || null;
};

// 通过原密码修改密码
export const changePasswordByOld = (phone, oldPassword, newPassword, confirmPassword) => {
  return request.post('/change-password/by-password', null, {
    params: { phone, oldPassword, newPassword, confirmPassword }
  });
};

// 通过短信修改密码
export const changePasswordBySms = (phone, smsCode, newPassword, confirmPassword) => {
  return request.post('/change-password/by-sms', null, {
    params: { phone, smsCode, newPassword, confirmPassword }
  });
};

// 根据用户名获取用户信息
export const getUserByName = (userName) => {
  return request.get('/user', {
    params: { userName }
  });
};

// 更新用户信息
export const updateUser = (user) => {
  return request.put('/user/update', user);
};

// 登出
export const logout = () => {
  return request.post('/logout');
}