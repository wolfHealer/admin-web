// src/api/knowledge.ts
import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface Category {
  id: number
  name: string
  description?: string
  iconUrl?: string
  sortOrder: number
  status: 0 | 1
  createdAt?: string
  updatedAt?: string
}

export interface CategoryListResponse {
  code: number
  data: {
    categories: Category[]
  }
  message: string
}

// ==================== 分类相关接口 ====================
// 获取分类列表
export const getCategoryList = () => {
  return request.get<any, CategoryListResponse>('/knowledge/categories')
}


// 修改：获取某分类下的疾病列表
export const getDiseaseListByCategory = (categoryId: number, params?: any) => {
  return request({
    url: `/knowledge/category/${categoryId}/diseases`,
    method: 'get',
    params
  })
}


export const addCategory = (data: {
  name: string
  iconUrl?: string
  sortOrder?: number
  status?: 0 | 1
  description?: string
}) => {
  const params = {
    name: data.name,
    description: data.description,
    icon_url: data.iconUrl,
    sort_order: data.sortOrder,
    status: data.status
  }
  return request.post('/knowledge/category', params)
}

export const updateCategory = (id: number, data: {
  name?: string
  iconUrl?: string
  sortOrder?: number
  status?: 0 | 1
  description?: string
}) => {
  const params = {
    name: data.name,
    description: data.description,
    icon_url: data.iconUrl,
    sort_order: data.sortOrder,
    status: data.status
  }
  return request.put(`/knowledge/category/${id}`, params)
}

export const deleteCategory = (id: number) => {
  return request.delete(`/knowledge/category/${id}`)
}

// ==================== 疾病相关接口 ====================
export interface Disease {
  id: number
  name: string
  alias?: string
  categoryId?: number
  categoryName?: string
  introduction?: string
  symptoms?: string
  guidelines?: string
  medications?: string
  experiences?: string
  images?: string[]
  status: 0 | 1
  creatorId?: number
  createdAt?: string
  updatedAt?: string
}

// 修改：适配后端返回的详情数据结构
export interface DiseaseDetailResponse {
  code: number
  data: {
    name: string
    alias?: string
    introduction?: string
    symptoms?: string
    guidelines?: string
    medications?: string
    experiences?: string
    images?: string[]
  }
  message: string
}

export interface DiseaseListResponse {
  code: number
  data: {
    list: Disease[]
    total: number
  }
  message: string
}

// ==================== 疾病相关接口 ====================
// 修改：URL 改为 /knowledge/disease/:id（单数）
export const getDiseaseDetail = (id: number) => {
  return request.get<any, DiseaseDetailResponse>(`/knowledge/disease/${id}`)
}

export const getDiseaseList = (params: {
  page: number
  pageSize: number
  keyword?: string
  status?: number | null
  categoryId?: number | null
  startDate?: string
  endDate?: string
}) => {
  return request.get<any, DiseaseListResponse>('/knowledge/diseases', { params })
}

export const addDisease = (data: {
  name: string
  alias?: string
  categoryId: number
  introduction?: string
  symptoms?: string
  guidelines?: string
  medications?: string
  experiences?: string
  images?: string[]
  status: 0 | 1
}) => {
  // 转换为下划线命名
  const params = {
    name: data.name,
    alias: data.alias,
    category_id: data.categoryId,
    introduction: data.introduction,
    symptoms: data.symptoms,
    guidelines: data.guidelines,
    medications: data.medications,
    experiences: data.experiences,
    images: data.images,
    status: data.status
  }
  return request.post('/knowledge/disease', params)
}

export const updateDisease = (id: number, data: {
  name?: string
  alias?: string
  categoryId?: number
  introduction?: string
  symptoms?: string
  guidelines?: string
  medications?: string
  experiences?: string
  images?: string[]
  status?: 0 | 1
}) => {
  // 转换为下划线命名
  const params = {
    name: data.name,
    alias: data.alias,
    category_id: data.categoryId,
    introduction: data.introduction,
    symptoms: data.symptoms,
    guidelines: data.guidelines,
    medications: data.medications,
    experiences: data.experiences,
    images: data.images,
    status: data.status
  }
  return request.put(`/knowledge/disease/${id}`, params)
}

export const deleteDisease = (id: number) => {
  return request.delete(`/knowledge/disease/${id}`)
}