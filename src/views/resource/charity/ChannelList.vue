<!-- src/views/resource/charity/ChannelList.vue -->
<template>
  <div class="charity-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>求助通道指引</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增指引
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索指引标题"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filters.available"
          placeholder="状态筛选"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="启用" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="通道名称" min-width="250" />
        <el-table-column prop="type" label="通道类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'urgent' ? 'warning' : 'info'">
              {{ row.type === 'urgent' ? '紧急救助' : '众筹通道' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contactValue" label="联系方式" width="200" show-overflow-tooltip />
        <el-table-column prop="available" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.available ? 'success' : 'danger'">
              {{ row.available ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="serviceTime" label="服务时间" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.serviceTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <ChannelDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <ChannelViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { 
  getChannelList,
  getChannelDetail,
  addChannel,
  updateChannel,
  deleteChannel
} from '@/api/resource/charity/channel'
import type { CharityChannel } from '@/api/resource/charity/channel'
import ChannelDialog from './components/ChannelDialog.vue'
import ChannelViewDialog from './components/ChannelViewDialog.vue'

// 定义通道数据类型
interface ChannelData {
  id: number
  name: string
  desc: string
  type: 'crowdfunding' | 'urgent' | string
  contactValue: string
  serviceTime: string
  available: boolean
}

const loading = ref(false)
const tableData = ref<ChannelData[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  available: null as boolean | null
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  data: null as ChannelData | null
})

const viewDialog = reactive({
  visible: false,
  data: null as ChannelData | null
})

const handleAdd = () => {
  dialog.isEdit = false
  dialog.data = null
  dialog.visible = true
}

const handleEdit = async (row: ChannelData) => {
  try {
    const res = await getChannelDetail(row.id)
    if ((res as any).code === 200 || (res as any).code === 0) {
      dialog.isEdit = true
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: ChannelData) => {
  try {
    const res = await getChannelDetail(row.id)
    if ((res as any).code === 200 || (res as any).code === 0) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (row: ChannelData) => {
  await ElMessageBox.confirm(`确定要删除"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteChannel(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: ChannelData) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updateChannel(formData.id, formData)
    } else {
      await addChannel(formData)
    }
    ElMessage.success(dialog.isEdit ? '编辑成功' : '新增成功')
    loadData()
    dialog.visible = false
    dialog.data = null
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  filters.keyword = ''
  filters.available = null
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getChannelList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      available: filters.available ?? undefined
    })
    // 适配新接口返回结构：data.channels
    if ((res as any).code === 200 && (res as any).data) {
      tableData.value = (res as any).data.channels || []
      pagination.total = (res as any).data.total || (res as any).data.channels?.length || 0
    }
  } catch (error) {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.charity-list-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-bar {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>