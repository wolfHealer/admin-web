<template>
  <el-card>
    <h3>帖子审核</h3>
    <el-table :data="[]">
      <el-table-column label="内容" />
      <el-table-column label="作者" />
      <el-table-column label="操作">
        <template #default>
          <el-button size="small" type="success">通过</el-button>
          <el-button size="small" type="danger">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
