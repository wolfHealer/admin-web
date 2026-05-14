
import request from '@/utils/request'
import { getDiseaseList } from '@/api/knowledge/knowledge'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

export interface DiseaseOption {
  id: number
  name: string
  alias?: string
}

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

const normalizeDisease = (item: any): DiseaseOption => ({
  id: Number(item.id),
  name: item.name,
  alias: item.alias || ''
})

const normalizeHospital = (item: any): HospitalItem => ({
  id: Number(item.id),
  name: item.name || '',
  provinceCode: item.provinceCode || '',
  provinceName: item.provinceName || '',
  cityCode: item.cityCode || '',
  cityName: item.cityName || '',
  districtCode: item.districtCode || '',
  districtName: item.districtName || '',
  level: String(item.level ?? ''),
  isRareNetwork: Number(item.isRareNetwork ?? 0),
  treatScope: item.treatScope || '',
  address: item.address || '',
  phone: item.phone || '',
  hospitalUrl: item.hospitalUrl || '',
  auditStatus: Number(item.auditStatus ?? 0),
  rejectReason: item.rejectReason || '',
  diseaseIds: (item.diseaseIds || []).map((v: number | string) => Number(v)),
  diseases: (item.diseases || []).map(normalizeDisease),
  diseaseCount: Number(item.diseases?.length ?? 0),
  createdAt: item.createdAt || '',
  updatedAt: item.updatedAt || '',
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
  const res = await request.get('/resource/medical/hospitals', { params })
  const payload = res.data || {}
  return {
    ...res,
    data: {
      list: (payload.list || []).map(normalizeHospital),
      total: Number(payload.total || 0),
    },
  }
}

export const getHospitalDetail = async (id: number | string): Promise<ApiResponse<HospitalItem>> => {
  const res = await request.get(`/resource/medical/hospitals/${id}`)
  return {
    ...res,
    data: normalizeHospital(res.data || {}),
  }
}

export const addHospital = (data: HospitalForm): Promise<ApiResponse> => {
  return request.post('/resource/medical/hospitals', toSubmitPayload(data))
}

export const updateHospital = (id: number | string, data: HospitalForm): Promise<ApiResponse> => {
  return request.put(`/resource/medical/hospitals/${id}`, toSubmitPayload(data))
}

export const deleteHospital = (id: number | string): Promise<ApiResponse> => {
  return request.delete(`/resource/medical/hospitals/${id}`)
}

export const getHospitalOptions = async (keyword = ''): Promise<DiseaseOption[]> => {
  const res = await request.get('/resource/medical/hospitals/options', { params: { keyword } })
  return (res.data || []).map((item: any) => ({ id: Number(item.id), name: item.name }))
}

export const searchDiseaseOptions = async (keyword = ''): Promise<DiseaseOption[]> => {
  const res: any = await getDiseaseList({
    page: 1,
    pageSize: 20,
    keyword,
    status: 1,
  })
  return ((res.data?.list || []) as any[]).map(normalizeDisease)
}
