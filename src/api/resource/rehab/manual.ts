// src/api/resource/rehab/Manual.ts
import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface ManualItem {
  id: number
  title: string                    // 手册标题
  diseaseType: string              // 适用疾病类型
  careType: string                 // 护理类型 (日常护理/术后护理/特殊护理)
  targetGroup: string              // 适用人群
  content: string                  // 护理内容
  precautions: string              // 注意事项
  fileUrl?: string                 // 文件链接
  videoUrl?: string                // 视频链接
  status?: 0 | 1
  createdAt?: string
  updatedAt?: string
}

export interface ManualListParams {
  page: number
  pageSize: number
  keyword?: string
  diseaseType?: string
  careType?: string
}

export interface ManualListResponse {
  list: ManualItem[]
  total: number
  page: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ==================== 居家护理手册相关接口 ====================
export const getManualList = (
  params: ManualListParams
): Promise<ApiResponse<ManualListResponse>> => {
  return request({
    url: '/resource/rehab/manuals',
    method: 'get',
    params
  })
}

export const getManualDetail = (
  id: number
): Promise<ApiResponse<ManualItem>> => {
  return request({
    url: `/resource/rehab/manuals/${id}`,
    method: 'get'
  })
}

export const addManual = (
  data: Partial<ManualItem>
): Promise<ApiResponse> => {
  return request({
    url: '/resource/rehab/manuals',
    method: 'post',
    data
  })
}

export const updateManual = (
  id: number,
  data: Partial<ManualItem>
): Promise<ApiResponse> => {
  return request({
    url: `/resource/rehab/manuals/${id}`,
    method: 'put',
    data
  })
}

export const deleteManual = (
  id: number
): Promise<ApiResponse> => {
  return request({
    url: `/resource/rehab/manuals/${id}`,
    method: 'delete'
  })
}