// src/api/contactService.js
import apiClient from './client'

export const sendContactMessage = (payload) =>
  apiClient.post('/contact/messages/', payload).then((res) => res.data)

// Admin-only: view submitted messages
export const listContactMessages = (params = {}) =>
  apiClient.get('/contact/messages/', { params }).then((res) => res.data)
export const markContactMessageRead = (id, is_read = true) =>
  apiClient.patch(`/contact/messages/${id}/`, { is_read }).then((res) => res.data)