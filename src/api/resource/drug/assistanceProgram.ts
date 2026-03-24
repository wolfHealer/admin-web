// src/api/resource/drug/assistanceProgram.ts
import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface AssistanceProgramItem {
  id: number
  name: string                    // 项目名称
  organizer: string               // 组织机构
  drugId: number                  // 药品 ID
  condition: string               // 申请条件
  dosage: string                  // 赠药剂量
  period: string                  // 援助周期
  applyForm: string               // 申请表链接
  applyGuide: string              // 申请指南链接
  materialList: string            // 材料清单链接
  progressQuery: string           // 进度查询方式
  diseaseValue: number            // 疾病类型 ID
  status?: 0 | 1                  // 状态 (可选)
  createdAt?: string              // 创建时间
  updatedAt?: string              // 更新时间
}

export interface AssistanceProgramListParams {
  page: number
  pageSize: number
  keyword?: string
  organizer?: string
  diseaseValue?: number | null
}

export interface AssistanceProgramListResponse {
  list: AssistanceProgramItem[]
  total: number
  page: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ==================== 援助项目相关接口 ====================
/**
 * 获取援助项目列表
 */
export const getAssistanceProgramList = (
  params: AssistanceProgramListParams
): Promise<ApiResponse<AssistanceProgramListResponse>> => {
  return request({
    url: '/resource/drug/donations',
    method: 'get',
    params
  })
}

/**
 * 获取援助项目详情
 */
export const getAssistanceProgramDetail = (
  id: number
): Promise<ApiResponse<AssistanceProgramItem>> => {
  return request({
    url: `/resource/drug/donations/${id}`,
    method: 'get'
  })
}

/**
 * 新增援助项目
 */
export const addAssistanceProgram = (
  data: Partial<AssistanceProgramItem>
): Promise<ApiResponse> => {
  return request({
    url: '/resource/drug/donations',
    method: 'post',
    data
  })
}

/**
 * 更新援助项目
 */
export const updateAssistanceProgram = (
  id: number,
  data: Partial<AssistanceProgramItem>
): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/donations/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除援助项目
 */
export const deleteAssistanceProgram = (
  id: number
): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/donations/${id}`,
    method: 'delete'
  })
}