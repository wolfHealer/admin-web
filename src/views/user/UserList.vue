<template>
  <el-card>
    <h3>用户管理</h3>

    <el-table :data="users" style="width:100%">
      <el-table-column prop="username" label="用户名" />
      <el-table-column label="状态" width="180">
        <template #default="{ row }">
          <span v-if="row.disabledPermanent">已永久禁用</span>
          <span v-else-if="row.disabledUntil">禁用至 {{ formatDate(row.disabledUntil) }}</span>
          <span v-else>正常</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button size="small" @click="openTempDisable(row)">临时禁用</el-button>
          <el-button size="small" type="danger" @click="permanentDisable(row)">永久禁用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="临时禁用（天数）" v-model="tempDialog.show">
      <el-input-number v-model="tempDialog.days" :min="1" :max="365" />
      <template #footer>
        <el-button @click="tempDialog.show = false">取消</el-button>
        <el-button type="primary" @click="confirmTemp">确认</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import adminService from '../../services/adminService'
import { ElMessage } from 'element-plus'

const users = ref<any[]>([])
const tempDialog = ref({ show: false, id: '', days: 7 })

async function load() {
  users.value = await adminService.listUsers()
}

onMounted(() => load())

function formatDate(s: string | undefined) {
  if (!s) return ''
  return new Date(s).toLocaleString()
}

function openTempDisable(row: any) {
  tempDialog.value = { show: true, id: row.id, days: 7 }
}

async function confirmTemp() {
  await adminService.disableUserTemporary(tempDialog.value.id, tempDialog.value.days, localStorage.getItem('adminUser') || 'unknown')
  ElMessage.success('已临时禁用')
  tempDialog.value.show = false
  await load()
}

async function permanentDisable(row: any) {
  await adminService.disableUserPermanent(row.id, localStorage.getItem('adminUser') || 'unknown')
  ElMessage.success('已永久禁用')
  await load()
}
</script>
