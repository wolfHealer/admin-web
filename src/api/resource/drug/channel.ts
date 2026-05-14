import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
  msg?: string
}

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

export interface DrugChannelSubmitPayload {
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

export const getPurchaseChannelList = (params: DrugChannelListParams) => {
  return request.get('/resource/drug/channels', { params }) as Promise<ApiResponse<{ list: DrugChannelItem[]; total: number }>>
}

export const getPurchaseChannelDetail = (id: number | string) => {
  return request.get(`/resource/drug/channels/${id}`) as Promise<ApiResponse<DrugChannelItem>>
}

export const addPurchaseChannel = (data: DrugChannelSubmitPayload) => {
  return request.post('/resource/drug/channels', data) as Promise<ApiResponse>
}

export const updatePurchaseChannel = (id: number | string, data: DrugChannelSubmitPayload) => {
  return request.put(`/resource/drug/channels/${id}`, data) as Promise<ApiResponse>
}

export const deletePurchaseChannel = (id: number | string) => {
  return request.delete(`/resource/drug/channels/${id}`) as Promise<ApiResponse>
}

export const getRegionTree = () => {
  return request.get('/region/tree') as Promise<ApiResponse<RegionNode[]>>
}

export const getRareDrugOptions = (keyword = '') => {
  return request.get('/resource/drug/drugs', {
    params: {
      page: 1,
      page_size: 20,
      keyword,
      audit_status: 1
    }
  }) as Promise<ApiResponse<{ list: RareDrugOption[] }>>
}
