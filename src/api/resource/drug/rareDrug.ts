// src/api/resource/drug/rareDrug.ts
import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface RareDrugItem {
  id: number
  name: string                    // 药品名称
  indication: string              // 适应症
  type: string                    // 药品类型 (imported/domestic 等)
  insurance: boolean              // 是否医保
  desc: string                    // 描述
  manualUrl?: string              // 说明书链接
  dosageForm: string              // 剂型
  spec: string                    // 规格
  refPrice: string                // 参考价格
  hasRelief: boolean              // 是否有救助
  isLaunched: boolean             // 是否上市
  needPrescription: boolean       // 是否需要处方
  status?: 0 | 1                  // 状态 (可选)
  createdAt?: string              // 创建时间
  updatedAt?: string              // 更新时间
}

export interface RareDrugListParams {
  page: number
  pageSize: number
  keyword?: string
  type?: string
  insurance?: boolean | null
  status?: number | null
}

export interface RareDrugListResponse {
  list: RareDrugItem[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ==================== 罕见病药品相关接口 ====================
/**
 * 获取罕见病药品列表
 */
export const getRareDrugList = (
  params: RareDrugListParams
): Promise<ApiResponse<RareDrugListResponse>> => {
  return request({
    url: '/resource/drug/drugs',
    method: 'get',
    params
  })
}

/**
 * 获取罕见病药品详情
 */
export const getRareDrugDetail = (
  id: number
): Promise<ApiResponse<RareDrugItem>> => {
  return request({
    url: `/resource/drug/drugs/${id}`,
    method: 'get'
  })
}

/**
 * 新增罕见病药品
 */
export const addRareDrug = (
  data: Partial<RareDrugItem>
): Promise<ApiResponse> => {
  return request({
    url: '/resource/drug/drugs',
    method: 'post',
    data
  })
}

/**
 * 更新罕见病药品
 */
export const updateRareDrug = (
  id: number,
  data: Partial<RareDrugItem>
): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/drugs/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除罕见病药品
 */
export const deleteRareDrug = (
  id: number
): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/drugs/${id}`,
    method: 'delete'
  })
}