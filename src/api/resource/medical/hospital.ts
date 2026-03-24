// src/api/resource/medical/hospital.ts
import request from '@/utils/request'

export interface HospitalItem {
  id: number | string
  name: string
  level: string
  type: string
  address: string
  phone: string
  status: number
}

export interface HospitalListParams {
  page: number
  pageSize: number
  keyword?: string
  level?: string
  type?: string
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

/**
 * 获取医院列表
 */
export const getHospitalList = (params: HospitalListParams): Promise<ApiResponse<{ list: HospitalItem[]; total: number }>> => {
  return request({
    url: '/resource/medical/hospitals',
    method: 'get',
    params
  })
}

/**
 * 获取医院详情
 */
export const getHospitalDetail = (id: number | string): Promise<ApiResponse<HospitalItem>> => {
  return request({
    url: `/resource/medical/hospitals/${id}`,
    method: 'get'
  })
}

/**
 * 新增医院
 */
export const addHospital = (data: Partial<HospitalItem>): Promise<ApiResponse> => {
  return request({
    url: '/resource/medical/hospitals',
    method: 'post',
    data
  })
}

/**
 * 更新医院
 */
export const updateHospital = (id: number | string, data: Partial<HospitalItem>): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/hospitals/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除医院
 */
export const deleteHospital = (id: number | string): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/hospitals/${id}`,
    method: 'delete'
  })
}

/**
 * 获取医院列表（用于下拉选择，不分页）
 */
export const getHospitalOptions = (): Promise<ApiResponse<HospitalItem[]>> => {
  return request({
    url: '/resource/medical/hospitals/options',
    method: 'get'
  })
}