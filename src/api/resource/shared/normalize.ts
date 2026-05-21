import type { ApiResponse } from '@/types/api'

export type RawRecord = Record<string, unknown>

export interface DiseaseOption {
  id: number
  name: string
  alias?: string
}

export function asString(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback
  return String(value)
}

export function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function asFlag(value: unknown): 0 | 1 {
  return value === 1 || value === '1' || value === true ? 1 : 0
}

/** 优先 camelCase，兼容 snake_case */
export function pickField(raw: RawRecord, camel: string, snake?: string): unknown {
  const c = raw[camel]
  if (c !== undefined && c !== null) return c
  if (snake) {
    const s = raw[snake]
    if (s !== undefined && s !== null) return s
  }
  return undefined
}

export function normalizeDisease(raw: RawRecord): DiseaseOption {
  return {
    id: asNumber(raw.id),
    name: asString(raw.name),
    alias: asString(raw.alias),
  }
}

export function fromDisease(item: { id: number; name: string; alias?: string }): DiseaseOption {
  return { id: item.id, name: item.name, alias: item.alias || '' }
}

export function normalizeIdList(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.map((v) => asNumber(v))
}

export function normalizeDiseaseList(value: unknown): DiseaseOption[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => normalizeDisease(item as RawRecord))
}

export function unwrapList<T>(data: { list?: T[] } | T[] | null | undefined): T[] {
  if (Array.isArray(data)) return data
  return data?.list ?? []
}

export function mapListResponse<T>(
  res: ApiResponse<{ list?: RawRecord[]; total?: number }>,
  normalize: (raw: RawRecord) => T
): ApiResponse<{ list: T[]; total: number }> {
  const payload = res.data ?? {}
  return {
    ...res,
    data: {
      list: (payload.list ?? []).map((item) => normalize(item as RawRecord)),
      total: asNumber(payload.total),
    },
  }
}

export function mapDetailResponse<T>(
  res: ApiResponse<RawRecord>,
  normalize: (raw: RawRecord) => T
): ApiResponse<T> {
  return {
    ...res,
    data: normalize((res.data ?? {}) as RawRecord),
  }
}
