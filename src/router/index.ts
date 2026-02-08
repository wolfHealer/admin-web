import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/login/Login.vue'),
  },
  {
    path: '/',
    component: () => import('@/layout/AdminLayout.vue'),
    children: [
      {
        path: 'post',
        component: () => import('@/views/post/PostAudit.vue'),
      },
      {
        path: 'resource',
        component: () => import('@/views/resource/ResourceAudit.vue'),
      },
      {
        path: 'user',
        component: () => import('@/views/user/UserList.vue'),
      },
      {
        path: 'feedback',
        component: () => import('@/views/feedback/FeedbackList.vue'),
      },
      {
        path: 'logs',
        component: () => import('@/views/admin/OperationLogs.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 登录守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
