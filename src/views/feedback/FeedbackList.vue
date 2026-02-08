<template>
  <el-card>
    <h3>反馈处理</h3>
    <el-table :data="items" style="width:100%">
      <el-table-column prop="content" label="内容" />
      <el-table-column prop="author" label="用户" width="140" />
      <el-table-column prop="createdAt" label="时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="resolve(row)">已处理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import adminService from '../../services/adminService'
import { ElMessage } from 'element-plus'

const items = ref<any[]>([])

async function load() {
  items.value = await adminService.listFeedback()
}

onMounted(() => load())

async function resolve(row: any) {
  await adminService.resolveFeedback(row.id, localStorage.getItem('adminUser') || 'unknown')
  ElMessage.success('已处理')
  await load()
}
</script>
