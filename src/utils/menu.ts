import type { RouteRecordRaw } from 'vue-router'

export interface MenuItem {
  path: string
  title: string
  icon?: string
  order: number
}

/** 将 layout 子路由 path 转为完整路径 */
export function normalizeLayoutPath(path: string): string {
  if (path.startsWith('/')) return path.replace(/\/+/g, '/')
  return `/${path}`.replace(/\/+/g, '/')
}

/** 从 AdminLayout 的 children 中提取侧边栏菜单项 */
export function getSidebarMenus(routes: RouteRecordRaw[] = []): MenuItem[] {
  return routes
    .filter((route) => route.meta?.menu && !route.meta?.hidden)
    .map((route) => ({
      path: normalizeLayoutPath((route.meta?.menuPath as string | undefined) || route.path),
      title: route.meta!.title!,
      icon: route.meta?.icon,
      order: route.meta?.order ?? 0,
    }))
    .sort((a, b) => a.order - b.order)
}

/** 根据当前 matched 记录解析应高亮的菜单 path */
export function resolveActiveMenuPath(
  matched: Array<{ meta: Record<string, unknown>; path: string }>,
  fallback: string
): string {
  for (let i = matched.length - 1; i >= 0; i -= 1) {
    const meta = matched[i].meta
    if (typeof meta.activeMenu === 'string') return meta.activeMenu
  }
  for (let i = matched.length - 1; i >= 0; i -= 1) {
    const route = matched[i]
    if (route.meta.menu) {
      const menuPath = route.meta.menuPath
      if (typeof menuPath === 'string') return menuPath
      return normalizeLayoutPath(route.path)
    }
  }
  return fallback
}
