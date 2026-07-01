// src/api/notificationsService.js
import apiClient from './client'

export const listNotifications = (params = {}) =>
  apiClient.get('/notifications/alerts/', { params }).then((res) => res.data)

export const markNotificationRead = (id) =>
  apiClient.post(`/notifications/alerts/${id}/read/`).then((res) => res.data)

export const markAllNotificationsRead = () =>
  apiClient.post('/notifications/alerts/mark_all_read/').then((res) => res.data)

export const getUnreadCount = () =>
  apiClient.get('/notifications/alerts/unread_count/').then((res) => res.data)