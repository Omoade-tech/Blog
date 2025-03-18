<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light-transparent">
      <div class="container">
        <router-link class="navbar-brand " to="/">Cruiz-Blog</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul class="navbar-nav">
            <template v-if="!isAuthenticated">
            <li class="nav-item me-3">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <li class="nav-item me-3">
              <router-link class="nav-link" to="/about">About</router-link>
            </li>
          </template>
            <li class="nav-item me-3">
              <router-link class="nav-link" to="/blog">Blog</router-link>
            </li>
            <template v-if="isAuthenticated">
            <li class="nav-item me-3">
              <router-link class="nav-link" to="/post">Post</router-link>
            </li>
          </template>
          </ul>
        </div>
        <div class="navbar-nav ms-auto">
          <template v-if="!isAuthenticated">
            <li class="nav-item order-last">
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
            <li class="nav-item order-last">
              <router-link class="nav-link" to="/signup">Register</router-link>
            </li>
          </template>
          <template v-else>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Welcome
                {{ user?.name || 'Account' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li v-if="user?.role === 'blogUser'">
                  <router-link class="dropdown-item" :to="'/dashboard/'">Dashboard</router-link>
                </li>
                <li v-if="user?.role === 'blogUser'">
                  <router-link class="dropdown-item" to="/profile">Profile</router-link>
                </li>
                <li v-if="user?.role === 'admin'">
                  <router-link class="dropdown-item" to="/AdminDashboard">Dashboard</router-link>
                </li>
                <li v-if="user?.role === 'admin'">
                  <router-link class="dropdown-item" to="/profile">Profile</router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="handleLogout">Logout</a>
                </li>
              </ul>
            </li>
          </template>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  import { useAuthStore } from '@/stores/Auth';
  import { useRouter } from 'vue-router';
  import { computed } from 'vue';
  
  export default {
    
    setup() {
      const authStore = useAuthStore();
      const router = useRouter();
  
      const isAuthenticated = computed(() => authStore.isAuthenticated);
      const user = computed(() => authStore.user);
  
      const handleLogout = async () => {
        try {
          await authStore.logout();
          router.push('/login');
        } catch (error) {
          console.error('Logout error:', error);
        }
      };
  
      return {
        isAuthenticated,
        user,
        handleLogout
      };
    }
  };
  </script>
  
  <style scoped>
  .navbar {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .dropdown-menu {
    min-width: 200px;
  }
  
  .dropdown-item:active {
    background-color: #007bff;
  }
  /* .navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: #f8f9fa; 
  z-index: 1000; 
} */

  </style>