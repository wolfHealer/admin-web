// src/api/resource/rehab/rehabilitationGuide.ts
import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface RehabilitationGuideItem {
  id: number
  title: string                    // 指南标题
  category: string                 // 分类 (肢体康复/认知康复/言语康复等)
  difficulty: string               // 难度等级
  duration: string                 // 训练时长
  description: string              // 详细描述
  videoUrl?: string                // 视频链接
  fileUrl?: string                 // 文件链接
  status?: 0 | 1                   // 状态
  createdAt?: string
  updatedAt?: string
}

export interface RehabilitationGuideListParams {
  page: number
  pageSize: number
  keyword?: string
  category?: string
  difficulty?: string
}

export interface RehabilitationGuideListResponse {
  list: RehabilitationGuideItem[]
  total: number
  page: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ==================== 康复训练指南相关接口 ====================
export const getRehabilitationGuideList = (
  params: RehabilitationGuideListParams
): Promise<ApiResponse<RehabilitationGuideListResponse>> => {
  return request({
    url: '/resource/rehab/trainings',
    method: 'get',
    params
  })
}

export const getRehabilitationGuideDetail = (
  id: number
): Promise<ApiResponse<RehabilitationGuideItem>> => {
  return request({
    url: `/resource/rehab/trainings/${id}`,
    method: 'get'
  })
}

export const addRehabilitationGuide = (
  data: Partial<RehabilitationGuideItem>
): Promise<ApiResponse> => {
  return request({
    url: '/resource/rehab/trainings',
    method: 'post',
    data
  })
}

export const updateRehabilitationGuide = (
  id: number,
  data: Partial<RehabilitationGuideItem>
): Promise<ApiResponse> => {
  return request({
    url: `/resource/rehab/trainings/${id}`,
    method: 'put',
    data
  })
}

export const deleteRehabilitationGuide = (
  id: number
): Promise<ApiResponse> => {
  return request({
    url: `/resource/rehab/trainings/${id}`,
    method: 'delete'
  })
}