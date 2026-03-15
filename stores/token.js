import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTokenStore = defineStore('user', () => {
  // 存储用户信息
  const user = ref(null)
  
  // 从 localStorage 初始化用户状态
  const initUserFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  // 设置用户信息
  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
    
    // 同时存储到 uni-app 存储
    uni.setStorageSync('user', userData)
  }

  // 清除用户信息
  const clearUser = () => {
    user.value = null
    localStorage.removeItem('user')
    uni.removeStorageSync('user')
  }

  // 检查是否已登录
  const isLoggedIn = computed(() => !!user.value?.id)

  // 初始化
  initUserFromStorage()

  return { 
    user,
    setUser,
    clearUser,
    isLoggedIn
  }
})

// 新增医生token的store
export const useDoctorTokenStore = defineStore('doctor', () => {
  // 存储医生信息
  const doctor = ref(null)
  
  // 从 localStorage 初始化医生状态
  const initDoctorFromStorage = () => {
    const storedDoctor = localStorage.getItem('doctor')
    if (storedDoctor) {
      doctor.value = JSON.parse(storedDoctor)
    }
  }

  // 设置医生信息
  const setDoctor = (doctorData) => {
    doctor.value = doctorData
    localStorage.setItem('doctor', JSON.stringify(doctorData))
    uni.setStorageSync('doctor', doctorData)
  }

  // 清除医生信息
  const clearDoctor = () => {
    doctor.value = null
    localStorage.removeItem('doctor')
    uni.removeStorageSync('doctor')
  }

  // 检查医生是否已登录
  const isDoctorLoggedIn = computed(() => !!doctor.value?.id)

  // 初始化
  initDoctorFromStorage()

  return { 
    doctor,
    setDoctor,
    clearDoctor,
    isDoctorLoggedIn
  }
})