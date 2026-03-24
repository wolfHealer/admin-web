// src/api/resource/medical/doctor.ts
import request from '@/utils/request'

export interface DoctorItem {
  id: number | string
  name: string
  department: string
  title: string
  hospitalId: number | string
  hospitalName: string
  specialty: string
  description: string
  status: number
}

export interface DoctorListParams {
  page: number
  pageSize: number
  keyword?: string
  department?: string
  title?: string
  hospitalId?: number | string
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

/**
 * 获取医生列表
 */
export const getDoctorList = (params: DoctorListParams): Promise<ApiResponse<{ list: DoctorItem[]; total: number }>> => {
  return request({
    url: '/resource/medical/doctors',
    method: 'get',
    params
  })
}

/**
 * 获取医生详情
 */
export const getDoctorDetail = (id: number | string): Promise<ApiResponse<DoctorItem>> => {
  return request({
    url: `/resource/medical/doctors/${id}`,
    method: 'get'
  })
}

/**
 * 新增医生
 */
export const addDoctor = (data: Partial<DoctorItem>): Promise<ApiResponse> => {
  return request({
    url: '/resource/medical/doctors',
    method: 'post',
    data
  })
}

/**
 * 更新医生
 */
export const updateDoctor = (id: number | string, data: Partial<DoctorItem>): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/doctors/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除医生
 */
export const deleteDoctor = (id: number | string): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/doctors/${id}`,
    method: 'delete'
  })
}

/**
 * 获取医院选项列表（用于下拉选择）
 */
export const getHospitalOptions = (): Promise<ApiResponse<{ id: number; name: string }[]>> => {
  return request({
    url: '/resource/medical/hospitals/options',
    method: 'get'
  })
}