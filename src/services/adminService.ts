type PostItem = {
  id: string
  content: string
  author: string
  createdAt: string
}

type ResourceItem = PostItem & { url?: string }

type UserItem = {
  id: string
  username: string
  disabledUntil?: string | null
  disabledPermanent?: boolean
}

const KEY = {
  POSTS: 'admin_posts',
  RESOURCES: 'admin_resources',
  USERS: 'admin_users',
  FEEDBACK: 'admin_feedbacks',
  LOGS: 'admin_logs',
  ACCOUNTS: 'admin_accounts',
}

function makeId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function read<T>(k: string, fallback: T): T {
  const raw = localStorage.getItem(k)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write(k: string, v: any) {
  localStorage.setItem(k, JSON.stringify(v))
}

function ensureInit() {
  if (!localStorage.getItem(KEY.ACCOUNTS)) {
    write(KEY.ACCOUNTS, [
      { username: 'admin', password: 'password123' },
      { username: 'super', password: 'superpass' },
    ])
  }
  if (!localStorage.getItem(KEY.POSTS)) {
    write(KEY.POSTS, [
      { id: makeId('p_'), content: '待审核：一条知识补充示例', author: '用户A', createdAt: new Date().toISOString() },
      { id: makeId('p_'), content: '待审核：病友动态示例', author: '用户B', createdAt: new Date().toISOString() },
    ])
  }
  if (!localStorage.getItem(KEY.RESOURCES)) {
    write(KEY.RESOURCES, [
      { id: makeId('r_'), content: '资源：示例 PDF', author: '用户C', createdAt: new Date().toISOString(), url: '' },
    ])
  }
  if (!localStorage.getItem(KEY.USERS)) {
    write(KEY.USERS, [
      { id: makeId('u_'), username: 'user1' },
      { id: makeId('u_'), username: 'user2' },
    ])
  }
  if (!localStorage.getItem(KEY.FEEDBACK)) {
    write(KEY.FEEDBACK, [
      { id: makeId('f_'), content: '资源失效，请检查', author: '用户D', createdAt: new Date().toISOString() },
    ])
  }
  if (!localStorage.getItem(KEY.LOGS)) {
    write(KEY.LOGS, [])
  }
}

ensureInit()

function delay<T>(v: T, ms = 200): Promise<T> {
  return new Promise((res) => setTimeout(() => res(v), ms))
}

export default {
  authenticate(username: string, password: string) {
    const accounts = read(KEY.ACCOUNTS, [] as any[])
    const ok = accounts.find((a) => a.username === username && a.password === password)
    if (ok) {
      const token = 'admintoken-' + makeId('t_')
      return delay({ token })
    }
    return Promise.reject(new Error('账号或密码错误'))
  },

  // posts
  listPosts() {
    const items = read<PostItem[]>(KEY.POSTS, [])
    return delay(items)
  },
  approvePost(id: string, admin: string) {
    const items = read<PostItem[]>(KEY.POSTS, [])
    const rest = items.filter((i) => i.id !== id)
    write(KEY.POSTS, rest)
    this.log(admin, `通过帖子 ${id}`)
    return delay(true)
  },
  rejectPost(id: string, reason: string, admin: string) {
    const items = read<PostItem[]>(KEY.POSTS, [])
    const rest = items.filter((i) => i.id !== id)
    write(KEY.POSTS, rest)
    this.log(admin, `驳回帖子 ${id}，理由：${reason}`)
    return delay(true)
  },

  // resources
  listResources() {
    const items = read<ResourceItem[]>(KEY.RESOURCES, [])
    return delay(items)
  },
  approveResource(id: string, admin: string) {
    const items = read<ResourceItem[]>(KEY.RESOURCES, [])
    const rest = items.filter((i) => i.id !== id)
    write(KEY.RESOURCES, rest)
    this.log(admin, `通过资源 ${id}`)
    return delay(true)
  },
  rejectResource(id: string, reason: string, admin: string) {
    const items = read<ResourceItem[]>(KEY.RESOURCES, [])
    const rest = items.filter((i) => i.id !== id)
    write(KEY.RESOURCES, rest)
    this.log(admin, `驳回资源 ${id}，理由：${reason}`)
    return delay(true)
  },

  // users
  listUsers() {
    const items = read<UserItem[]>(KEY.USERS, [])
    return delay(items)
  },
  disableUserTemporary(id: string, days: number, admin: string) {
    const items = read<UserItem[]>(KEY.USERS, [])
    const idx = items.findIndex((u) => u.id === id)
    if (idx >= 0) {
      const until = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString()
      items[idx].disabledUntil = until
      write(KEY.USERS, items)
      this.log(admin, `临时禁用用户 ${id} 至 ${until}`)
    }
    return delay(true)
  },
  disableUserPermanent(id: string, admin: string) {
    const items = read<UserItem[]>(KEY.USERS, [])
    const idx = items.findIndex((u) => u.id === id)
    if (idx >= 0) {
      items[idx].disabledPermanent = true
      write(KEY.USERS, items)
      this.log(admin, `永久禁用用户 ${id}`)
    }
    return delay(true)
  },

  // feedback
  listFeedback() {
    const items = read<any[]>(KEY.FEEDBACK, [])
    return delay(items)
  },
  resolveFeedback(id: string, admin: string, note?: string) {
    const items = read<any[]>(KEY.FEEDBACK, [])
    const rest = items.filter((f) => f.id !== id)
    write(KEY.FEEDBACK, rest)
    this.log(admin, `处理反馈 ${id}，说明：${note || ''}`)
    return delay(true)
  },

  // logs
  log(admin: string, action: string) {
    const logs = read<any[]>(KEY.LOGS, [])
    logs.unshift({ id: makeId('l_'), admin, action, time: new Date().toISOString() })
    write(KEY.LOGS, logs.slice(0, 200))
  },
  listLogs() {
    const logs = read<any[]>(KEY.LOGS, [])
    return delay(logs)
  },
}
