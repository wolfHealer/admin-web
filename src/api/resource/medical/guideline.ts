// src/api/resource/medical/guideline.ts
import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface GuidelineItem {
  id: number
  title: string
  org: string
  summary: string
  year: string
  status?: 0 | 1
  createdAt?: string
  updatedAt?: string
}

export interface GuidelineListParams {
  page: number
  pageSize: number
  keyword?: string
  year?: string
  org?: string
}

export interface GuidelineListResponse {
  list: GuidelineItem[]
  total: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ==================== 诊疗指南相关接口 ====================
/**
 * 获取诊疗指南列表
 */
export const getGuidelineList = (
  params: GuidelineListParams
): Promise<ApiResponse<GuidelineListResponse>> => {
  return request({
    url: '/resource/medical/guides',
    method: 'get',
    params
  })
}

/**
 * 获取诊疗指南详情
 */
export const getGuidelineDetail = (
  id: number
): Promise<ApiResponse<GuidelineItem>> => {
  return request({
    url: `/resource/medical/guides/${id}`,
    method: 'get'
  })
}

/**
 * 新增诊疗指南
 */
export const addGuideline = (
  data: Partial<GuidelineItem>
): Promise<ApiResponse> => {
  return request({
    url: '/resource/medical/guides',
    method: 'post',
    data
  })
}

/**
 * 更新诊疗指南
 */
export const updateGuideline = (
  id: number,
  data: Partial<GuidelineItem>
): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/guides/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除诊疗指南
 */
export const deleteGuideline = (
  id: number
): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/guides/${id}`,
    method: 'delete'
  })
}