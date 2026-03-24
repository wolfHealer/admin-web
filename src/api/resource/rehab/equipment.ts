// src/api/resource/rehab/equipment.ts
import request from '@/utils/request'

// 后端返回的原始数据类型
export interface EquipmentResponse {
  id: number
  name: string                    // 设备名称
  category: string                // 设备分类
  categoryName: string            // 分类名称
  desc: string                    // 设备描述
  suitableFor: string[]           // 适用人群
  priceRange: string              // 价格范围
  insuranceCovered: boolean       // 是否医保
  coverUrl: string                // 封面图
  guideUrl: string                // 指导文档
  videoUrl: string                // 视频链接
  status: string                  // "active" | "inactive"
}

// 前端使用的数据类型（与后端字段映射）
export interface EquipmentItem {
  id: number
  title: string                   // 对应 name
  equipmentModel?: string         // 对应 categoryName
  manufacturer?: string           // 后端无此字段，可留空或从其他字段映射
  contactPerson: string           // 后端无此字段，留空
  contactInfo: string             // 后端无此字段，留空
  region: string                  // 后端无此字段，留空
  description: string             // 对应 desc
  availableQuantity?: number      // 后端无此字段，留空
  suitableFor?: string            // 对应 suitableFor 数组转字符串
  priceRange?: string             // 对应 priceRange
  insuranceCovered?: boolean      // 对应 insuranceCovered
  status?: 0 | 1                  // 对应 status 字符串转数字
  createdAt?: string
  updatedAt?: string
}

// 列表接口返回结构
export interface EquipmentListResponse {
  list: EquipmentResponse[]
  total: number
  page: number
  pageSize: number
}

export const getEquipmentList = (params: any) => {
  return request<any, { data: EquipmentListResponse }>({ 
    url: '/resource/rehab/devices', 
    method: 'get', 
    params 
  })
}

export const getEquipmentDetail = (id: number) => {
  return request<any, { data: EquipmentResponse }>({ 
    url: `/resource/rehab/devices/${id}`, 
    method: 'get' 
  })
}

export const addEquipment = (data: Partial<EquipmentResponse>) => {
  return request({ url: '/resource/rehab/devices', method: 'post', data })
}

export const updateEquipment = (id: number, data: Partial<EquipmentResponse>) => {
  return request({ url: `/resource/rehab/devices/${id}`, method: 'put', data })
}

export const deleteEquipment = (id: number) => {
  return request({ url: `/resource/rehab/devices/${id}`, method: 'delete' })
}

// 后端数据转前端格式的映射函数
export function mapToEquipmentItem(data: EquipmentResponse): EquipmentItem {
  return {
    id: data.id,
    title: data.name,
    equipmentModel: data.categoryName,
    manufacturer: '',
    contactPerson: '',
    contactInfo: '',
    region: '',
    description: data.desc,
    availableQuantity: 0,
    suitableFor: data.suitableFor?.join('；') || '',
    priceRange: data.priceRange,
    insuranceCovered: data.insuranceCovered,
    status: data.status === 'active' ? 1 : 0
  }
}

// 前端数据转后端格式的映射函数
export function mapToEquipmentResponse(data: EquipmentItem): Partial<EquipmentResponse> {
  return {
    id: data.id,
    name: data.title,
    category: '',
    categoryName: data.equipmentModel || '',
    desc: data.description,
    suitableFor: data.suitableFor?.split('；').filter(s => s.trim()) || [],
    priceRange: data.priceRange || '',
    insuranceCovered: data.insuranceCovered ?? false,
    coverUrl: '',
    guideUrl: '',
    videoUrl: '',
    status: data.status === 1 ? 'active' : 'inactive'
  }
}