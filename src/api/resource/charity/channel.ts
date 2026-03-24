// src/api/resource/charity/charity.ts
import request from '@/utils/request'

export interface CharityParams {
  page: number
  pageSize: number
  keyword?: string
  status?: string
  type?: string
}




export interface CharityChannel {
  id: number
  title: string
  channelType: string
  contactInfo: string
  status: number
  uploadTime: string
  description?: string
  fileUrl?: string
}



// ============ 求助通道指引 ============
export const getChannelList = (params: CharityParams) => {
  return request({
    url: '/resource/charity/channels',
    method: 'get',
    params
  })
}

export const getChannelDetail = (id: number) => {
  return request({
    url: `/resource/charity/channels/${id}`,
    method: 'get'
  })
}

export const addChannel = (data: Partial<CharityChannel>) => {
  return request({
    url: '/resource/charity/channels',
    method: 'post',
    data
  })
}

export const updateChannel = (id: number, data: Partial<CharityChannel>) => {
  return request({
    url: `/resource/charity/channels/${id}`,
    method: 'put',
    data
  })
}

export const deleteChannel = (id: number) => {
  return request({
    url: `/resource/charity/channels/${id}`,
    method: 'delete'
  })
}