import request from '@/utils/request'

// 获取所有上架服务
export const getActiveServices = () => {
  return request.get('/api/services')
}

// 按分类获取上架服务
export const getActiveServicesByCategory = (categoryId) => {
  return request.get(`/api/services/category/${categoryId}`)
}

// 根据ID获取服务详情
export const getServiceDetails = (id) => {
  return request.get(`/api/services/${id}`)
}

// 搜索服务
export const searchServices = (keyword) => {
  return request.get('/api/services/search', {
    params: { keyword }
  })
}

// 获取热门服务
export const getPopularServices = () => {
  return request.get('/api/services/popular')
}

// 获取推荐服务
export const getRecommendedServices = () => {
  return request.get('/api/services/recommended')
}