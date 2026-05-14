<template>
  <div class="psych-org-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回康复支持首页
            </el-button>
            <span class="page-title">心理支持管理</span>
          </div>
        </div>
      </template>

      <!-- 【注释】暂时隐藏 Tabs，如果只保留机构管理，可以直接移除 Tabs 组件 -->
      <!-- 
      <el-tabs v-model="activeTab" class="mb-16px">
        <el-tab-pane label="心理支持机构" name="org" />
        <el-tab-pane label="心理支持资源" name="resource" />
      </el-tabs> 
      -->

      <!-- 机构管理部分 (始终显示或根据 activeTab='org' 显示) -->
      <div v-if="activeTab === 'org'">
        <el-form :inline="true" :model="orgQuery" class="filter-bar">
          <el-form-item label="关键词">
            <el-input 
              v-model="orgQuery.keyword" 
              placeholder="机构名称/简介" 
              clearable 
              style="width: 240px"
              @keyup.enter="getOrgList" 
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item label="咨询方式">
            <el-select v-model="orgQuery.consultWay" clearable placeholder="全部" style="width: 140px">
              <el-option label="线上" value="online" />
              <el-option label="线下" value="offline" />
              <el-option label="线上+线下" value="both" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否免费">
            <el-select v-model="orgQuery.isFree" clearable placeholder="全部" style="width: 120px">
              <el-option label="是" :value="1" />
              <el-option label="否" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="orgQuery.auditStatus" clearable placeholder="全部" style="width: 140px">
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getOrgList">查询</el-button>
            <el-button @click="resetOrgQuery">重置</el-button>
            <el-button type="primary" plain @click="openOrgDialog()">
              <el-icon><Plus /></el-icon>
              新增机构
            </el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="orgLoading" :data="orgList">
          <el-table-column prop="name" label="机构名称" min-width="180" show-overflow-tooltip />
          <el-table-column label="区域" min-width="180">
            <template #default="{ row }">{{ formatRegion(row) }}</template>
          </el-table-column>
          <el-table-column prop="consultWay" label="咨询方式" width="120" />
          <el-table-column label="是否免费" width="100">
            <template #default="{ row }">
              {{ row.isFree === 1 || row.isFree === true ? '是' : (row.isFree === 0 || row.isFree === false ? '否' : '-') }}
            </template>
          </el-table-column>
          <el-table-column prop="contactPhone" label="联系电话" width="140" />
           <el-table-column label="关联疾病数" width="110">
            <template #default="{ row }">
              {{ Array.isArray(row.diseaseIds) ? row.diseaseIds.length : 0 }}
            </template>
          </el-table-column>
          <el-table-column label="审核状态" width="100">
            <template #default="{ row }">
              <el-tag :type="auditTagType(row.auditStatus)">{{ auditText(row.auditStatus) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="170" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewOrg(row.id)">查看</el-button>
              <el-button link type="primary" @click="editOrg(row.id)">编辑</el-button>
              <el-popconfirm title="确认删除该机构？" @confirm="removeOrg(row.id)">
                <template #reference>
                  <el-button link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="orgQuery.page"
            v-model:page-size="orgQuery.pageSize"
            :total="orgTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="getOrgList"
            @current-change="getOrgList"
          />
        </div>
      </div>

      <!-- 【注释】资源管理部分 -->
      <!--
      <div v-else>
        <el-form :inline="true" :model="resourceQuery" class="filter-bar">
          <el-form-item label="关键词">
            <el-input 
              v-model="resourceQuery.keyword" 
              placeholder="资源名称/简介" 
              clearable 
              style="width: 240px"
              @keyup.enter="getResourceList" 
            >
               <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </el-form-item>
          <el-form-item label="资源类型">
            <el-select v-model="resourceQuery.resourceType" clearable placeholder="全部" style="width: 180px">
              <el-option label="心理疏导指南" value="guide" />
              <el-option label="心理手册" value="manual" />
              <el-option label="心理热线" value="hotline" />
              <el-option label="线上资源" value="online_resource" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="resourceQuery.auditStatus" clearable placeholder="全部" style="width: 140px">
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getResourceList">查询</el-button>
            <el-button @click="resetResourceQuery">重置</el-button>
            <el-button type="primary" plain @click="openResourceDialog()">
              <el-icon><Plus /></el-icon>
              新增资源
            </el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="resourceLoading" :data="resourceList">
          <el-table-column prop="name" label="资源名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="diseaseName" label="关联疾病" min-width="160" show-overflow-tooltip />
          <el-table-column prop="resourceType" label="资源类型" width="140" />
          <el-table-column prop="contactPhone" label="联系电话" width="140" />
          <el-table-column label="审核状态" width="100">
            <template #default="{ row }">
              <el-tag :type="auditTagType(row.auditStatus)">{{ auditText(row.auditStatus) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="170" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="viewResource(row.id)">查看</el-button>
              <el-button link type="primary" @click="editResource(row.id)">编辑</el-button>
              <el-popconfirm title="确认删除该资源？" @confirm="removeResource(row.id)">
                <template #reference>
                  <el-button link type="danger">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="resourceQuery.page"
            v-model:page-size="resourceQuery.pageSize"
            :total="resourceTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="getResourceList"
            @current-change="getResourceList"
          />
        </div>
      </div>
      -->
    </el-card>

    <PsychOrgDialog ref="orgDialogRef" @success="getOrgList" />
    <PsychOrgViewDialog ref="orgViewRef" />
    
    <!-- 【注释】资源相关弹窗组件 -->
    <!-- 
    <PsychResourceDialog ref="resourceDialogRef" @success="getResourceList" />
    <PsychResourceViewDialog ref="resourceViewRef" /> 
    -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import {
   getPsychOrgList,
  deletePsychOrg,
  // getPsychResourceList, // 【注释】不再需要
  // deletePsychResource // 【注释】不再需要
} from '@/api/resource/rehab/psychologicalOrg'
import PsychOrgDialog from './components/PsychologicalOrgDialog.vue'
import PsychOrgViewDialog from './components/PsychologicalOrgViewDialog.vue'
// import PsychResourceDialog from './components/PsychResourceDialog.vue' // 【注释】
// import PsychResourceViewDialog from './components/PsychResourceViewDialog.vue' // 【注释】

const router = useRouter()
const activeTab = ref('org')

// 工具函数
const auditText = (v: number) => (v === 1 ? '已通过' : v === 2 ? '已驳回' : '待审核')
const auditTagType = (v: number) => (v === 1 ? 'success' : v === 2 ? 'danger' : 'warning')

// 修改点：使用小驼峰字段
const formatRegion = (row: any) => [row.provinceName, row.cityName, row.districtName].filter(Boolean).join(' / ') || '-'

// 机构相关数据
const orgLoading = ref(false)
const orgList = ref<any[]>([])
const orgTotal = ref(0)

const orgQuery = reactive({ 
  page: 1, 
  pageSize: 10, 
  keyword: '', 
  consultWay: '', 
  isFree: '', 
  auditStatus: '' 
})

// 【注释】资源相关数据
/*
const resourceLoading = ref(false)
const resourceList = ref<any[]>([])
const resourceTotal = ref(0)

const resourceQuery = reactive({ 
  page: 1, 
  pageSize: 10, 
  keyword: '', 
  resourceType: '', 
  auditStatus: '' 
})
*/

// 弹窗引用
const orgDialogRef = ref()
const orgViewRef = ref()
// const resourceDialogRef = ref() // 【注释】
// const resourceViewRef = ref() // 【注释】

// 方法
const handleBack = () => router.push('/resource/rehab')

const getOrgList = async () => {
  orgLoading.value = true
  try {
    const res = await getPsychOrgList(orgQuery)
    orgList.value = res.data?.list || []
    orgTotal.value = res.data?.total || 0
  } finally {
    orgLoading.value = false
  }
}

const resetOrgQuery = () => {
  Object.assign(orgQuery, { page: 1, pageSize: 10, keyword: '', consultWay: '', isFree: '', auditStatus: '' })
  getOrgList()
}

const openOrgDialog = () => orgDialogRef.value?.open('create')
const editOrg = (id: number) => orgDialogRef.value?.open('update', id)
const viewOrg = (id: number) => orgViewRef.value?.open(id)
const removeOrg = async (id: number) => {
  await deletePsychOrg(id)
  ElMessage.success('删除成功')
  getOrgList()
}

// 【注释】资源相关方法
/*
const getResourceList = async () => {
  resourceLoading.value = true
  try {
    const res = await getPsychResourceList(resourceQuery)
    resourceList.value = res.data?.list || []
    resourceTotal.value = res.data?.total || 0
  } finally {
    resourceLoading.value = false
  }
}

const resetResourceQuery = () => {
  Object.assign(resourceQuery, { page: 1, pageSize: 10, keyword: '', resourceType: '', auditStatus: '' })
  getResourceList()
}

const openResourceDialog = () => resourceDialogRef.value?.open('create')
const editResource = (id: number) => resourceDialogRef.value?.open('update', id)
const viewResource = (id: number) => resourceViewRef.value?.open(id)
const removeResource = async (id: number) => {
  await deletePsychResource(id)
  ElMessage.success('删除成功')
  getResourceList()
}
*/

onMounted(() => {
  getOrgList()
  // getResourceList() // 【注释】
})
</script>

<style scoped>
/* 样式保持不变 */
.psych-org-page {
  padding: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
}
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.mb-16px {
  margin-bottom: 16px;
}
</style>