// src/api/resource/rehab/psychologicalSupport.ts
import request from '@/utils/request'

// ==================== 后端返回的原始数据类型 ====================
export interface PsychologicalSupportResponse {
  id: number
  name: string                    // 机构名称
  type: string                    // 机构类型
  typeName: string                // 类型名称
  region: string                  // 服务区域
  regionCode: string
  address: string                 // 详细地址
  contact: string                 // 联系信息
  phone: string
  email: string
  website: string
  isFree: boolean                 // 是否免费
  serviceTime: string             // 服务时间
  description: string             // 服务描述
  services: string[]              // 服务项目列表
  rating: number                  // 评级
  coverUrl: string                // 封面图
  status: string                  // "active" | "inactive"
}

// ==================== 前端使用的数据类型 ====================
export interface PsychologicalSupportItem {
  id: number
  title: string                   // 对应 name
  resourceType: string            // 对应 typeName
  provider: string                // 对应 name 或 typeName
  contactInfo: string             // 对应 contact
  serviceHours: string            // 对应 serviceTime
  description: string             // 对应 description
  region: string                  // 对应 region
  isFree: boolean                 // 对应 isFree
  services?: string[]             // 对应 services
  rating?: number                 // 对应 rating
  status?: 0 | 1                  // 对应 status 字符串转数字
  createdAt?: string
  updatedAt?: string
}

// ==================== 列表接口返回结构 ====================
export interface PsychologicalSupportListResponse {
  list: PsychologicalSupportResponse[]
  total: number
  page: number
  pageSize: number
}

export interface PsychologicalSupportListParams {
  page: number
  pageSize: number
  keyword?: string
  resourceType?: string
  region?: string
  isFree?: boolean | null
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ==================== 心理支持资源相关接口 ====================
export const getPsychologicalSupportList = (
  params: PsychologicalSupportListParams
): Promise<ApiResponse<PsychologicalSupportListResponse>> => {
  return request({
    url: '/resource/rehab/psychological/orgs',
    method: 'get',
    params
  })
}

export const getPsychologicalSupportDetail = (
  id: number
): Promise<ApiResponse<PsychologicalSupportResponse>> => {
  return request({
    url: `/resource/rehab/psychological/orgs/${id}`,
    method: 'get'
  })
}

export const addPsychologicalSupport = (
  data: Partial<PsychologicalSupportResponse>
): Promise<ApiResponse> => {
  return request({
    url: '/resource/rehab/psychological/orgs',
    method: 'post',
    data
  })
}

export const updatePsychologicalSupport = (
  id: number,
  data: Partial<PsychologicalSupportResponse>
): Promise<ApiResponse> => {
  return request({
    url: `/resource/rehab/psychological/orgs/${id}`,
    method: 'put',
    data
  })
}

export const deletePsychologicalSupport = (
  id: number
): Promise<ApiResponse> => {
  return request({
    url: `/resource/rehab/psychological/orgs/${id}`,
    method: 'delete'
  })
}

// ==================== 数据映射函数 ====================
// 后端数据转前端格式
export function mapToPsychologicalSupportItem(
  data: PsychologicalSupportResponse
): PsychologicalSupportItem {
  return {
    id: data.id,
    title: data.name,
    resourceType: data.typeName,
    provider: data.name,
    contactInfo: data.contact,
    serviceHours: data.serviceTime,
    description: data.description,
    region: data.region,
    isFree: data.isFree,
    services: data.services,
    rating: data.rating,
    status: data.status === 'active' ? 1 : 0
  }
}

// 前端数据转后端格式
export function mapToPsychologicalSupportResponse(
  data: PsychologicalSupportItem
): Partial<PsychologicalSupportResponse> {
  return {
    id: data.id,
    name: data.title,
    type: '',
    typeName: data.resourceType,
    region: data.region,
    regionCode: '',
    address: '',
    contact: data.contactInfo,
    phone: '',
    email: '',
    website: '',
    isFree: data.isFree,
    serviceTime: data.serviceHours,
    description: data.description,
    services: data.services || [],
    rating: data.rating || 0,
    coverUrl: '',
    status: data.status === 1 ? 'active' : 'inactive'
  }
}