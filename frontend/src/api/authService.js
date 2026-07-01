// src/api/authService.js
import apiClient from './client'

export const registerUser = (payload) =>
  apiClient.post('/auth/register/', payload).then((res) => res.data)

export const loginUser = (email, password) =>
  apiClient.post('/auth/login/', { email, password }).then((res) => res.data)

export const fetchProfile = () =>
  apiClient.get('/auth/profile/').then((res) => res.data)

export const updateProfile = (payload) =>
  apiClient.patch('/auth/profile/', payload).then((res) => res.data)

export const changePassword = (payload) =>
  apiClient.post('/auth/change-password/', payload).then((res) => res.data)