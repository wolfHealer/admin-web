<template>
  <div class="region-page">
    <el-row :gutter="16">
      <el-col :span="7">
        <el-card shadow="never" class="tree-card">
          <template #header>
            <div class="card-header">
              <span>区域树</span>
              <el-button type="primary" link @click="handleAddRoot">新增顶级</el-button>
            </div>
          </template>

          <el-tree
            v-loading="treeLoading"
            :data="treeData"
            node-key="code"
            default-expand-all
            :props="{ label: 'fullName', children: 'children' }"
            @node-click="handleTreeClick"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <span>{{ data.fullName }}</span>
                <span class="tree-actions">
                  <el-tag size="small" :type="levelTagType(data.level)">
                    {{ levelText(data.level) }}
                  </el-tag>
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <el-col :span="17">
        <el-card shadow="never" class="table-card">
          <template #header>
            <div class="card-header">
              <span>区域管理</span>
              <div>
                <el-button @click="loadTree">刷新树</el-button>
                <el-button type="primary" @click="handleAdd">新增区域</el-button>
              </div>
            </div>
          </template>

          <el-form :inline="true" :model="queryParams" class="filter-bar">
            <el-form-item label="关键词">
              <el-input
                v-model="queryParams.keyword"
                placeholder="名称 / 编码"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>

            <el-form-item label="层级">
              <el-select v-model="queryParams.level" placeholder="全部" clearable style="width: 140px">
                <el-option label="省/直辖市" :value="1" />
                <el-option label="市" :value="2" />
                <el-option label="区/县" :value="3" />
              </el-select>
            </el-form-item>

            <el-form-item label="状态">
              <el-select v-model="queryParams.isEnabled" placeholder="全部" clearable style="width: 120px">
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>

            <el-form-item label="父级编码">
              <el-input
                v-model="queryParams.parentCode"
                placeholder="可选"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table v-loading="loading" :data="tableData" border>
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="code" label="区域编码" width="130" />
            <el-table-column prop="name" label="简称" width="120" />
            <el-table-column prop="fullName" label="全称" min-width="180" show-overflow-tooltip />
            <el-table-column prop="parentCode" label="父级编码" width="130">
              <template #default="{ row }">
                {{ row.parentCode || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="层级" width="110">
              <template #default="{ row }">
                <el-tag :type="levelTagType(row.level)">
                  {{ levelText(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-switch
                  :model-value="row.isEnabled === 1"
                  @change="(val:boolean) => handleStatusChange(row, val)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="80" />
            <el-table-column prop="updatedAt" label="更新时间" width="180" />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleAddChild(row)">新增下级</el-button>
                <el-button link type="primary" @click="handleView(row)">查看</el-button>
                <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrap">
            <el-pagination
              v-model:current-page="queryParams.page"
              v-model:page-size="queryParams.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="getList"
              @current-change="getList"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <RegionDialog
      v-model="dialogVisible"
      :id="currentId"
      :parent-region="currentParentRegion"
      @success="handleDialogSuccess"
    />

    <RegionViewDialog
      v-model="viewVisible"
      :id="currentId"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RegionDialog from './components/RegionDialog.vue'
import RegionViewDialog from './components/RegionViewDialog.vue'
import {
  deleteRegion,
  getRegionList,
  getRegionTree,
  updateRegionStatus,
  type RegionItem,
  type RegionListParams,
} from '@/api/region/region'

const loading = ref(false)
const treeLoading = ref(false)
const tableData = ref<RegionItem[]>([])
const treeData = ref<RegionItem[]>([])
const total = ref(0)

const dialogVisible = ref(false)
const viewVisible = ref(false)
const currentId = ref<number | null>(null)
const currentParentRegion = ref<RegionItem | null>(null)

const queryParams = reactive<RegionListParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
  level: '',
  isEnabled: '',
  parentCode: '',
})

const levelText = (level: number) => {
  if (level === 1) return '省级'
  if (level === 2) return '市级'
  if (level === 3) return '区县'
  return '-'
}

const levelTagType = (level: number) => {
  if (level === 1) return 'danger'
  if (level === 2) return 'warning'
  if (level === 3) return 'primary'
  return 'info'
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getRegionList(queryParams)
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const loadTree = async () => {
  treeLoading.value = true
  try {
    const res = await getRegionTree()
    treeData.value = res.data || []
  } finally {
    treeLoading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  getList()
}

const handleReset = () => {
  queryParams.page = 1
  queryParams.pageSize = 10
  queryParams.keyword = ''
  queryParams.level = ''
  queryParams.isEnabled = ''
  queryParams.parentCode = ''
  getList()
}

const handleTreeClick = (node: RegionItem) => {
  queryParams.parentCode = node.code
  queryParams.page = 1
  getList()
}

const handleAdd = () => {
  currentId.value = null
  currentParentRegion.value = null
  dialogVisible.value = true
}

const handleAddRoot = () => {
  currentId.value = null
  currentParentRegion.value = {
    code: '',
    name: '',
    fullName: '',
    parentCode: '',
    level: 0 as any,
    sort: 0,
    isEnabled: 1,
  }
  dialogVisible.value = true
}

const handleAddChild = (row: RegionItem) => {
  currentId.value = null
  currentParentRegion.value = row
  dialogVisible.value = true
}

const handleEdit = (row: RegionItem) => {
  currentId.value = row.id || null
  currentParentRegion.value = null
  dialogVisible.value = true
}

const handleView = (row: RegionItem) => {
  currentId.value = row.id || null
  viewVisible.value = true
}

const handleDelete = async (row: RegionItem) => {
  await ElMessageBox.confirm(`确认删除区域“${row.fullName}”吗？`, '提示', {
    type: 'warning',
  })
  await deleteRegion(row.id!)
  ElMessage.success('删除成功')
  getList()
  loadTree()
}

const handleStatusChange = async (row: RegionItem, val: boolean) => {
  await updateRegionStatus(row.id!, val ? 1 : 0)
  ElMessage.success('状态更新成功')
  getList()
  loadTree()
}

const handleDialogSuccess = () => {
  getList()
  loadTree()
}

onMounted(() => {
  getList()
  loadTree()
})
</script>

<style scoped>
.region-page {
  padding: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tree-card,
.table-card {
  min-height: 720px;
}
.filter-bar {
  margin-bottom: 16px;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.tree-actions {
  margin-left: 8px;
}
</style>