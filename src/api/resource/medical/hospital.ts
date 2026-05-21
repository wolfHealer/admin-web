import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { getDiseaseList } from '@/api/knowledge/knowledge'
import {
  asNumber,
  asString,
  fromDisease,
  normalizeDiseaseList,
  normalizeIdList,
  pickField,
  type DiseaseOption,
  type RawRecord,
} from '@/api/resource/shared/normalize'

export type { DiseaseOption }

export interface HospitalItem {
  id: number
  name: string
  provinceCode: string
  provinceName: string
  cityName: string
  cityCode: string
  districtName: string
  districtCode: string
  level: string
  isRareNetwork: number
  treatScope: string
  address: string
  phone: string
  hospitalUrl: string
  auditStatus: number
  rejectReason: string
  diseaseIds: number[]
  diseases: DiseaseOption[]
  diseaseCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface HospitalListParams {
  page: number
  pageSize: number
  keyword?: string
  level?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  isRareNetwork?: number | ''
  auditStatus?: number | ''
}

export interface HospitalForm {
  id?: number
  name: string
  provinceCode: string
  provinceName?: string
  cityCode: string
  cityName?: string
  districtCode: string
  districtName?: string
  level: string
  isRareNetwork: number
  treatScope?: string
  address: string
  phone: string
  hospitalUrl?: string
  auditStatus: number
  rejectReason?: string
  diseaseIds: number[]
}

const normalizeHospital = (raw: RawRecord): HospitalItem => ({
  id: asNumber(raw.id),
  name: asString(pickField(raw, 'name')),
  provinceCode: asString(pickField(raw, 'provinceCode', 'province_code')),
  provinceName: asString(pickField(raw, 'provinceName', 'province_name')),
  cityCode: asString(pickField(raw, 'cityCode', 'city_code')),
  cityName: asString(pickField(raw, 'cityName', 'city_name')),
  districtCode: asString(pickField(raw, 'districtCode', 'district_code')),
  districtName: asString(pickField(raw, 'districtName', 'district_name')),
  level: asString(pickField(raw, 'level')),
  isRareNetwork: asNumber(pickField(raw, 'isRareNetwork', 'is_rare_network')),
  treatScope: asString(pickField(raw, 'treatScope', 'treat_scope')),
  address: asString(pickField(raw, 'address')),
  phone: asString(pickField(raw, 'phone')),
  hospitalUrl: asString(pickField(raw, 'hospitalUrl', 'hospital_url')),
  auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')),
  rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
  diseaseIds: normalizeIdList(pickField(raw, 'diseaseIds', 'disease_ids')),
  diseases: normalizeDiseaseList(pickField(raw, 'diseases')),
  diseaseCount: normalizeDiseaseList(pickField(raw, 'diseases')).length,
  createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
  updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
})

const toSubmitPayload = (data: HospitalForm) => ({
  name: data.name,
  provinceCode: data.provinceCode,
  provinceName: data.provinceName,
  cityCode: data.cityCode,
  cityName: data.cityName,
  districtCode: data.districtCode,
  districtName: data.districtName || '',
  level: data.level,
  isRareNetwork: data.isRareNetwork,
  treatScope: data.treatScope || '',
  address: data.address,
  phone: data.phone,
  hospitalUrl: data.hospitalUrl || '',
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
  diseaseIds: data.diseaseIds || [],
})

export const getHospitalList = async (params: HospitalListParams): Promise<ApiResponse<{ list: HospitalItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/medical/hospitals', { params })
  const payload = res.data ?? {}
  return {
    ...res,
    data: {
      list: (payload.list ?? []).map(normalizeHospital),
      total: Number(payload.total ?? 0),
    },
  }
}

export const getHospitalDetail = async (id: number | string): Promise<ApiResponse<HospitalItem>> => {
  const res = await request.get<RawRecord>(`/resource/medical/hospitals/${id}`)
  return {
    ...res,
    data: normalizeHospital(res.data ?? {}),
  }
}

export const addHospital = (data: HospitalForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/medical/hospitals', toSubmitPayload(data))
}

export const updateHospital = (id: number | string, data: HospitalForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/medical/hospitals/${id}`, toSubmitPayload(data))
}

export const deleteHospital = (id: number | string): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/medical/hospitals/${id}`)
}

export const getHospitalOptions = async (keyword = ''): Promise<DiseaseOption[]> => {
  const res = await request.get<RawRecord[]>('/resource/medical/hospitals/options', { params: { keyword } })
  return (res.data ?? []).map((item) => ({ id: Number(item.id), name: String(item.name) }))
}

export const searchDiseaseOptions = async (keyword = ''): Promise<DiseaseOption[]> => {
  const res = await getDiseaseList({
    page: 1,
    pageSize: 20,
    keyword,
    status: 1,
  })
  return (res.data?.list ?? []).map(fromDisease)
}
