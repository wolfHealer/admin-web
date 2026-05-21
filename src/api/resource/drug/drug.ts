import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import {
  asFlag,
  asNumber,
  asString,
  mapDetailResponse,
  mapListResponse,
  normalizeDiseaseList,
  normalizeIdList,
  pickField,
  type DiseaseOption,
  type RawRecord,
} from '@/api/resource/shared/normalize'

export type { DiseaseOption }

export interface RareDrugItem {
  id: number
  genericName: string
  brandName?: string
  indication: string
  dosageForm: string
  spec: string
  refPrice: number | string
  drugType: 'origin_import' | 'origin_domestic' | 'generic' | 'other' | ''
  isInsurance: 0 | 1
  hasRelief: 0 | 1
  isLaunched: 0 | 1
  needPrescription: 0 | 1
  manualOriginal?: string
  manualPopular?: string
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  diseaseCount?: number
  diseaseIds?: number[]
  diseases?: DiseaseOption[]
  createdAt?: string
  updatedAt?: string
}

export interface RareDrugListParams {
  page: number
  pageSize: number
  keyword?: string
  drugType?: string
  isInsurance?: number | ''
  hasRelief?: number | ''
  isLaunched?: number | ''
  auditStatus?: number | ''
  diseaseIds?: number | ''
}

export interface RareDrugForm {
  genericName: string
  brandName?: string
  indication: string
  dosageForm: string
  spec: string
  refPrice: number | string
  drugType: string
  isInsurance: number
  hasRelief: number
  isLaunched: number
  needPrescription: number
  manualOriginal?: string
  manualPopular?: string
  auditStatus: number
  rejectReason?: string
  diseaseIds: number[]
}

/** @deprecated 使用 RareDrugForm */
export type RareDrugSubmitPayload = RareDrugForm

const normalizeRareDrug = (raw: RawRecord): RareDrugItem => {
  const diseases = normalizeDiseaseList(pickField(raw, 'diseases'))
  const diseaseIds = normalizeIdList(pickField(raw, 'diseaseIds', 'disease_ids'))
  return {
    id: asNumber(raw.id),
    genericName: asString(pickField(raw, 'genericName', 'generic_name')),
    brandName: asString(pickField(raw, 'brandName', 'brand_name')),
    indication: asString(pickField(raw, 'indication')),
    dosageForm: asString(pickField(raw, 'dosageForm', 'dosage_form')),
    spec: asString(pickField(raw, 'spec')),
    refPrice: pickField(raw, 'refPrice', 'ref_price') as number | string,
    drugType: asString(pickField(raw, 'drugType', 'drug_type')) as RareDrugItem['drugType'],
    isInsurance: asFlag(pickField(raw, 'isInsurance', 'is_insurance')),
    hasRelief: asFlag(pickField(raw, 'hasRelief', 'has_relief')),
    isLaunched: asFlag(pickField(raw, 'isLaunched', 'is_launched')),
    needPrescription: asFlag(pickField(raw, 'needPrescription', 'need_prescription')),
    manualOriginal: asString(pickField(raw, 'manualOriginal', 'manual_original')),
    manualPopular: asString(pickField(raw, 'manualPopular', 'manual_popular')),
    auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')) as 0 | 1 | 2,
    rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
    diseaseIds: diseaseIds.length ? diseaseIds : diseases.map((d) => d.id),
    diseases,
    diseaseCount: diseases.length || diseaseIds.length,
    createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
    updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
  }
}

const toSubmitPayload = (data: RareDrugForm) => ({
  genericName: data.genericName,
  brandName: data.brandName || '',
  indication: data.indication,
  dosageForm: data.dosageForm,
  spec: data.spec,
  refPrice: data.refPrice,
  drugType: data.drugType,
  isInsurance: data.isInsurance,
  hasRelief: data.hasRelief,
  isLaunched: data.isLaunched,
  needPrescription: data.needPrescription,
  manualOriginal: data.manualOriginal || '',
  manualPopular: data.manualPopular || '',
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
  diseaseIds: data.diseaseIds || [],
})

export const getRareDrugList = async (
  params: RareDrugListParams
): Promise<ApiResponse<{ list: RareDrugItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/drug/drugs', { params })
  return mapListResponse(res, normalizeRareDrug)
}

export const getRareDrugDetail = async (id: number | string): Promise<ApiResponse<RareDrugItem>> => {
  const res = await request.get<RawRecord>(`/resource/drug/drugs/${id}`)
  return mapDetailResponse(res, normalizeRareDrug)
}

export const addRareDrug = (data: RareDrugForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/drug/drugs', toSubmitPayload(data))
}

export const updateRareDrug = (id: number | string, data: RareDrugForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/drug/drugs/${id}`, toSubmitPayload(data))
}

export const deleteRareDrug = (id: number | string): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/drug/drugs/${id}`)
}
