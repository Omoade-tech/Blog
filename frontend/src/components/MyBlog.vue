<template>
  <div class="container my-5">
    <h2 class="text-center mb-4">My Blogs</h2>

    <div v-if="isLoading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>
    
    <div v-if="!authStore?.isAuthenticated" class="alert alert-warning text-center">
      Please log in to view your blogs
    </div>

    <div v-for="blog in blogs" :key="blog.id" class="card mb-5">
      <h5 class="card-header">Posted by: {{ blog.authorName }}</h5>
      <div class="card-body">
        <h5 class="card-title">{{ blog.title }}</h5>
        <p class="card-text">{{ blog.content }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/Auth.js';

export default {
  data() {
    return {
      isLoading: false,
      error: null,
      blogs: [],
      authStore: null
    };
  },
  methods: {
    async loadMyBlogs() {
      this.isLoading = true;
      try {
        // Check if user is authenticated first
        if (!this.authStore.isAuthenticated) {
          this.error = 'Please log in to view your blogs';
          console.log('User not authenticated, cannot load blogs');
          return;
        }
        
        await this.authStore.fetchMyBlogs();
        this.blogs = this.authStore.userBlogs;
      } catch (error) {
        this.error = error.message || 'Failed to fetch blogs';
        console.error('Error loading blogs:', error);
      } finally {
        this.isLoading = false;
      }
    }
  },
  created() {
    this.authStore = useAuthStore();
    this.loadMyBlogs();
  }
};
</script>

<style scoped>
/* Add styles here */
</style>