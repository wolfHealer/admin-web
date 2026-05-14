import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// 前端统一使用的接口定义 (CamelCase)
export interface RegionItem {
  id?: number
  code: string
  name: string
  fullName: string      // 统一使用 fullName
  parentCode: string    // 统一使用 parentCode
  level: 1 | 2 | 3
  sort: number
  isEnabled: 0 | 1      // 统一使用 isEnabled
  createdAt?: string
  updatedAt?: string

  children?: RegionItem[]
  parentName?: string
}

export interface RegionListParams {
  page: number
  pageSize: number
  keyword?: string
  level?: number | ''
  isEnabled?: number | ''
  parentCode?: string
}

export interface RegionListResponse {
  list: RegionItem[]
  total: number
}

// --- 核心工具函数：递归转换字段 ---
const normalizeRegionData = (item: any): RegionItem => {
  if (!item) return item
  
  // 处理子节点递归
  const children = item.children ? item.children.map(normalizeRegionData) : []

  return {
    id: item.id,
    code: item.code,
    name: item.name,
    // 关键映射：如果后端返回 name 但没有 fullName，则用 name 填充 fullName
    // 这样树结构和列表结构在前端看来都有 fullName
    fullName: item.fullName || item.name, 
    // 关键映射：parentCode
    parentCode: item.parentCode || '', 
    level: item.level,
    sort: item.sort,
    // 关键映射：isEnabled
    isEnabled: item.isEnabled !== undefined ? item.isEnabled : (item.is_enabled === 1 ? 1 : 0),
    createdAt: item.createdAt || item.created_at,
    updatedAt: item.updatedAt || item.updated_at,
    children: children,
    parentName: item.parentName || item.parent_name,
  }
}

export const getRegionList = (params: RegionListParams) => {
  return request<ApiResponse<any>>({
    url: '/region/list',
    method: 'get',
    params,
  }).then(res => {
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(normalizeRegionData)
    }
    return res as unknown as ApiResponse<RegionListResponse>
  })
}

export const getRegionTree = () => {
  return request<ApiResponse<any>>({
    url: '/region/tree',
    method: 'get',
  }).then(res => {
    if (res.data) {
      // 递归转换树形结构
      res.data = res.data.map(normalizeRegionData)
    }
    return res as unknown as ApiResponse<RegionItem[]>
  })
}

export const getRegionDetail = (id: number) => {
  return request<ApiResponse<any>>({
    url: `/region/${id}`,
    method: 'get',
  }).then(res => {
    if (res.data) {
      res.data = normalizeRegionData(res.data)
    }
    return res as unknown as ApiResponse<RegionItem>
  })
}

export const addRegion = (data: Partial<RegionItem>) => {
  // 发送时，如果后端严格要求 camelCase，直接发送即可，因为前端已经是 camelCase
  // 如果后端要求 snake_case，这里需要反向转换
  const payload = {
    ...data,
    fullName: data.fullName,
    parentCode: data.parentCode,
    isEnabled: data.isEnabled,
  }
  
  return request<ApiResponse>({
    url: '/region',
    method: 'post',
    data: payload,
  })
}

export const updateRegion = (id: number, data: Partial<RegionItem>) => {
  const payload = {
    ...data,
    fullName: data.fullName,
    parentCode: data.parentCode,
    isEnabled: data.isEnabled,
  }

  return request<ApiResponse>({
    url: `/region/${id}`,
    method: 'put',
    data: payload,
  })
}

export const deleteRegion = (id: number) => {
  return request<ApiResponse>({
    url: `/region/${id}`,
    method: 'delete',
  })
}

export const updateRegionStatus = (id: number, is_enabled: 0 | 1) => {
  return request<ApiResponse>({
    url: `/region/${id}/status`,
    method: 'patch',
    data: { isEnabled: is_enabled }, // 发送 camelCase
  })
}