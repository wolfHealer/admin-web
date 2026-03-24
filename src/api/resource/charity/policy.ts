// src/api/resource/charity/charity.ts
import request from '@/utils/request'

export interface CharityParams {
  page: number
  pageSize: number
  keyword?: string
  status?: string
  type?: string
}



export interface CharityPolicy {
  id: number
  title: string
  policyType: string
  region: string
  status: number
  uploadTime: string
  content?: string
  fileUrl?: string
}




// ============ 医保政策解读 ============
export const getPolicyList = (params: CharityParams) => {
  return request({
    url: '/resource/charity/policies',
    method: 'get',
    params
  })
}

export const getPolicyDetail = (id: number) => {
  return request({
    url: `/resource/charity/policies/${id}`,
    method: 'get'
  })
}

export const addPolicy = (data: Partial<CharityPolicy>) => {
  return request({
    url: '/resource/charity/policies',
    method: 'post',
    data
  })
}

export const updatePolicy = (id: number, data: Partial<CharityPolicy>) => {
  return request({
    url: `/resource/charity/policies/${id}`,
    method: 'put',
    data
  })
}

export const deletePolicy = (id: number) => {
  return request({
    url: `/resource/charity/policies/${id}`,
    method: 'delete'
  })
}