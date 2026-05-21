import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import {
  asFlag,
  asNumber,
  asString,
  mapDetailResponse,
  mapListResponse,
  pickField,
  type RawRecord,
} from '@/api/resource/shared/normalize'

export interface RegionNode {
  id?: number
  code: string
  name: string
  fullName?: string
  parentCode?: string
  level?: number
  children?: RegionNode[]
}

export interface RareDrugOption {
  id: number
  genericName: string
  brandName?: string
}

export interface DrugChannelItem {
  id: number
  drugId: number
  drugGenericName?: string
  drugBrandName?: string
  channelType: string
  name: string
  qualification?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  provinceName?: string
  cityName?: string
  districtName?: string
  address?: string
  contactPhone?: string
  contactUrl?: string
  deliveryScope: string
  deliveryCycle: string
  isInsuranceSettle: 0 | 1
  isLaunched: 0 | 1
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  createdAt?: string
  updatedAt?: string
  drugs?: RareDrugOption[]
}

export interface DrugChannelListParams {
  page: number
  pageSize: number
  keyword?: string
  drugId?: number | ''
  channelType?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  isInsuranceSettle?: number | ''
  auditStatus?: number | ''
}

export interface DrugChannelForm {
  drugId: number
  channelType: string
  name: string
  qualification?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  provinceName?: string
  cityName?: string
  districtName?: string
  address?: string
  contactPhone?: string
  contactUrl?: string
  deliveryScope: string
  deliveryCycle: string
  isInsuranceSettle: number
  auditStatus: number
  rejectReason?: string
}

/** @deprecated 使用 DrugChannelForm */
export type DrugChannelSubmitPayload = DrugChannelForm

const normalizeDrugOption = (raw: RawRecord): RareDrugOption => ({
  id: asNumber(raw.id),
  genericName: asString(pickField(raw, 'genericName', 'generic_name')),
  brandName: asString(pickField(raw, 'brandName', 'brand_name')),
})

const normalizeDrugChannel = (raw: RawRecord): DrugChannelItem => ({
  id: asNumber(raw.id),
  drugId: asNumber(pickField(raw, 'drugId', 'drug_id')),
  drugGenericName: asString(pickField(raw, 'drugGenericName', 'drug_generic_name')),
  drugBrandName: asString(pickField(raw, 'drugBrandName', 'drug_brand_name')),
  channelType: asString(pickField(raw, 'channelType', 'channel_type')),
  name: asString(pickField(raw, 'name')),
  qualification: asString(pickField(raw, 'qualification')),
  provinceCode: asString(pickField(raw, 'provinceCode', 'province_code')),
  cityCode: asString(pickField(raw, 'cityCode', 'city_code')),
  districtCode: asString(pickField(raw, 'districtCode', 'district_code')),
  provinceName: asString(pickField(raw, 'provinceName', 'province_name')),
  cityName: asString(pickField(raw, 'cityName', 'city_name')),
  districtName: asString(pickField(raw, 'districtName', 'district_name')),
  address: asString(pickField(raw, 'address')),
  contactPhone: asString(pickField(raw, 'contactPhone', 'contact_phone')),
  contactUrl: asString(pickField(raw, 'contactUrl', 'contact_url')),
  deliveryScope: asString(pickField(raw, 'deliveryScope', 'delivery_scope')),
  deliveryCycle: asString(pickField(raw, 'deliveryCycle', 'delivery_cycle')),
  isInsuranceSettle: asFlag(pickField(raw, 'isInsuranceSettle', 'is_insurance_settle')),
  isLaunched: asFlag(pickField(raw, 'isLaunched', 'is_launched')),
  auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')) as 0 | 1 | 2,
  rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
  drugs: Array.isArray(raw.drugs) ? raw.drugs.map((item) => normalizeDrugOption(item as RawRecord)) : [],
  createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
  updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
})

const toSubmitPayload = (data: DrugChannelForm) => ({
  drugId: data.drugId,
  channelType: data.channelType,
  name: data.name,
  qualification: data.qualification || '',
  provinceCode: data.provinceCode || '',
  cityCode: data.cityCode || '',
  districtCode: data.districtCode || '',
  provinceName: data.provinceName || '',
  cityName: data.cityName || '',
  districtName: data.districtName || '',
  address: data.address || '',
  contactPhone: data.contactPhone || '',
  contactUrl: data.contactUrl || '',
  deliveryScope: data.deliveryScope,
  deliveryCycle: data.deliveryCycle,
  isInsuranceSettle: data.isInsuranceSettle,
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
})

export const getPurchaseChannelList = async (
  params: DrugChannelListParams
): Promise<ApiResponse<{ list: DrugChannelItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/drug/channels', { params })
  return mapListResponse(res, normalizeDrugChannel)
}

export const getPurchaseChannelDetail = async (id: number | string): Promise<ApiResponse<DrugChannelItem>> => {
  const res = await request.get<RawRecord>(`/resource/drug/channels/${id}`)
  return mapDetailResponse(res, normalizeDrugChannel)
}

export const addPurchaseChannel = (data: DrugChannelForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/drug/channels', toSubmitPayload(data))
}

export const updatePurchaseChannel = (id: number | string, data: DrugChannelForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/drug/channels/${id}`, toSubmitPayload(data))
}

export const deletePurchaseChannel = (id: number | string): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/drug/channels/${id}`)
}

export const getRegionTree = (): Promise<ApiResponse<RegionNode[]>> => {
  return request.get('/region/tree')
}

export const getRareDrugOptions = async (keyword = ''): Promise<ApiResponse<{ list: RareDrugOption[] }>> => {
  const res = await request.get<{ list?: RawRecord[] }>('/resource/drug/drugs', {
    params: { page: 1, pageSize: 20, keyword, auditStatus: 1 },
  })
  const list = (res.data?.list ?? []).map(normalizeDrugOption)
  return { ...res, data: { list } }
}
