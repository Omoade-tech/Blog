<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">User Details</div>
          
          <!-- Loading state -->
          <div class="card-body" v-if="loading">
            <div class="text-center">
              <p>Loading profile...</p>
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
          
          <!-- Error state -->
          <div class="card-body" v-else-if="error">
            <div class="alert alert-danger">
              <strong>Error:</strong> {{ error }}
              <div v-if="isAuthError">
                <p>You may need to login again.</p>
                <button class="btn btn-primary" @click="redirectToLogin">Go to Login</button>
              </div>
            </div>
          </div>
          
          <!-- Success state -->
          <div class="card-body" v-else-if="user">
            <div class="row">
              <!-- User image - uncomment when ready -->
              <!-- <div class="col-md-4">
                <img :src="user.image" alt="User Image" class="img-fluid">
              </div> -->
              <div class="col-md-8">
                <h5>Name: {{ user.name }}</h5>
                <p>Email: {{ user.email }}</p>
                <!-- <p>Phone Number: {{ user.phoneNumber }}</p>
                <p>Age: {{ user.age }}</p>
                <p>Sex: {{ user.sex }}</p>
                <p>Status: {{ user.status }}</p>
                <p>Address: {{ user.address }}</p>
                <p>City: {{ user.city }}</p>
                <p>State: {{ user.state }}</p>
                <p>Country: {{ user.country }}</p> -->
                
                <button class="btn btn-primary mt-3" @click="refreshProfile">Refresh Profile</button>
              </div>
            </div>
          </div>
          
          <!-- No user data -->
          <div class="card-body" v-else>
            <div class="alert alert-warning">
              <p>No profile data available.</p>
              <button class="btn btn-primary" @click="fetchUserProfile">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/Auth.js';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      user: null,
      loading: true,
      error: null,
      isAuthError: false
    };
  },
  created() {
    this.fetchUserProfile();
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async fetchUserProfile() {
      this.loading = true;
      this.error = null;
      this.isAuthError = false;
      
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          this.error = 'No authentication token found. Please log in.';
          this.isAuthError = true;
          this.loading = false;
          return;
        }
        
        console.log('Fetching user profile with token:', token);
        
        const authStore = useAuthStore();
        await authStore.fetchUserProfile();
        this.user = authStore.user;
        
        if (!this.user) {
          this.error = 'Failed to load user profile data.';
        }
      } catch (error) {
        console.error('Profile error:', error);
        this.error = error.message || 'Failed to load profile.';
        
        // Check if it's an authentication error
        if (error.response && error.response.status === 401) {
          this.isAuthError = true;
        }
      } finally {
        this.loading = false;
      }
    },
    
    redirectToLogin() {
      this.router.push('/login');
    },
    
    refreshProfile() {
      this.fetchUserProfile();
    }
  }
};
</script>

<style scoped>
.card {
  margin-top: 20px;
}

.card-header {
  background-color: #f7f7f7;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.card-body {
  padding: 20px;
}

.img-fluid {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  margin-bottom: 0;
}
</style>