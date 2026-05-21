import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题（面包屑、document.title） */
    title?: string
    /** 是否在侧边栏展示 */
    menu?: boolean
    /** 从菜单隐藏（详情页、List 子页等） */
    hidden?: boolean
    /** 菜单图标，对应 @element-plus/icons-vue 组件名 */
    icon?: string
    /** 菜单排序，越小越靠前 */
    order?: number
    /** 菜单跳转路径（默认取 route.path） */
    menuPath?: string
    /** 子路由访问时高亮的菜单项 path */
    activeMenu?: string
  }
}

export {}
