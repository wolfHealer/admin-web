<template>
  <div class="post-report-page">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="query">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="帖子内容 / 举报人"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="举报类型">
          <el-select v-model="query.reasonType" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="item in REPORT_REASON_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="item in REPORT_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="postId" label="帖子 ID" width="90" />
        <el-table-column label="帖子预览" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="post-preview">
              <div v-if="row.postTitle" class="post-title">{{ row.postTitle }}</div>
              <div>{{ truncateContent(row.postContent) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="postAuthorName" label="帖子作者" width="120" />
        <el-table-column label="举报人" width="120">
          <template #default="{ row }">
            {{ row.reporterName || `#${row.reporterId}` }}
          </template>
        </el-table-column>
        <el-table-column label="举报类型" width="110">
          <template #default="{ row }">
            <el-tag type="danger" effect="plain">
              {{ getReportReasonLabel(row.reasonType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getReportStatusMeta(row.status).tag">
              {{ getReportStatusMeta(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="举报时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openHandle(row)">
              {{ row.status === 0 ? '审核' : '查看' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="refresh"
          @current-change="refresh"
        />
      </div>
    </el-card>

    <PostReportHandleDialog
      v-model="handleDialog.visible"
      :report-id="handleDialog.reportId"
      @success="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useTable } from '@/composables/useTable'
import {
  getPostReportList,
  getReportReasonLabel,
  getReportStatusMeta,
  REPORT_REASON_OPTIONS,
  REPORT_STATUS_OPTIONS,
  type PostReportItem,
  type ReportReasonType,
  type ReportStatus,
} from '@/api/community/postReport'
import PostReportHandleDialog from './components/PostReportHandleDialog.vue'

const handleDialog = reactive({
  visible: false,
  reportId: null as number | null,
})

const { loading, tableData, total, query, handleSearch, handleReset, refresh } = useTable<
  PostReportItem,
  {
    page: number
    pageSize: number
    keyword: string
    status: ReportStatus | ''
    reasonType: ReportReasonType | ''
  }
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    status: '',
    reasonType: '',
  }),
  fetchApi: async (params) => {
    const res = await getPostReportList({
      ...params,
      keyword: params.keyword || undefined,
      status: params.status,
      reasonType: params.reasonType,
    })
    return res.data
  },
  errorMessage: '加载举报列表失败',
})

const truncateContent = (content: string, length = 80) => {
  if (!content) return '-'
  return content.length > length ? `${content.substring(0, length)}...` : content
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const openHandle = (row: PostReportItem) => {
  handleDialog.reportId = row.id
  handleDialog.visible = true
}
</script>

<style lang="scss" scoped>
.post-report-page {
  padding: 20px;

  .search-card {
    margin-bottom: 16px;
  }

  .post-preview {
    line-height: 1.5;

    .post-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
