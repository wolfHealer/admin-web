<template>
  <el-card class="disease-card">
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
        <el-button type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
          新增疾病
        </el-button>
      </div>
    </template>

    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索疾病名称/别名"
        clearable
        style="width: 220px"
        @clear="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>

      <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px" @change="handleSearch">
        <el-option label="启用" :value="1" />
        <el-option label="停用" :value="0" />
      </el-select>

      <el-tree-select
        v-model="filters.categoryId"
        :data="categoryTree"
        node-key="id"
        check-strictly
        :props="{ label: 'name', children: 'children' }"
        placeholder="选择分类"
        clearable
        style="width: 220px"
        @change="handleSearch"
      />

      <el-select v-model="filters.tagId" placeholder="选择标签" clearable style="width: 180px" @change="handleSearch">
        <el-option v-for="item in tagList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>

      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" v-loading="loading" row-key="id">
      <el-table-column prop="name" label="疾病名称" min-width="160" />
      <el-table-column prop="alias" label="别名" min-width="160" show-overflow-tooltip />
      <el-table-column label="主分类" min-width="140">
        <template #default="{ row }">{{ row.primaryCategoryName || getPrimaryCategory(row) || '-' }}</template>
      </el-table-column>
      <el-table-column label="关联分类" min-width="220">
        <template #default="{ row }">
          <el-space wrap>
            <el-tag v-for="item in row.categories || []" :key="item.id" effect="plain">{{ item.name }}</el-tag>
          </el-space>
        </template>
      </el-table-column>
      <el-table-column label="标签" min-width="220">
        <template #default="{ row }">
          <el-space wrap>
            <el-tag v-for="item in row.tags || []" :key="item.id" type="info">{{ item.name }}</el-tag>
          </el-space>
        </template>
      </el-table-column>
      <el-table-column prop="introduction" label="简介" min-width="220" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('view', row)">查看</el-button>
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="danger" @click="$emit('delete', row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import type { CategoryTreeNode, Disease, TagItem } from '@/api/knowledge/knowledge'

interface Props {
  title: string
  categoryTree: CategoryTreeNode[]
  tagList: TagItem[]
  tableData: Disease[]
  loading: boolean
  pagination: {
    currentPage: number
    pageSize: number
    total: number
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: []
  edit: [row: Disease]
  delete: [row: Disease]
  view: [row: Disease]
  search: [params: any]
  reset: []
}>()

const filters = reactive({
  keyword: '',
  status: null as number | null,
  categoryId: null as number | null,
  tagId: null as number | null,
})

const getPrimaryCategory = (row: Disease) => {
  const first = row.categories?.[0]
  return first?.name || ''
}

const handleSearch = () => {
  emit('search', {
    page: props.pagination.currentPage,
    pageSize: props.pagination.pageSize,
    keyword: filters.keyword,
    status: filters.status,
    categoryId: filters.categoryId,
    tagId: filters.tagId,
  })
}

const handleReset = () => {
  filters.keyword = ''
  filters.status = null
  filters.categoryId = null
  filters.tagId = null
  emit('reset')
}
</script>

<style scoped lang="scss">
.disease-card {
  min-height: 640px;
}

.card-header,
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header {
  justify-content: space-between;
}

.filter-bar {
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
