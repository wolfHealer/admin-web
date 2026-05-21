import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/store/user'
import { clearSession } from '@/utils/auth'
import AdminLayout from '@/layout/AdminLayout.vue'

/** resource 子模块 List/详情页：不出现在侧边栏，高亮「资源下载」入口 */
const resourceChildMeta = {
  hidden: true,
  activeMenu: '/resource/medical',
} as const

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/login/Login.vue'),
    meta: { hidden: true, title: '登录' },
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/Home.vue'),
        meta: { title: '首页', menu: true, icon: 'HomeFilled', order: 1 },
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: () => import('@/views/knowledge/Knowledge.vue'),
        meta: { title: '知识库', menu: true, icon: 'Document', order: 2 },
      },
      // 专家答疑模块暂未开放，保留 redirect 避免旧链接 404
      {
        path: 'expert',
        redirect: '/home',
        meta: { hidden: true, title: '专家答疑' },
      },
      {
        path: 'community',
        name: 'Community',
        component: () => import('@/views/community/Community.vue'),
        meta: { title: '病友交流', menu: true, icon: 'ChatDotRound', order: 4 },
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/User.vue'),
        meta: { title: '用户管理', menu: true, icon: 'UserFilled', order: 6 },
      },
      {
        path: 'region',
        name: 'Region',
        component: () => import('@/views/region/Region.vue'),
        meta: { title: '区域管理', menu: true, icon: 'Location', order: 7 },
      },
      {
        path: 'resource',
        name: 'Resource',
        component: () => import('@/views/resource/Resource.vue'),
        redirect: '/resource/medical',
        meta: {
          title: '资源下载',
          menu: true,
          icon: 'Download',
          order: 5,
          menuPath: '/resource/medical',
        },
        children: [
          {
            path: 'medical',
            name: 'ResourceMedical',
            component: () => import('@/views/resource/medical/Medical.vue'),
            meta: { title: '医疗资源服务', ...resourceChildMeta },
          },
          {
            path: 'medical/hospital',
            name: 'MedicalHospital',
            component: () => import('@/views/resource/medical/HospitalList.vue'),
            meta: { title: '医院名录', ...resourceChildMeta },
          },
          {
            path: 'medical/doctor',
            name: 'MedicalDoctor',
            component: () => import('@/views/resource/medical/DoctorList.vue'),
            meta: { title: '医生名录', ...resourceChildMeta },
          },
          {
            path: 'medical/examination',
            name: 'MedicalExamination',
            component: () => import('@/views/resource/medical/ExaminationList.vue'),
            meta: { title: '检查项目', ...resourceChildMeta },
          },
          {
            path: 'drug',
            name: 'ResourceDrug',
            component: () => import('@/views/resource/drug/Drug.vue'),
            meta: { title: '用药信息平台', ...resourceChildMeta },
          },
          {
            path: 'drug/rare-drug',
            name: 'DrugList',
            component: () => import('@/views/resource/drug/DrugList.vue'),
            meta: { title: '罕见病药品名录', ...resourceChildMeta },
          },
          {
            path: 'drug/purchase-channel',
            name: 'ChannelList',
            component: () => import('@/views/resource/drug/ChannelList.vue'),
            meta: { title: '正规购药渠道', ...resourceChildMeta },
          },
          {
            path: 'drug/assistance-program',
            name: 'DonationProjectList',
            component: () => import('@/views/resource/drug/DonationProjectList.vue'),
            meta: { title: '赠药/援助项目', ...resourceChildMeta },
          },
          {
            path: 'charity',
            name: 'ResourceCharity',
            component: () => import('@/views/resource/charity/Charity.vue'),
            meta: { title: '公益救助中心', ...resourceChildMeta },
          },
          {
            path: 'charity/project',
            name: 'AidProject',
            component: () => import('@/views/resource/charity/AidProjectList.vue'),
            meta: { title: '救助项目库', ...resourceChildMeta },
          },
          {
            path: 'charity/case',
            name: 'CaseShare',
            component: () => import('@/views/resource/charity/CaseShareList.vue'),
            meta: { title: '救助案例分享', ...resourceChildMeta },
          },
          {
            path: 'charity/channel',
            name: 'HelpChannel',
            component: () => import('@/views/resource/charity/HelpChannelList.vue'),
            meta: { title: '求助通道指引', ...resourceChildMeta },
          },
          {
            path: 'rehab',
            name: 'ResourceRehab',
            component: () => import('@/views/resource/rehab/Rehab.vue'),
            meta: { title: '康复支持专区', ...resourceChildMeta },
          },
          {
            path: 'rehab/rehabilitation-guide',
            name: 'RehabGuideList',
            component: () => import('@/views/resource/rehab/RehabGuideList.vue'),
            meta: { title: '康复训练指南', ...resourceChildMeta },
          },
          {
            path: 'rehab/psychological-support',
            name: 'PsychologicalOrgList',
            component: () => import('@/views/resource/rehab/PsychologicalOrgList.vue'),
            meta: { title: '心理支持资源', ...resourceChildMeta },
          },
          {
            path: 'rehab/organization',
            name: 'RehabInstitutionList',
            component: () => import('@/views/resource/rehab/RehabInstitutionList.vue'),
            meta: { title: '康复机构', ...resourceChildMeta },
          },
          {
            path: 'medicare',
            name: 'ResourceMedicare',
            component: () => import('@/views/resource/medicare/Medicare.vue'),
            meta: { title: '医保', ...resourceChildMeta },
          },
          {
            path: 'medicare/policy',
            name: 'MedicarePolicy',
            component: () => import('@/views/resource/medicare/PolicyList.vue'),
            meta: { title: '医保政策解读', ...resourceChildMeta },
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()

  if (to.path === '/login') {
    if (userStore.token && userStore.isProfileLoaded) {
      return '/home'
    }
    return true
  }

  if (!userStore.token) {
    return '/login'
  }

  if (!userStore.isProfileLoaded) {
    try {
      await userStore.getUser()
    } catch {
      await clearSession()
      return '/login'
    }
  }

  return true
})

export default router
