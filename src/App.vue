<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />

  <!-- 隐藏式管理员登录入口：固定在右下角，样式低调 -->
  <a class="admin-login-link" href="/login">管理员登录</a>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.admin-login-link {
  position: fixed;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: rgba(0,0,0,0.18);
  text-decoration: none;
}
.admin-login-link:hover {
  color: rgba(0,0,0,0.45);
}
</style>
