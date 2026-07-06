// src/api/usersService.js
import apiClient from './client'

export const listUsers = (params = {}) =>
  apiClient.get('/auth/users/', { params }).then((res) => res.data)

export const createUser = (payload) =>
  apiClient.post('/auth/users/', payload).then((res) => res.data)

export const getUser = (id) =>
  apiClient.get(`/auth/users/${id}/`).then((res) => res.data)

export const updateUser = (id, payload) =>
  apiClient.patch(`/auth/users/${id}/`, payload).then((res) => res.data)

export const deleteUser = (id) =>
  apiClient.delete(`/auth/users/${id}/`).then((res) => res.data) 