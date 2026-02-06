<template>
  <el-container style="height: 100vh">
    <el-aside width="200px">
      <el-menu router>
        <el-menu-item index="/post">内容审核</el-menu-item>
        <el-menu-item index="/resource">资源审核</el-menu-item>
        <el-menu-item index="/user">用户管理</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>罕见病论坛后台</el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
