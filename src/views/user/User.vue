<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="手机号 / 展示名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="queryParams.role" placeholder="全部" clearable style="width: 140px">
            <el-option label="普通用户" :value="1" />
            <el-option label="专家" :value="2" />
            <el-option label="管理员" :value="9" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>

        <el-form-item style="float: right">
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar || ''" :size="36">
              {{ (row.displayName || row.phone || 'U').slice(0, 1) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="displayName" label="展示名" min-width="140" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)">
              {{ roleText(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(val:boolean) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="loginCount" label="登录次数" width="100" />
        <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
        <el-table-column prop="createdAt" label="注册时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="handleResetPassword(row)">重置密码</el-button>
            <el-dropdown @command="(role:number) => handleRoleChange(row, role)">
              <span class="el-dropdown-link action-link">调整角色</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="1">普通用户</el-dropdown-item>
                  <el-dropdown-item :command="2">专家</el-dropdown-item>
                  <el-dropdown-item :command="9">管理员</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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

    <UserDialog
      v-model="dialogVisible"
      :id="currentId"
      @success="getList"
    />

    <UserViewDialog
      v-model="viewVisible"
      :id="currentId"
    />

    <ResetPasswordDialog
      v-model="resetPwdVisible"
      :id="currentId"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import UserDialog from './components/UserDialog.vue'
import UserViewDialog from './components/UserViewDialog.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'
import {
  getUserList,
  updateUserRole,
  updateUserStatus,
  type UserItem,
  type UserListParams,
} from '@/api/user/user'

const loading = ref(false)
const tableData = ref<UserItem[]>([])
const total = ref(0)

const dialogVisible = ref(false)
const viewVisible = ref(false)
const resetPwdVisible = ref(false)
const currentId = ref<number | null>(null)

const queryParams = reactive<UserListParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
  role: '',
  status: '',
})

const roleText = (role: number) => {
  if (role === 9) return '管理员'
  if (role === 2) return '专家'
  return '普通用户'
}

const roleTagType = (role: number) => {
  if (role === 9) return 'danger'
  if (role === 2) return 'warning'
  return 'info'
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getUserList(queryParams)
    console.log("res",res)
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
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
  queryParams.role = ''
  queryParams.status = ''
  getList()
}

const handleAdd = () => {
  currentId.value = null
  dialogVisible.value = true
}

const handleEdit = (row: UserItem) => {
  currentId.value = row.id
  dialogVisible.value = true
}

const handleView = (row: UserItem) => {
  currentId.value = row.id
  viewVisible.value = true
}

const handleResetPassword = (row: UserItem) => {
  currentId.value = row.id
  resetPwdVisible.value = true
}

const handleStatusChange = async (row: UserItem, value: boolean) => {
  await updateUserStatus(row.id, value ? 1 : 0)
  ElMessage.success('状态更新成功')
  getList()
}

const handleRoleChange = async (row: UserItem, role: number) => {
  await updateUserRole(row.id, role as any)
  ElMessage.success('角色更新成功')
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.page-container {
  padding: 16px;
}
.search-card {
  margin-bottom: 16px;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.action-link {
  cursor: pointer;
  color: var(--el-color-primary);
  margin-left: 8px;
}
</style>