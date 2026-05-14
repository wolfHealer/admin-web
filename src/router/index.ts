// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import AdminLayout from '@/layout/AdminLayout.vue'

const routes = [
  {
    path: '/login',
    component: () => import('@/views/login/Login.vue'),
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
        meta: { title: '首页' }
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: () => import('@/views/knowledge/Knowledge.vue'),
        meta: { title: '知识库' }
      },
      {
        path: 'community',
        name: 'Community',
        component: () => import('@/views/community/Community.vue'),
        meta: { title: '病友交流' }
      },
      {
        path: '/expert',
        name: 'Expert',
        component: () => import('@/views/expert/index.vue'), // 确保该文件存在
        meta: { title: '专家管理' }
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/views/user/User.vue'), // 确保该文件存在
        meta: { title: '用户管理' }
      },
      {
        path: '/region',
        name: 'Region',
        component: () => import('@/views/region/Region.vue'),
        meta: { title: '区域管理' }
      },
      {
        path: 'resource',
        name: 'Resource',
        component: () => import('@/views/resource/Resource.vue'),
        meta: { title: '资源下载' },
        children: [
          // ==================== 医疗资源服务 ====================
          {
            path: 'medical',
            name: 'ResourceMedical',
            component: () => import('@/views/resource/medical/Medical.vue'),
            meta: { title: '医疗资源服务' }
          },
          {
            path: 'medical/hospital',
            name: 'MedicalHospital',
            component: () => import('@/views/resource/medical/HospitalList.vue'),
            meta: { title: '医院名录' }
          },
          {
            path: 'medical/doctor',
            name: 'MedicalDoctor',
            component: () => import('@/views/resource/medical/DoctorList.vue'),
            meta: { title: '医生名录' }
          },
          {
            path: 'medical/examination',
            name: 'MedicalExamination',
            component: () => import('@/views/resource/medical/ExaminationList.vue'),
            meta: { title: '检查项目' }
          },

          // ==================== 用药信息平台 ====================
          {
            path: 'drug',
            name: 'ResourceDrug',
            component: () => import('@/views/resource/drug/Drug.vue'),
            meta: { title: '用药信息平台' }
          },
          {
            path: 'drug/rare-drug',
            name: 'DrugList',
            component: () => import('@/views/resource/drug/DrugList.vue'),
            meta: { title: '罕见病药品名录' }
          },
          {
            path: 'drug/purchase-channel',
            name: 'ChannelList',
            component: () => import('@/views/resource/drug/ChannelList.vue'),
            meta: { title: '正规购药渠道' }
          },
          {
            path: 'drug/assistance-program',
            name: 'DonationProjectList',
            component: () => import('@/views/resource/drug/DonationProjectList.vue'),
            meta: { title: '赠药/援助项目' }
          },
          // ==================== 公益救助中心 ====================
          {
            path: 'charity',
            name: 'ResourceCharity',
            component: () => import('@/views/resource/charity/Charity.vue'),
            meta: { title: '公益救助中心' }
          },
          {
            path: 'charity/project',
            name: 'AidProject',
            component: () => import('@/views/resource/charity/AidProjectList.vue'),
            meta: { title: '救助项目库' }
          },
          {
            path: 'charity/case',
            name: 'CaseShare',
            component: () => import('@/views/resource/charity/CaseShareList.vue'),
            meta: { title: '救助案例分享' }
          },
          {
            path: 'charity/channel',
            name: 'HelpChannel',
            component: () => import('@/views/resource/charity/HelpChannelList.vue'),
            meta: { title: '求助通道指引' }
          },
          // ==================== 康复支持专区 ====================
          {
            path: 'rehab',
            name: 'ResourceRehab',
            component: () => import('@/views/resource/rehab/Rehab.vue'),
            meta: { title: '康复支持专区' }
          },
          {
            path: 'rehab/rehabilitation-guide',
            name: 'RehabGuideList',
            component: () => import('@/views/resource/rehab/RehabGuideList.vue'),
            meta: { title: '康复训练指南' }
          },
          {
            path: 'rehab/psychological-support',
            name: 'PsychologicalOrgList',
            component: () => import('@/views/resource/rehab/PsychologicalOrgList.vue'),
            meta: { title: '心理支持资源' }
          },
          {
            path: 'rehab/organization',
            name: 'RehabInstitutionList',
            component: () => import('@/views/resource/rehab/RehabInstitutionList.vue'),
            meta: { title: '康复机构' }
          },


          // ==================== 医保政策解读 ====================
          {
            path: 'medicare',
            name: 'ResourceMedicare',
            component: () => import('@/views/resource/medicare/Medicare.vue'),
            meta: { title: '医保' }
          },
          {
            path: 'medicare/policy',
            name: 'MedicarePolicy',
            component: () => import('@/views/resource/medicare/PolicyList.vue'),
            meta: { title: '医保政策解读' }
          },
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  if (!userStore.token && to.path !== '/login') {
    return '/login'
  }
  // 已登录用户访问登录页，重定向到首页
  if (userStore.token && to.path === '/login') {
    return '/home'
  }
})

export default router