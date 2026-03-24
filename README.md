# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).


src/
├── layout/
│   └── AdminLayout.vue          # 管理布局组件
├── views/
│   ├── login/
│   │   └── Login.vue
│   ├── home/
│   │   └── Home.vue             # 首页
│   ├── knowledge/
│   │   └── Knowledge.vue        # 知识库
│   ├── expert/
│   │   └── Expert.vue           # 专家答疑
│   ├── community/
│   │   └── Community.vue        # 病友交流
│   └── resource/
│       └── Resource.vue         # 资源下载
├── router/
│   └── index.ts                 # 路由配置
└── ...


src/views/knowledge/
├── Knowledge.vue           # 主页面
├── components/
│   ├── CategoryTree.vue    # 分类树组件
│   ├── DiseaseTable.vue    # 疾病列表组件
│   ├── CategoryDialog.vue  # 分类弹窗
│   ├── DiseaseDialog.vue   # 疾病弹窗
│   └── DiseaseViewDialog.vue # 疾病详情弹窗
└── composables/
    └── useKnowledge.ts     # 组合式函数（可选）



src/views/resource/
├── components/
│   ├── ResourceDialog.vue        # 通用新增/编辑弹窗
│   └── ResourceViewDialog.vue    # 通用查看详情弹窗
├── medical/
│   └── Medical.vue               # 医疗资源服务
├── Medical.vue              # 主页面（改为导航页）
├── DoctorList.vue           # 医生名录
├── TreatmentGuideline.vue   # 诊疗指南
├── ExaminationItem.vue      # 检查项目
└── CaseTemplate.vue         # 病例模版
├── drug/
│   └── Drug.vue                  # 用药信息平台
├── charity/
│   └── Charity.vue               # 公益救助中心
├── rehabilitation/
│   └── Rehabilitation.vue        # 康复支持专区
└── Resource.vue                  # 主入口（可选，用于导航）



src/views/resource/medical/
├── Medical.vue              ✅ 模块首页（更新）
├── HospitalList.vue         ✅ 新建 - 医院名录
├── DoctorList.vue           ✅ 更新 - 医生名录
├── TreatmentGuideline.vue   ✅ 诊疗指南
├── ExaminationItem.vue      ✅ 检查项目
└── CaseTemplate.vue         ✅ 病例模版

src/views/resource/components/
├── HospitalDialog.vue       ✅ 新建 - 医院弹窗
├── DoctorDialog.vue         ✅ 更新 - 医生弹窗（添加医院选择）
├── GuidelineDialog.vue      ✅ 指南弹窗
├── ExaminationDialog.vue    ✅ 检查项目弹窗
└── CaseDialog.vue           ✅ 病例弹窗

src/api/resource/medical/
├── hospital.ts              ✅ 新建 - 医院 API
├── doctor.ts                ✅ 更新 - 医生 API（添加医院选项）
├── guideline.ts             ✅ 指南 API
├── examination.ts           ✅ 检查项目 API
└── case.ts                  ✅ 病例 API



src/
├── api/
│   └── resource/
│       └── drug/
│           ├── rareDrug.ts              # 罕见病药品 API
│           ├── purchaseChannel.ts       # 购药渠道 API
│           ├── assistanceProgram.ts     # 援助项目 API
│           └── managementTool.ts        # 管理工具 API
└── views/
    └── resource/
        ├── drug/
        │   ├── RareDrugList.vue         # 罕见病药品列表页
        │   ├── PurchaseChannelList.vue  # 购药渠道列表页
        │   ├── AssistanceProgramList.vue # 援助项目列表页
        │   └── ManagementToolList.vue   # 管理工具列表页
        └── components/
            ├── RareDrugDialog.vue       # 罕见病药品编辑弹窗
            ├── RareDrugViewDialog.vue   # 罕见病药品详情弹窗
            ├── PurchaseChannelDialog.vue
            ├── PurchaseChannelViewDialog.vue
            ├── AssistanceProgramDialog.vue
            ├── AssistanceProgramViewDialog.vue
            ├── ManagementToolDialog.vue
            └── ManagementToolViewDialog.vue



src/views/community/components/
├── PostDetailDialog.vue    # 帖子详情弹窗
├── PostCreateDialog.vue    # 发布帖子弹窗（新增）
└── CommentList.vue         # 评论列表组件（可选）




src/views/resource/charity/
├── Charity.vue              # 主页面（导航入口）
├── ProjectList.vue          # 救助项目库列表
├── PolicyList.vue           # 医保政策解读列表
├── CaseList.vue             # 救助案例分享列表
├── GuideList.vue            # 求助通道指引列表
└── components/
    ├── ProjectDialog.vue    # 项目编辑对话框
    ├── ProjectViewDialog.vue # 项目查看对话框
    ├── PolicyDialog.vue
    ├── PolicyViewDialog.vue
    ├── CaseDialog.vue
    ├── CaseViewDialog.vue
    ├── GuideDialog.vue
    └── GuideViewDialog.vue



src/api/resource/charity/
├── charity.ts                    # 原有文件
├── rehabilitationGuide.ts        # 新增：康复训练指南 API
├── homeCareManual.ts             # 新增：居家护理手册 API
├── psychologicalSupport.ts       # 新增：心理支持资源 API
└── resourceDocking.ts            # 新增：康复资源对接 API

src/views/resource/rehab/
├── Charity.vue                   # 更新：主页（8 个模块入口）
├── RehabilitationGuideList.vue   # 新增：康复训练指南列表
├── HomeCareManualList.vue        # 新增：居家护理手册列表
├── PsychologicalSupportList.vue  # 新增：心理支持资源列表
├── ResourceDockingList.vue       # 新增：康复资源对接列表
└── components/
    ├── RehabilitationGuideDialog.vue
    ├── RehabilitationGuideViewDialog.vue
    ├── HomeCareManualDialog.vue
    ├── HomeCareManualViewDialog.vue
    ├── PsychologicalSupportDialog.vue
    ├── PsychologicalSupportViewDialog.vue
    ├── ResourceDockingDialog.vue
    └── ResourceDockingViewDialog.vue