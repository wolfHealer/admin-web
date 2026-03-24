// src/api/resource/rehab/resourceDocking.ts
import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface ResourceDockingItem {
  id: number
  title: string                    // 对接标题
  resourceType: string             // 资源类型 (机构/设备/专家/资金)
  organization: string             // 机构名称
  contactPerson: string            // 联系人
  contactInfo: string              // 联系方式
  region: string                   // 服务区域
  description: string              // 资源描述
  availableQuantity?: number       // 可用数量
  status?: 0 | 1
  createdAt?: string
  updatedAt?: string
}

export interface ResourceDockingListParams {
  page: number
  pageSize: number
  keyword?: string
  resourceType?: string
  region?: string
}

export interface ResourceDockingListResponse {
  list: ResourceDockingItem[]
  total: number
  page: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ==================== 康复资源对接相关接口 ====================
export const getResourceDockingList = (
  params: ResourceDockingListParams
): Promise<ApiResponse<ResourceDockingListResponse>> => {
  return request({
    url: '/rehab/resource-dockings',
    method: 'get',
    params
  })
}

export const getResourceDockingDetail = (
  id: number
): Promise<ApiResponse<ResourceDockingItem>> => {
  return request({
    url: `/rehab/resource-dockings/${id}`,
    method: 'get'
  })
}

export const addResourceDocking = (
  data: Partial<ResourceDockingItem>
): Promise<ApiResponse> => {
  return request({
    url: '/rehab/resource-dockings',
    method: 'post',
    data
  })
}

export const updateResourceDocking = (
  id: number,
  data: Partial<ResourceDockingItem>
): Promise<ApiResponse> => {
  return request({
    url: `/rehab/resource-dockings/${id}`,
    method: 'put',
    data
  })
}

export const deleteResourceDocking = (
  id: number
): Promise<ApiResponse> => {
  return request({
    url: `/rehab/resource-dockings/${id}`,
    method: 'delete'
  })
}