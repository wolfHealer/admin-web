<!-- src/views/knowledge/components/CategoryTree.vue -->
<template>
  <el-card class="category-card">
    <template #header>
      <div class="card-header">
        <span>疾病分类</span>
        <el-button type="primary" size="small" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </template>
    
    <el-input
      v-model="searchText"
      placeholder="搜索分类"
      size="small"
      clearable
      class="search-input"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    
    <el-tree
      :data="categoryTree"
      :props="treeProps"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :highlight-current="true"
      ref="treeRef"
      class="category-tree"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <span @click="handleSelect(data)">
            {{ node.label }}
          </span>
          <div class="node-actions">
            <el-icon @click.stop="$emit('edit', data)"><Edit /></el-icon>
            <el-icon @click.stop="$emit('delete', data)"><Delete /></el-icon>
          </div>
        </div>
      </template>
    </el-tree>
  </el-card>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import type { Category } from '@/api/knowledge/knowledge'
import type { ElTree } from 'element-plus'

interface Props {
  categoryTree: Category[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: []
  edit: [data: Category]
  delete: [data: Category]
  select: [data: Category]
}>()

const searchText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()

const treeProps = {
  children: 'children',
  label: 'name'
}


const filterNode = (value: string, data: Category) => {
  if (!value) return true
  return data.name.includes(value)
}

watch(searchText, (val) => {
  treeRef.value?.filter(val)
})

const handleSelect = (data: Category) => {
  emit('select', data)
}
</script>

<style lang="scss" scoped>
.category-tree {
  max-height: 500px;
  overflow-y: auto;

  .tree-node {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding-right: 8px;

    span {
      cursor: pointer;
      flex: 1;

      &:hover {
        color: #409eff;
      }
    }

    .node-actions {
      display: none;
      gap: 8px;

      .el-icon {
        cursor: pointer;
        font-size: 14px;

        &:hover {
          color: #409eff;
        }
      }
    }

    &:hover .node-actions {
      display: flex;
    }
  }
  
  // 选中状态样式
  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: #ecf5ff;
    color: #409eff;
  }
}
</style>