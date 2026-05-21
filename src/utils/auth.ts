/** 旧版 token 存储 key，仅用于迁移清理 */
const LEGACY_TOKEN_KEY = 'token'
const PERSIST_KEY = 'big-user'

interface UserStoreAccessor {
  token: string
  setToken: (token: string) => void
  resetUser: () => void
}

let getUserStore: (() => UserStoreAccessor) | null = null

/**
 * 在 main.ts 中 Pinia 挂载后注册，避免 auth ↔ store ↔ request 循环依赖
 */
export function registerAuth(getStore: () => UserStoreAccessor): void {
  getUserStore = getStore
  migrateLegacyToken()
}

/** 同步读取 token（供 axios 拦截器使用） */
export function getAccessTokenSync(): string {
  if (getUserStore) {
    return getUserStore().token
  }
  return readTokenFromPersist()
}

/** 兼容旧调用方 */
export function getAccessToken(): Promise<string> {
  return Promise.resolve(getAccessTokenSync())
}

function readTokenFromPersist(): string {
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (!raw) return localStorage.getItem(LEGACY_TOKEN_KEY) || ''
    const parsed = JSON.parse(raw) as { token?: string }
    return parsed.token || ''
  } catch {
    return localStorage.getItem(LEGACY_TOKEN_KEY) || ''
  }
}

function migrateLegacyToken(): void {
  if (!getUserStore) return
  const store = getUserStore()
  if (store.token) return

  const legacy = localStorage.getItem(LEGACY_TOKEN_KEY)
  if (!legacy) return

  store.setToken(legacy)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

/** 清除登录态：内存 store + 持久化 + 旧 key */
export async function clearSession(): Promise<void> {
  if (getUserStore) {
    getUserStore().resetUser()
  } else {
    const { useUserStore } = await import('@/store/user')
    useUserStore().resetUser()
  }
  localStorage.removeItem(PERSIST_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

let redirecting = false

/** 401 统一处理：清 session、提示、跳转登录页 */
export async function handleUnauthorized(): Promise<void> {
  if (redirecting) return
  redirecting = true

  try {
    await clearSession()
    const { ElMessage } = await import('element-plus')
    ElMessage.error('登录失效，请重新登录')
    const router = (await import('@/router')).default
    await router.replace('/login')
  } finally {
    redirecting = false
  }
}
