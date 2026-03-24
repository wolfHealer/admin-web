// src/api/resource/medical/examination.ts
import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface ExaminationItem {
  id: number
  name: string
  type: string
  price: number
  description?: string
  status: 0 | 1
  createdAt?: string
  updatedAt?: string
}

export interface ExaminationListParams {
  page: number
  pageSize: number
  keyword?: string
  type?: string
  status?: number | null
}

export interface ExaminationListResponse {
  list: ExaminationItem[]
  total: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ==================== 检查项目相关接口 ====================
/**
 * 获取检查项目列表
 */
export const getExaminationList = (
  params: ExaminationListParams
): Promise<ApiResponse<ExaminationListResponse>> => {
  return request({
    url: '/resource/medical/examinations',
    method: 'get',
    params
  })
}

/**
 * 获取检查项目详情
 */
export const getExaminationDetail = (
  id: number
): Promise<ApiResponse<ExaminationItem>> => {
  return request({
    url: `/resource/medical/examinations/${id}`,
    method: 'get'
  })
}

/**
 * 新增检查项目
 */
export const addExamination = (
  data: Partial<ExaminationItem>
): Promise<ApiResponse> => {
  return request({
    url: '/resource/medical/examinations',
    method: 'post',
    data
  })
}

/**
 * 更新检查项目
 */
export const updateExamination = (
  id: number,
  data: Partial<ExaminationItem>
): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/examinations/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除检查项目
 */
export const deleteExamination = (
  id: number
): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/examinations/${id}`,
    method: 'delete'
  })
}