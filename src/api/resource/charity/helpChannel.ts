import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

export type HelpChannelType =
  | 'emergency_help'
  | 'crowdfunding'
  | 'charity_consulting'
  | 'foundation_support'
  | ''

// 修改点：字段名改为小驼峰，与后端返回一致
export interface HelpChannelItem {
  id: number
  channelType: HelpChannelType // 原 channel_type
  name: string
  applyCondition: string       // 原 apply_condition
  responseTime: string         // 原 response_time
  contactPhone?: string        // 原 contact_phone
  contactUrl?: string          // 原 contact_url
  helpLetterTemplate?: string  // 原 help_letter_template
  crowdfundingTemplate?: string // 原 crowdfunding_template
  auditStatus: 0 | 1 | 2       // 原 audit_status
  rejectReason?: string        // 原 reject_reason
  sort: number
  createdAt?: string           // 原 created_at
  updatedAt?: string           // 原 updated_at
}

export interface HelpChannelListParams {
  page: number
  pageSize: number
  keyword?: string
  channelType?: HelpChannelType // 查询参数通常保持后端要求的格式，如果后端查询也支持小驼峰则需修改，这里假设查询参数仍用下划线或根据后端实际要求调整。根据常见习惯，GET参数有时混用，若后端报错需改为 channelType
  auditStatus?: number | ''     // 同上
}

export interface HelpChannelListResponse {
  list: HelpChannelItem[]
  total: number
}

export const getHelpChannelList = (params: HelpChannelListParams) => {
  return request<ApiResponse<HelpChannelListResponse>>({
    url: '/resource/charity/channels',
    method: 'get',
    params,
  })
}

export const getHelpChannelDetail = (id: number) => {
  return request<ApiResponse<HelpChannelItem>>({
    url: `/resource/charity/channels/${id}`,
    method: 'get',
  })
}

export const addHelpChannel = (data: Partial<HelpChannelItem>) => {
  return request<ApiResponse>({
    url: '/resource/charity/channels',
    method: 'post',
    data,
  })
}

export const updateHelpChannel = (id: number, data: Partial<HelpChannelItem>) => {
  return request<ApiResponse>({
    url: `/resource/charity/channels/${id}`,
    method: 'put',
    data,
  })
}

export const deleteHelpChannel = (id: number) => {
  return request<ApiResponse>({
    url: `/resource/charity/channels/${id}`,
    method: 'delete',
  })
}