import request from '@/utils/request'

export interface CategoryTreeNode {
  id: number
  parentId: number
  level: number
  name: string
  code: string
  description?: string
  iconUrl?: string
  sortOrder: number
  status: 0 | 1
  children?: CategoryTreeNode[]
  createdAt?: string
  updatedAt?: string
}

export interface TagItem {
  id: number
  name: string
  code: string
  sortOrder: number
  status: 0 | 1
  useCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface SimpleCategory {
  id: number
  name: string
  code: string
}

export interface SimpleTag {
  id: number
  name: string
  code: string
}

export interface Disease {
  id: number
  name: string
  alias?: string
  introduction?: string
  symptoms?: string
  images?: string[]
  status: 0 | 1
  primaryCategoryId?: number
  primaryCategoryName?: string
  categoryIds?: number[]
  categories?: SimpleCategory[]
  tagIds?: number[]
  tags?: SimpleTag[]
  createdAt?: string
  updatedAt?: string
}

export interface DiseaseListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: number | null
  categoryId?: number | null
  tagId?: number | null
}

export interface DiseaseSubmitPayload {
  name: string
  alias?: string
  introduction?: string
  symptoms?: string
  images?: string[]
  status: 0 | 1
  primaryCategoryId: number
  categoryIds: number[]
  tagIds: number[]
}

export interface CategorySubmitPayload {
  level: number
  name: string
  code: string
  parentId: number
  iconUrl?: string
  sortOrder?: number
  status?: 0 | 1
  description?: string
}

export interface TagSubmitPayload {
  name: string
  code: string
  sortOrder?: number
  status?: 0 | 1
}

export const getCategoryTree = () => {
  return request.get('/knowledge/categories/tree')
}

export const addCategory = (data: CategorySubmitPayload) => {
  return request.post('/knowledge/category', {
    name: data.name,
    code: data.code,
    parentId: data.parentId,
    iconUrl: data.iconUrl,
    sortOrder: data.sortOrder,
    status: data.status,
    description: data.description,
    level: data.level
  })
}

export const updateCategory = (id: number, data: Partial<CategorySubmitPayload>) => {
  return request.put(`/knowledge/category/${id}`, {
    name: data.name,
    code: data.code,
    parentId: data.parentId,
    iconUrl: data.iconUrl,
    sortOrder: data.sortOrder,
    status: data.status,
    description: data.description,
    level: data.level
  })
}

export const deleteCategory = (id: number) => {
  return request.delete(`/knowledge/category/${id}`)
}

export const getTagList = (params?: { keyword?: string; status?: number | null }) => {
  return request.get('/knowledge/tags', { params })
}

export const addTag = (data: TagSubmitPayload) => {
  return request.post('/knowledge/tag', {
    name: data.name,
    code: data.code,
    sort_order: data.sortOrder,
    status: data.status
  })
}

export const updateTag = (id: number, data: Partial<TagSubmitPayload>) => {
  return request.put(`/knowledge/tag/${id}`, {
    name: data.name,
    code: data.code,
    sort_order: data.sortOrder,
    status: data.status
  })
}

export const deleteTag = (id: number) => {
  return request.delete(`/knowledge/tag/${id}`)
}

export const getDiseaseList = (params: DiseaseListParams) => {
  return request.get('/knowledge/diseases', { params })
}

export const getDiseaseDetail = (id: number) => {
  return request.get(`/knowledge/disease/${id}`)
}

export const addDisease = (data: DiseaseSubmitPayload) => {
  return request.post('/knowledge/disease', {
    name: data.name,
    alias: data.alias,
    introduction: data.introduction,
    symptoms: data.symptoms,
    images: data.images,
    status: data.status,
    primary_category_id: data.primaryCategoryId,
    category_ids: data.categoryIds,
    tag_ids: data.tagIds
  })
}

export const updateDisease = (id: number, data: Partial<DiseaseSubmitPayload>) => {
  return request.put(`/knowledge/disease/${id}`, {
    name: data.name,
    alias: data.alias,
    introduction: data.introduction,
    symptoms: data.symptoms,
    images: data.images,
    status: data.status,
    primary_category_id: data.primaryCategoryId,
    category_ids: data.categoryIds,
    tag_ids: data.tagIds
  })
}

export const deleteDisease = (id: number) => {
  return request.delete(`/knowledge/disease/${id}`)
}
