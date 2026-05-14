<template>
  <el-card class="category-card" v-loading="false">
    <template #header>
      <div class="card-header">
        <span>分类树</span>
        <el-button type="primary" size="small" @click="$emit('add-root')">
          <el-icon><Plus /></el-icon>
          新增一级分类
        </el-button>
      </div>
    </template>

    <el-input v-model="searchText" placeholder="搜索分类" size="small" clearable class="search-input">
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <el-tree
      ref="treeRef"
      :data="categoryTree"
      :props="treeProps"
      node-key="id"
      default-expand-all
      :filter-node-method="filterNode"
      :highlight-current="true"
      class="category-tree"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <div class="node-main" @click="handleSelect(data)">
            <span class="node-name">{{ node.label }}</span>
            <el-tag size="small" effect="plain">L{{ data.level }}</el-tag>
          </div>
          <div class="node-actions">
            <el-tooltip content="新增子分类">
              <el-icon @click.stop="$emit('add-child', data)"><CirclePlus /></el-icon>
            </el-tooltip>
            <el-tooltip content="编辑分类">
              <el-icon @click.stop="$emit('edit', data)"><Edit /></el-icon>
            </el-tooltip>
            <el-tooltip content="删除分类">
              <el-icon @click.stop="$emit('delete', data)"><Delete /></el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>
    </el-tree>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Search, Edit, Delete, CirclePlus } from '@element-plus/icons-vue'
import type { ElTree } from 'element-plus'
import type { CategoryTreeNode } from '@/api/knowledge/knowledge'

interface Props {
  categoryTree: CategoryTreeNode[]
}

defineProps<Props>()

const emit = defineEmits<{
  'add-root': []
  'add-child': [data: CategoryTreeNode]
  edit: [data: CategoryTreeNode]
  delete: [data: CategoryTreeNode]
  select: [data: CategoryTreeNode]
}>()

const searchText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()

const treeProps = {
  children: 'children',
  label: 'name',
}

const filterNode = (value: string, data: CategoryTreeNode) => {
  if (!value) return true
  return data.name.includes(value) || data.code.includes(value)
}

watch(searchText, (val) => {
  treeRef.value?.filter(val)
})

const handleSelect = (data: CategoryTreeNode) => emit('select', data)
</script>

<style scoped lang="scss">
.category-card {
  min-height: 620px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-input {
  margin-bottom: 12px;
}

.category-tree {
  max-height: 540px;
  overflow-y: auto;
}

.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.node-main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
}

.node-name:hover {
  color: var(--el-color-primary);
}

.node-actions {
  display: none;
  gap: 8px;
}

.node-actions .el-icon {
  cursor: pointer;
}

.tree-node:hover .node-actions {
  display: inline-flex;
}
</style>
