<template>
  <el-card>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>资源审核</h3>
      <div>待审核：<strong>{{ items.length }}</strong> 条</div>
    </div>

    <el-table :data="items" style="width:100%">
      <el-table-column prop="content" label="资源描述" />
      <el-table-column prop="author" label="上传者" width="140" />
      <el-table-column prop="createdAt" label="时间" width="180" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="approve(row)">通过</el-button>
          <el-button size="small" type="danger" @click="openReject(row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="驳回理由" v-model="rejectDialog.show">
      <el-input type="textarea" v-model="rejectDialog.reason" rows="4" placeholder="填写驳回理由" />
      <template #footer>
        <el-button @click="rejectDialog.show = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import adminService from '../../services/adminService'
import { ElMessage } from 'element-plus'

const items = ref<any[]>([])
const rejectDialog = ref({ show: false, id: '', reason: '' })

async function load() {
  items.value = await adminService.listResources()
}

onMounted(() => load())

function getAdmin() {
  return localStorage.getItem('adminUser') || 'unknown'
}

async function approve(row: any) {
  await adminService.approveResource(row.id, getAdmin())
  ElMessage.success('已通过')
  await load()
}

function openReject(row: any) {
  rejectDialog.value = { show: true, id: row.id, reason: '' }
}

async function confirmReject() {
  if (!rejectDialog.value.reason) {
    ElMessage.warning('请填写理由')
    return
  }
  await adminService.rejectResource(rejectDialog.value.id, rejectDialog.value.reason, getAdmin())
  ElMessage.success('已驳回')
  rejectDialog.value.show = false
  await load()
}
</script>
