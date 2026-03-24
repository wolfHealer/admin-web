// src/api/resource/drug/purchaseChannel.ts
import request from '@/utils/request'

// ==================== 类型定义 ====================
export interface PurchaseChannelItem {
  id: number
  name: string                    // 渠道名称
  type: string                    // 渠道类型 (医院药房/连锁药店/医药电商/合规代购)
  address: string                 // 地址
  desc: string                    // 描述
  region: string                  // 所在区域
  contact: string                 // 联系方式 (电话或网址)
  isInsurance: boolean            // 是否医保定点
  deliveryScope: string           // 配送范围
  deliveryCycle: string           // 配送周期
  status?: 0 | 1                  // 状态 (可选)
  createdAt?: string              // 创建时间
  updatedAt?: string              // 更新时间
}

export interface PurchaseChannelListParams {
  page: number
  pageSize: number
  keyword?: string
  type?: string
  isInsurance?: boolean | null
}

export interface PurchaseChannelListResponse {
  list: PurchaseChannelItem[]
  total: number
  page: number
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// ==================== 购药渠道相关接口 ====================
/**
 * 获取购药渠道列表
 */
export const getPurchaseChannelList = (
  params: PurchaseChannelListParams
): Promise<ApiResponse<PurchaseChannelListResponse>> => {
  return request({
    url: '/resource/drug/channels',
    method: 'get',
    params
  })
}

/**
 * 获取购药渠道详情
 */
export const getPurchaseChannelDetail = (
  id: number
): Promise<ApiResponse<PurchaseChannelItem>> => {
  return request({
    url: `/resource/drug/channels/${id}`,
    method: 'get'
  })
}

/**
 * 新增购药渠道
 */
export const addPurchaseChannel = (
  data: Partial<PurchaseChannelItem>
): Promise<ApiResponse> => {
  return request({
    url: '/resource/drug/channels',
    method: 'post',
    data
  })
}

/**
 * 更新购药渠道
 */
export const updatePurchaseChannel = (
  id: number,
  data: Partial<PurchaseChannelItem>
): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/channels/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除购药渠道
 */
export const deletePurchaseChannel = (
  id: number
): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/channels/${id}`,
    method: 'delete'
  })
}