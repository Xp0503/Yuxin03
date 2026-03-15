// @/api/schedule.js
import request from '@/utils/request'

// 创建服务安排
export function createSchedule(data) {
  return request({
    url: '/api/schedules',
    method: 'post',
    data
  })
}