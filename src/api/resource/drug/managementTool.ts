// src/api/resource/drug/managementTool.ts
import request from '@/utils/request'

export interface ManagementToolParams {
  page: number
  pageSize: number
  keyword?: string
  toolType?: string
  diseaseValue?: number | null
}

export interface ManagementToolFile {
  downloadUrl: string
  fileType: string
  title: string
}

export interface ManagementToolItem {
  id: number
  title: string
  toolType: string
  description: string
  diseaseValue: number
  files: ManagementToolFile[]
  updatedAt?: string
  createdAt?: string
}

// 获取列表
export const getManagementToolList = (params: ManagementToolParams) => {
  return request({
    url: '/resource/drug/tools',
    method: 'get',
    params
  })
}

// 获取详情
export const getManagementToolDetail = (id: number) => {
  return request({
    url: `/resource/drug/tools/${id}`,
    method: 'get'
  })
}

// 新增
export const addManagementTool = (data: Omit<ManagementToolItem, 'id' | 'updatedAt' | 'createdAt'>) => {
  return request({
    url: '/resource/drug/tools',
    method: 'post',
    data
  })
}

// 更新
export const updateManagementTool = (id: number, data: Partial<ManagementToolItem>) => {
  return request({
    url: `/resource/drug/tools/${id}`,
    method: 'put',
    data
  })
}

// 删除
export const deleteManagementTool = (id: number) => {
  return request({
    url: `/resource/drug/tools/${id}`,
    method: 'delete'
  })
}