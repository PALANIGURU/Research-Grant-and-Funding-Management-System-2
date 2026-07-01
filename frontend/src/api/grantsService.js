// src/api/grantsService.js
import apiClient from './client'

// Grant opportunities
export const listGrants = (params = {}) =>
  apiClient.get('/grants/opportunities/', { params }).then((res) => res.data)

export const getGrant = (id) =>
  apiClient.get(`/grants/opportunities/${id}/`).then((res) => res.data)

export const createGrant = (payload) =>
  apiClient.post('/grants/opportunities/', payload).then((res) => res.data)

export const updateGrant = (id, payload) =>
  apiClient.patch(`/grants/opportunities/${id}/`, payload).then((res) => res.data)

export const deleteGrant = (id) =>
  apiClient.delete(`/grants/opportunities/${id}/`).then((res) => res.data)

// Funding agencies
export const listAgencies = (params = {}) =>
  apiClient.get('/grants/agencies/', { params }).then((res) => res.data)

// Grant categories
export const listCategories = (params = {}) =>
  apiClient.get('/grants/categories/', { params }).then((res) => res.data)