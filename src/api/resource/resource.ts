// src/api/resource/resource.ts
import request from '@/utils/request'

// 类型定义
export interface ResourceItem {
  id: string | number
  name: string
  type: string
  specification: string
  size: string
  status: number
  uploadTime: string
  [key: string]: any
}

export interface ResourceListParams {
  page: number
  pageSize: number
  keyword?: string
}

export interface ResourceListResponse {
  list: ResourceItem[]
  total: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

/**
 * 获取资源列表
 * @param module 模块名称 (如: drug, medical, charity, rehab)
 * @param params 查询参数
 */
export const getResourceList = (
  module: string,
  params: ResourceListParams
): Promise<ApiResponse<ResourceListResponse>> => {
  return request({
    url: `/api/resource/${module}/list`,
    method: 'get',
    params
  })
}

/**
 * 获取资源详情
 * @param module 模块名称
 * @param id 资源 ID
 */
export const getResourceDetail = (
  module: string,
  id: string | number
): Promise<ApiResponse<ResourceItem>> => {
  return request({
    url: `/api/resource/${module}/${id}`,
    method: 'get'
  })
}

/**
 * 新增资源
 * @param module 模块名称
 * @param data 资源数据
 */
export const addResource = (
  module: string,
  data: Partial<ResourceItem>
): Promise<ApiResponse> => {
  return request({
    url: `/api/resource/${module}`,
    method: 'post',
    data
  })
}

/**
 * 更新资源
 * @param module 模块名称
 * @param id 资源 ID
 * @param data 资源数据
 */
export const updateResource = (
  module: string,
  id: string | number,
  data: Partial<ResourceItem>
): Promise<ApiResponse> => {
  return request({
    url: `/api/resource/${module}/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除资源
 * @param module 模块名称
 * @param id 资源 ID
 */
export const deleteResource = (
  module: string,
  id: string | number
): Promise<ApiResponse> => {
  return request({
    url: `/api/resource/${module}/${id}`,
    method: 'delete'
  })
}

/**
 * 下载资源
 * @param module 模块名称
 * @param id 资源 ID
 */
export const downloadResource = (
  module: string,
  id: string | number
): Promise<Blob> => {
  return request({
    url: `/api/resource/${module}/${id}/download`,
    method: 'get',
    responseType: 'blob'
  })
}