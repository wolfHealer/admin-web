<template>
  <el-dialog
    :model-value="modelValue"
    title="用户详情"
    width="560px"
    @close="handleClose"
  >
    <el-descriptions v-loading="loading" :column="1" border>
      <el-descriptions-item label="用户ID">{{ detail.id || '-' }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ detail.phone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="展示名">{{ detail.displayName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="头像">
        <el-avatar v-if="detail.avatar" :src="detail.avatar" :size="48" />
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="角色">{{ roleText(detail.role) }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="detail.status === 1 ? 'success' : 'danger'">
          {{ detail.status === 1 ? '正常' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="最后登录">{{ detail.lastLoginAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="登录次数">{{ detail.loginCount ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail.createdAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ detail.updatedAt || '-' }}</el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { getUserDetail, type UserItem } from '@/api/user/user'

const props = defineProps<{
  modelValue: boolean
  id: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const loading = ref(false)
const detail = reactive<Partial<UserItem>>({})

const roleText = (role?: number) => {
  if (role === 9) return '管理员'
  if (role === 2) return '专家'
  return '普通用户'
}

const loadDetail = async () => {
  if (!props.id) return
  loading.value = true
  try {
    const res = await getUserDetail(props.id)
    Object.assign(detail, res.data || {})
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) loadDetail()
  }
)

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>