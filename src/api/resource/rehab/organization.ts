import request from '@/utils/request'



// 后端返回的原始数据类型
export interface OrganizationResponse {
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
  services: string[]              // 服务列表
  rating: number                  // 评级
  isInsurance: boolean            // 是否医保
  description: string             // 机构描述
  coverUrl: string                // 封面图
  status: string                  // "active" | "inactive"
}

// 前端使用的数据类型（与后端字段映射）
export interface OrganizationItem {
  id: number
  title: string                   // 对应 name
  organization: string            // 对应 typeName
  contactPerson: string           // 从 contact 解析或留空
  contactInfo: string             // 对应 contact
  region: string                  // 对应 region
  description: string             // 对应 description
  serviceScope?: string           // 对应 services 数组转字符串
  qualification?: string          // 对应 rating
  status?: 0 | 1                  // 对应 status 字符串转数字
  createdAt?: string
  updatedAt?: string
}

// 列表接口返回结构
export interface OrganizationListResponse {
  list: OrganizationResponse[]
  total: number
  page: number
  pageSize: number
}

export const getOrganizationList = (params: any) => {
  return request<any, { data: OrganizationListResponse }>({ 
    url: '/resource/rehab/institutions', 
    method: 'get', 
    params 
  })
}

export const getOrganizationDetail = (id: number) => {
  return request<any, { data: OrganizationResponse }>({ 
    url: `/resource/rehab/institutions/${id}`, 
    method: 'get' 
  })
}

export const addOrganization = (data: Partial<OrganizationResponse>) => {
  return request({ url: '/resource/rehab/institutions', method: 'post', data })
}

export const updateOrganization = (id: number, data: Partial<OrganizationResponse>) => {
  return request({ url: `/resource/rehab/institutions/${id}`, method: 'put', data })
}

export const deleteOrganization = (id: number) => {
  return request({ url: `/resource/rehab/institutions/${id}`, method: 'delete' })
}

// 字段映射工具函数
export function mapToOrganizationItem(data: OrganizationResponse): OrganizationItem {
  return {
    id: data.id,
    title: data.name,
    organization: data.typeName,
    contactPerson: '', // 后端无单独联系人字段
    contactInfo: data.contact,
    region: data.region,
    description: data.description,
    serviceScope: data.services?.join('；') || '',
    qualification: data.rating?.toString() || '',
    status: data.status === 'active' ? 1 : 0
  }
}


// src/api/resource/rehab/organization.ts

// 前端转后端格式的工具函数
export function mapToOrganizationResponse(data: OrganizationItem): Partial<OrganizationResponse> {
  return {
    id: data.id,
    name: data.title,
    type: '', // 后端可能需要，根据实际情况填写
    typeName: data.organization,
    regionCode: '', // 后端可能需要，根据实际情况填写
    address: '', // 后端可能需要，根据实际情况填写
    phone: data.contactInfo,
    email: '', // 后端可能需要，根据实际情况填写
    website: '', // 后端可能需要，根据实际情况填写
    contact: data.contactInfo,
    region: data.region,
    description: data.description,
    services: data.serviceScope?.split(';').filter(s => s.trim()) || [],
    rating: data.qualification ? Number(data.qualification) : 0,
    isInsurance: false, // 后端可能需要，根据实际情况填写
    coverUrl: '', // 后端可能需要，根据实际情况填写
    status: data.status === 1 ? 'active' : 'inactive'
  }
}