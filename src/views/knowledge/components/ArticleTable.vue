<template>
  <el-card class="article-card">
    <template #header>
      <div class="card-header">
        <span>疾病科普文章</span>
        <el-button type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
          新增文章
        </el-button>
      </div>
    </template>

    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索标题 / 摘要"
        clearable
        style="width: 220px"
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>

      <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px" @change="handleSearch">
        <el-option
          v-for="item in ARTICLE_STATUS_OPTIONS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-select
        v-model="filters.tagId"
        placeholder="标签"
        clearable
        filterable
        style="width: 160px"
        @change="handleSearch"
      >
        <el-option v-for="item in filterTagList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>

      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="summary" label="摘要" min-width="220" show-overflow-tooltip />
      <el-table-column label="标签" min-width="160">
        <template #default="{ row }">
          <el-space wrap>
            <el-tag v-for="item in row.tags || []" :key="item.id" type="info" size="small">
              {{ item.name }}
            </el-tag>
            <span v-if="!(row.tags || []).length">-</span>
          </el-space>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getArticleStatusMeta(row.status).tag">
            {{ getArticleStatusMeta(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="置顶" width="70">
        <template #default="{ row }">
          <el-tag v-if="row.isTop === 1" type="warning" size="small">置顶</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览" width="80" />
      <el-table-column prop="publishTime" label="发布时间" width="170" />
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
        :page-sizes="[10, 20, 50]"
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
import { getArticleStatusMeta, ARTICLE_STATUS_OPTIONS, type ArticleListItem, type ArticleTag } from '@/api/knowledge/article'

interface Props {
  tableData: ArticleListItem[]
  filterTagList: ArticleTag[]
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
  edit: [row: ArticleListItem]
  delete: [row: ArticleListItem]
  view: [row: ArticleListItem]
  search: [params: Record<string, unknown>]
  reset: []
}>()

const filters = reactive({
  keyword: '',
  status: null as number | null,
  tagId: null as number | null,
})

const handleSearch = () => {
  emit('search', {
    page: props.pagination.currentPage,
    pageSize: props.pagination.pageSize,
    keyword: filters.keyword,
    status: filters.status,
    tagId: filters.tagId,
  })
}

const handleReset = () => {
  filters.keyword = ''
  filters.status = null
  filters.tagId = null
  emit('reset')
}
</script>

<style scoped lang="scss">
.article-card {
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
