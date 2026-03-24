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
            path: 'medical/guideline',
            name: 'MedicalGuideline',
            component: () => import('@/views/resource/medical/GuidelineList.vue'),
            meta: { title: '诊疗指南' }
          },
          {
            path: 'medical/examination',
            name: 'MedicalExamination',
            component: () => import('@/views/resource/medical/ExaminationList.vue'),
            meta: { title: '检查项目' }
          },
          {
            path: 'medical/case',
            name: 'MedicalCase',
            component: () => import('@/views/resource/medical/CaseTemplate.vue'),
            meta: { title: '病例模版' }
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
            name: 'RareDrugList',
            component: () => import('@/views/resource/drug/RareDrugList.vue'),
            meta: { title: '罕见病药品名录' }
          },
          {
            path: 'drug/purchase-channel',
            name: 'PurchaseChannelList',
            component: () => import('@/views/resource/drug/PurchaseChannelList.vue'),
            meta: { title: '正规购药渠道' }
          },
          {
            path: 'drug/assistance-program',
            name: 'AssistanceProgramList',
            component: () => import('@/views/resource/drug/AssistanceProgramList.vue'),
            meta: { title: '赠药/援助项目' }
          },
          {
            path: 'drug/management-tool',
            name: 'ManagementToolList',
            component: () => import('@/views/resource/drug/ManagementToolList.vue'),
            meta: { title: '用药管理工具' }
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
            name: 'CharityProject',
            component: () => import('@/views/resource/charity/ProjectList.vue'),
            meta: { title: '救助项目库' }
          },
          {
            path: 'charity/policy',
            name: 'CharityPolicy',
            component: () => import('@/views/resource/charity/PolicyList.vue'),
            meta: { title: '医保政策解读' }
          },
          {
            path: 'charity/case',
            name: 'CharityCase',
            component: () => import('@/views/resource/charity/CaseList.vue'),
            meta: { title: '救助案例分享' }
          },
          {
            path: 'charity/channel',
            name: 'CharityChannel',
            component: () => import('@/views/resource/charity/ChannelList.vue'),
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
            name: 'RehabilitationGuideList',
            component: () => import('@/views/resource/rehab/RehabilitationGuideList.vue'),
            meta: { title: '康复训练指南' }
          },
          {
            path: 'rehab/home-care-manual',
            name: 'HomeCareManualList',
            component: () => import('@/views/resource/rehab/HomeCareManualList.vue'),
            meta: { title: '居家护理手册' }
          },
          {
            path: 'rehab/psychological-support',
            name: 'PsychologicalSupportList',
            component: () => import('@/views/resource/rehab/PsychologicalSupportList.vue'),
            meta: { title: '心理支持资源' }
          },
          {
            path: 'rehab/organization',
            name: 'OrganizationList',
            component: () => import('@/views/resource/rehab/OrganizationList.vue'),
            meta: { title: '康复机构' }
          },
           {
            path: 'rehab/equipment',
            name: 'EquipmentList',
            component: () => import('@/views/resource/rehab/EquipmentList.vue'),
            meta: { title: '康复设备' }
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