<script setup>
import { RouterLink, RouterView } from 'vue-router'
import NavBar from './components/navBar.vue'
import Footer from './components/footer.vue'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
<div>
  <NavBar />
  <router-view />
  <Footer />
</div>
</template>

<style scoped>
</style>
