<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Nav from './components/Nav.vue';
import Foot from './components/Foot.vue';

</script>

<template>
<div>
  <Nav />
  <router-view />
  <Foot />
</div>
</template>

<style scoped>
</style>
