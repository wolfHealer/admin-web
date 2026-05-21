import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import {
  asNumber,
  asString,
  mapDetailResponse,
  mapListResponse,
  pickField,
  type RawRecord,
} from '@/api/resource/shared/normalize'

export type HelpChannelType =
  | 'emergency_help'
  | 'crowdfunding'
  | 'charity_consulting'
  | 'foundation_support'
  | ''

export interface HelpChannelItem {
  id: number
  channelType: HelpChannelType
  name: string
  applyCondition: string
  responseTime: string
  contactPhone?: string
  contactUrl?: string
  helpLetterTemplate?: string
  crowdfundingTemplate?: string
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  sort: number
  createdAt?: string
  updatedAt?: string
}

export interface HelpChannelListParams {
  page: number
  pageSize: number
  keyword?: string
  channelType?: HelpChannelType
  auditStatus?: number | ''
}

export interface HelpChannelForm {
  id?: number
  channelType: HelpChannelType
  name: string
  applyCondition: string
  responseTime: string
  contactPhone?: string
  contactUrl?: string
  helpLetterTemplate?: string
  crowdfundingTemplate?: string
  auditStatus: number
  rejectReason?: string
  sort: number
}

const normalizeHelpChannel = (raw: RawRecord): HelpChannelItem => ({
  id: asNumber(raw.id),
  channelType: asString(pickField(raw, 'channelType', 'channel_type')) as HelpChannelType,
  name: asString(pickField(raw, 'name')),
  applyCondition: asString(pickField(raw, 'applyCondition', 'apply_condition')),
  responseTime: asString(pickField(raw, 'responseTime', 'response_time')),
  contactPhone: asString(pickField(raw, 'contactPhone', 'contact_phone')),
  contactUrl: asString(pickField(raw, 'contactUrl', 'contact_url')),
  helpLetterTemplate: asString(pickField(raw, 'helpLetterTemplate', 'help_letter_template')),
  crowdfundingTemplate: asString(pickField(raw, 'crowdfundingTemplate', 'crowdfunding_template')),
  auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')) as 0 | 1 | 2,
  rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
  sort: asNumber(pickField(raw, 'sort')),
  createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
  updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
})

const toSubmitPayload = (data: HelpChannelForm) => ({
  channelType: data.channelType,
  name: data.name,
  applyCondition: data.applyCondition,
  responseTime: data.responseTime,
  contactPhone: data.contactPhone || '',
  contactUrl: data.contactUrl || '',
  helpLetterTemplate: data.helpLetterTemplate || '',
  crowdfundingTemplate: data.crowdfundingTemplate || '',
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
  sort: data.sort,
})

export const getHelpChannelList = async (
  params: HelpChannelListParams
): Promise<ApiResponse<{ list: HelpChannelItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/charity/channels', { params })
  return mapListResponse(res, normalizeHelpChannel)
}

export const getHelpChannelDetail = async (id: number): Promise<ApiResponse<HelpChannelItem>> => {
  const res = await request.get<RawRecord>(`/resource/charity/channels/${id}`)
  return mapDetailResponse(res, normalizeHelpChannel)
}

export const addHelpChannel = (data: HelpChannelForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/charity/channels', toSubmitPayload(data))
}

export const updateHelpChannel = (id: number, data: HelpChannelForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/charity/channels/${id}`, toSubmitPayload(data))
}

export const deleteHelpChannel = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/charity/channels/${id}`)
}
