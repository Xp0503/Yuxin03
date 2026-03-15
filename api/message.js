// message.js
import request from '@/utils/request'
import { useTokenStore } from '@/stores/token'

/**
 * 获取用户所有会话
 * @returns {Promise} 会话列表
 */
export const getConversations = () => {
  const tokenStore = useTokenStore()
  const userId = tokenStore.user?.id
  if (!userId) {
    return Promise.reject(new Error('用户未登录'))
  }
  return request.get('/messages/conversations', {
    params: { userId }
  })
}
// 获取医生所有会话
export const getDoctorConversations = (doctorId) => {
  return request.get('/messages/conversations/doctor', { // 修改路径
    params: { doctorId }
  })
}
/**
 * 获取会话消息记录
 * @param {number} conversationId 会话ID
 * @returns {Promise} 消息列表
 */
export const getMessages = (conversationId) => {
  return request.get(`/messages/conversations/${conversationId}`) // 修改路径
}
/**
 * 发送消息
 * @param {Object} message 消息对象
 * @returns {Promise}
 */
export const sendMessage = (message) => {
  return request.post('/messages/send', message)
}
/**
 * 标记消息为已读
 * @param {number} conversationId 会话ID
 * @returns {Promise}
 */
export const markMessagesAsRead = (conversationId) => {
  return request.post(`/messages/mark-read/${conversationId}`)
}