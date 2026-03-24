<!-- src/views/knowledge/components/DiseaseTable.vue -->
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

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索疾病名称/别名"
        clearable
        style="width: 200px"
        @clear="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select
        v-model="filters.status"
        placeholder="状态筛选"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="启用" :value="1" />
        <el-option label="停用" :value="0" />
      </el-select>

      <el-select
        v-model="filters.categoryId"
        placeholder="选择分类"
        clearable
        style="width: 150px"
        @change="handleSearch"
      >
        <el-option
          v-for="item in categoryTree"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>

      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 240px"
        @change="handleSearch"
      />

      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      v-loading="loading"
      row-key="id"
    >
      <el-table-column prop="name" label="疾病名称" min-width="150" />
      <el-table-column prop="alias" label="别名" min-width="120" show-overflow-tooltip />
      <el-table-column prop="categoryName" label="所属分类" width="120" />
      <el-table-column prop="introduction" label="简介" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('view', row)">查看</el-button>
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="danger" @click="$emit('delete', row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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
import type { Category, Disease } from '@/api/knowledge/knowledge'

interface Props {
  title: string
  categoryTree: Category[]
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
  dateRange: [] as Date[]
})

const handleSearch = () => {
  const params = {
    page: props.pagination.currentPage,
    pageSize: props.pagination.pageSize,
    keyword: filters.keyword,
    status: filters.status,
    categoryId: filters.categoryId,
    startDate: filters.dateRange[0] ? formatDate(filters.dateRange[0]) : '',
    endDate: filters.dateRange[1] ? formatDate(filters.dateRange[1]) : ''
  }
  emit('search', params)
}

const handleReset = () => {
  filters.keyword = ''
  filters.status = null
  filters.categoryId = null
  filters.dateRange = []
  emit('reset')
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style lang="scss" scoped>
.disease-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .el-button {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>