// src/api/resource/charity/charity.ts
import request from '@/utils/request'

export interface CharityParams {
  page: number
  pageSize: number
  keyword?: string
  status?: string
  type?: string
}

export interface CharityProject {
  id: number
  title: string
  org?: string
  desc?: string
  status: string
  type: string
  disease?: number
  amount: string
  difficulty?: string
  uploadTime?: string
  contactInfo?: string
}



// ============ 救助项目库 ============
export const getProjectList = (params: CharityParams) => {
  return request({
    url: '/resource/charity/projects',
    method: 'get',
    params
  })
}

export const getProjectDetail = (id: number) => {
  return request({
    url: `/resource/charity/projects/${id}`,
    method: 'get'
  })
}

export const addProject = (data: Partial<CharityProject>) => {
  return request({
    url: '/resource/charity/projects',
    method: 'post',
    data
  })
}

export const updateProject = (id: number, data: Partial<CharityProject>) => {
  return request({
    url: `/resource/charity/projects/${id}`,
    method: 'put',
    data
  })
}

export const deleteProject = (id: number) => {
  return request({
    url: `/resource/charity/projects/${id}`,
    method: 'delete'
  })
}