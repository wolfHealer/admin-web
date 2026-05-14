<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑分类' : '新增分类'" width="560px" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="父级分类" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="parentOptions"
          check-strictly
          node-key="id"
          :props="{ label: 'name', children: 'children' }"
          placeholder="一级分类请选择“无父级”"
          style="width: 100%"
          @change="handleParentChange" 
        />
      </el-form-item>
      <!-- 可选：显示当前计算的层级，方便用户确认 -->
      <el-form-item label="当前层级">
        <el-tag>{{ formData.level === 1 ? '一级' : formData.level === 2 ? '二级' : formData.level === 3 ? '三级' : '-' }}</el-tag>
      </el-form-item>
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="分类编码" prop="code">
        <el-input v-model="formData.code" placeholder="如 genetic_metabolic" />
      </el-form-item>
      <el-form-item label="图标地址" prop="iconUrl">
        <el-input v-model="formData.iconUrl" placeholder="请输入图标 URL" />
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="formData.sortOrder" :min="0" :max="999" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分类描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入分类描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CategoryTreeNode } from '@/api/knowledge/knowledge'

interface Props {
  modelValue: boolean
  isEdit: boolean
  data?: CategoryTreeNode | null
  categoryTree: CategoryTreeNode[]
  defaultParentId?: number
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
  defaultParentId: 0,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const parentOptions = computed(() => [
  { id: 0, name: '无父级（一级分类）', children: [], level: 0 }, // 标记虚拟根节点层级为0
  ...props.categoryTree,
])

const formData = reactive({
  id: null as number | null,
  parentId: 0,
  name: '',
  code: '',
  iconUrl: '',
  sortOrder: 0,
  status: 1 as 0 | 1,
  description: '',
  level: 1, // 新增 level 字段，默认一级
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
}

// 辅助函数：根据 parentId 查找父节点并计算层级
const calculateLevel = (parentId: number): number => {
  if (parentId === 0) return 1
  
  // 在树中递归查找节点
  const findNode = (nodes: CategoryTreeNode[], id: number): CategoryTreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const parentNode = findNode(props.categoryTree, parentId)
  if (parentNode) {
    // 父节点层级 + 1，限制最大层级为 3（可根据业务需求调整）
    return Math.min(parentNode.level + 1, 3)
  }
  
  return 1 // 找不到父节点默认返回 1
}

// 监听父级变化，自动更新层级
const handleParentChange = (val: number) => {
  formData.level = calculateLevel(val)
}

const resetForm = () => {
  formData.id = null
  formData.parentId = props.defaultParentId || 0
  formData.name = ''
  formData.code = ''
  formData.iconUrl = ''
  formData.sortOrder = 0
  formData.status = 1
  formData.description = ''
  formData.level = calculateLevel(formData.parentId) // 重置时也计算层级
}

watch(
  () => [props.data, props.isEdit, props.defaultParentId],
  ([newData, isEdit, defaultPid]) => {
    if (newData && isEdit) {
      formData.id = newData.id
      formData.parentId = newData.parentId || 0
      formData.name = newData.name
      formData.code = newData.code
      formData.iconUrl = newData.iconUrl || ''
      formData.sortOrder = newData.sortOrder || 0
      formData.status = newData.status ?? 1
      formData.description = newData.description || ''
      formData.level = newData.level // 编辑时直接使用后端返回的层级
    } else {
      // 新增模式
      formData.parentId = defaultPid || 0
      formData.level = calculateLevel(formData.parentId) // 根据默认父ID计算层级
      // 其他字段保持 resetForm 中的默认值，或者在这里显式重置
      formData.id = null
      formData.name = ''
      formData.code = ''
      formData.iconUrl = ''
      formData.sortOrder = 0
      formData.status = 1
      formData.description = ''
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    // 提交的数据中已经包含了 formData.level
    emit('submit', { ...formData })
    visible.value = false
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
}
</script>