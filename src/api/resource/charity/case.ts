// src/api/resource/charity/charity.ts
import request from '@/utils/request'

export interface CharityParams {
  page: number
  pageSize: number
  keyword?: string
  status?: string
  type?: string
}



export interface CharityCase {
  id: number
  title: string
  patientName: string
  disease: string
  status: number
  uploadTime: string
  content?: string
  images?: string[]
}


// ============ 救助案例分享 ============
export const getCaseList = (params: CharityParams) => {
  return request({
    url: '/resource/charity/cases',
    method: 'get',
    params
  })
}

export const getCaseDetail = (id: number) => {
  return request({
    url: `/resource/charity/cases/${id}`,
    method: 'get'
  })
}

export const addCase = (data: Partial<CharityCase>) => {
  return request({
    url: '/resource/charity/cases',
    method: 'post',
    data
  })
}

export const updateCase = (id: number, data: Partial<CharityCase>) => {
  return request({
    url: `/resource/charity/cases/${id}`,
    method: 'put',
    data
  })
}

export const deleteCase = (id: number) => {
  return request({
    url: `/resource/charity/cases/${id}`,
    method: 'delete'
  })
}