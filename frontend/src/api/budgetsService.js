// src/api/budgetsService.js
import apiClient from './client'

// Budgets
export const listBudgets = (params = {}) =>
  apiClient.get('/budgets/financials/', { params }).then((res) => res.data)

export const getBudget = (id) =>
  apiClient.get(`/budgets/financials/${id}/`).then((res) => res.data)

export const createBudget = (payload) =>
  apiClient.post('/budgets/financials/', payload).then((res) => res.data)

export const deleteBudget = (id) =>
  apiClient.delete(`/budgets/financials/${id}/`).then((res) => res.data)

export const activateBudget = (id) =>
  apiClient.post(`/budgets/financials/${id}/activate/`).then((res) => res.data)

export const freezeBudget = (id) =>
  apiClient.post(`/budgets/financials/${id}/freeze/`).then((res) => res.data)

export const closeBudget = (id) =>
  apiClient.post(`/budgets/financials/${id}/close/`).then((res) => res.data)

export const getBudgetSummary = (id) =>
  apiClient.get(`/budgets/financials/${id}/summary/`).then((res) => res.data)

export const listBudgetItems = (budgetId) =>
  apiClient.get(`/budgets/financials/${budgetId}/items/`).then((res) => res.data)

export const addBudgetItem = (budgetId, payload) =>
  apiClient.post(`/budgets/financials/${budgetId}/items/`, payload).then((res) => res.data)

export const listBudgetDisbursements = (budgetId) =>
  apiClient.get(`/budgets/financials/${budgetId}/disbursements/`).then((res) => res.data)

export const requestDisbursement = (budgetId, payload) =>
  apiClient.post(`/budgets/financials/${budgetId}/disbursements/`, payload).then((res) => res.data)

export const listBudgetExpenses = (budgetId) =>
  apiClient.get(`/budgets/financials/${budgetId}/expenses/`).then((res) => res.data)

export const recordExpense = (budgetId, payload) =>
  apiClient.post(`/budgets/financials/${budgetId}/expenses/`, payload).then((res) => res.data)

export const listDisbursements = (params = {}) =>
  apiClient.get('/budgets/disbursements/', { params }).then((res) => res.data)

export const getDisbursement = (id) =>
  apiClient.get(`/budgets/disbursements/${id}/`).then((res) => res.data)

export const approveDisbursement = (id) =>
  apiClient.post(`/budgets/disbursements/${id}/approve/`).then((res) => res.data)

export const disburseDisbursement = (id) =>
  apiClient.post(`/budgets/disbursements/${id}/disburse/`).then((res) => res.data)

export const rejectDisbursement = (id, payload) =>
  apiClient.post(`/budgets/disbursements/${id}/reject/`, payload).then((res) => res.data)
