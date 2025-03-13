<template>
    <div class="container my-5 mb-5 mt-5">
      <div v-if="isLoading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
      </div>
      <div v-for="blog in paginatedBlogs" :key="blog.id" class="card mb-5">
        <h5 class="card-header">Posted by: {{ blog.authorName }}</h5>
        <div class="card-body">
          <h5 class="card-title">{{ blog.title }}</h5>
          <p class="card-text">{{ blog.content }}</p>
        </div>
      </div>
      <div class="paginated-container text-center mt-4">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
            </li>
          </ul>
        </nav>
        <div class="text-muted">
          Showing {{ paginationInfo.from }} to {{ paginationInfo.to }} of {{ blogs.length }} entries
        </div>
      </div>
      <div v-if="error" class="alert alert-danger mt-3 text-center">{{ error }}</div>
    </div>
  </template>
  
  <script>
  import api from '@/services/api.js';
  
  export default {
    data() {
      return {
        blogs: [],
        error: null,
        currentPage: 1,
        itemsPerPage: 6,
        isLoading: false,
      };
    },
    computed: {
      paginatedBlogs() {
        console.log('Computing paginated blogs...');
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        console.log(`Start: ${start}, End: ${end}`);
        return this.blogs.slice(start, end);
      },
      totalPages() {
        console.log('Computing total pages...');
        return Math.ceil(this.blogs.length / this.itemsPerPage);
      },
      paginationInfo() {
        console.log('Computing pagination info...');
        const from = (this.currentPage - 1) * this.itemsPerPage + 1;
        const to = Math.min(this.currentPage * this.itemsPerPage, this.blogs.length);
        console.log(`From: ${from}, To: ${to}`);
        return { from, to };
      },
    },
    methods: {
      async fetchAllBlogs() {
        this.isLoading = true;
        try {
          console.log('Fetching all blogs...');
          const response = await api.getAllBlogs();
          
          if (response.data && response.data.data) {
            this.blogs = response.data.data;
            
          } else {
            this.error = 'Invalid API response';
          }
        } catch (error) {
        
          this.handleError(error);
        }finally {
        this.isLoading = false;
      }
      },
      handleError(error) {
        this.error = error.message;
      },
      changePage(page) {
  
        this.currentPage = page;
      },
    },
    created() {
      this.fetchAllBlogs();
    },
  };
  </script>
  
  <style scoped>
  /* Add styles here */
  </style>