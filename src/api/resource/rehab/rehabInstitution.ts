import request from '@/utils/request'
import { getDiseaseList } from '@/api/knowledge/knowledge'

// 1. 定义通用响应结构
export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}



// 修改点：根据后端实际返回的 JSON 调整接口定义
export interface RehabInstitutionItem {
  id: number
  name: string
  provinceCode: string
  cityCode: string
  districtCode: string
  provinceName?: string // 后端返回了，保留
  cityName?: string     // 后端返回了，保留
  districtName?: string // 后端返回了，保留
  address: string       // 后端返回了
  contactPhone: string  // 后端返回了
  contactUrl: string    // 后端返回了
  qualification?: string // 后端返回了
  rehabProjects?: string // 后端返回了
  feeStandard?: string   // 后端返回了
  
  // 后端返回的是 diseaseIds 数组，没有直接返回 diseaseCount
  diseaseIds?: number[] 
  diseases?: DiseaseOption[] // 详情接口可能返回，列表接口通常只返回 IDs
  
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  
  // 后端新增字段
  rating?: number
  status?: string // 'active' etc.
  
  createdAt?: string
  updatedAt?: string
  
  // 前端计算属性或后端可能补充的字段
  diseaseCount?: number 
}



export interface RehabInstitutionListParams {
  page: number
  pageSize: number
  keyword?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  auditStatus?: number | null
  diseaseId?: number | null
}

export interface RehabInstitutionListData {
  list: RehabInstitutionItem[]
  total: number
  page?: number
  pageSize?: number
}



export interface DiseaseOption {
  id: number
  name: string
  alias?: string
}

export interface RegionNode {
  code: string
  name: string
  fullName?: string
  children?: RegionNode[]
}

// ... 其他接口函数保持不变 ...
export const getRehabInstitutionList = (params: RehabInstitutionListParams): Promise<ApiResponse<RehabInstitutionListData>> => {
  return request({
    url: '/resource/rehab/institutions',
    method: 'get',
    params,
  })
}

export const getRehabInstitutionDetail = (id: number): Promise<ApiResponse<RehabInstitutionItem>> => {
  return request({
    url: `/resource/rehab/institutions/${id}`,
    method: 'get',
  })
}

export const addRehabInstitution = (data: Partial<RehabInstitutionItem>): Promise<ApiResponse> => {
  return request({
    url: '/resource/rehab/institutions',
    method: 'post',
    data,
  })
}

export const updateRehabInstitution = (id: number, data: Partial<RehabInstitutionItem>): Promise<ApiResponse> => {
  return request({
    url: `/resource/rehab/institutions/${id}`,
    method: 'put',
    data,
  })
}

export const deleteRehabInstitution = (id: number): Promise<ApiResponse> => {
  return request({
    url: `/resource/rehab/institutions/${id}`,
    method: 'delete',
  })
}

export const getRegionTree = (): Promise<ApiResponse<RegionNode[]>> => {
  return request({
    url: '/region/tree',
    method: 'get',
  })
}

export async function searchDiseaseOptions(keyword: string): Promise<DiseaseOption[]> {
  const res = await getDiseaseList({
    page: 1,
    pageSize: 20,
    keyword,
    status: 1,
  })
  // 注意：这里假设 getDiseaseList 返回的结构也需要适配，或者保持原有逻辑
  // 如果 getDiseaseList 也返回 ApiResponse，则需要访问 res.data.list
  const raw = (res as any)?.data?.list || []
  return raw.map((item: any) => ({
    id: item.id,
    name: item.name,
    alias: item.alias,
  }))
}