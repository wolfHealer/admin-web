<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>标签列表</span>
        <el-button type="primary" @click="$emit('add')">新增标签</el-button>
      </div>
    </template>

    <div class="filter-bar">
      <el-input v-model="filters.keyword" placeholder="搜索标签名称/编码" clearable style="width: 220px" @clear="handleSearch" />
      <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px" @change="handleSearch">
        <el-option label="启用" :value="1" />
        <el-option label="停用" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="name" label="标签名称" min-width="160" />
      <el-table-column prop="code" label="标签编码" min-width="180" />
      <el-table-column prop="useCount" label="使用次数" width="120" />
      <el-table-column prop="sortOrder" label="排序" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="danger" @click="$emit('delete', row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { TagItem } from '@/api/knowledge/knowledge'

interface Props {
  tableData: TagItem[]
  loading: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  add: []
  edit: [row: TagItem]
  delete: [row: TagItem]
  search: [params: any]
  reset: []
}>()

const filters = reactive({
  keyword: '',
  status: null as number | null,
})

const handleSearch = () => emit('search', { ...filters })
const handleReset = () => {
  filters.keyword = ''
  filters.status = null
  emit('reset')
}
</script>

<style scoped lang="scss">
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
</style>
