<template>
  <div class="container signup-page">
    <div class="row">
      <div class="col-md-6 d-none d-md-flex align-items-center justify-content-center">
        <img src="../assets/image/register.png" alt="Signup Hero" class="img-fluid rounded shadow-lg" />
      </div>
      <div class="col-md-6 d-flex align-items-center justify-content-center p-5">
        <div class="signup-form w-95">
          <h2 class="text-center mb-4">Create Your Account</h2>
          <form @submit.prevent="handleRegister" novalidate>
            <div class="mb-3">
              <label for="name" class="form-label">Full Name</label>
              <input 
                type="text" 
                class="form-control" 
                id="name" 
                v-model="name" 
                :class="{'is-invalid': submitted && !name}" 
                autocomplete="name"
                required 
              />
              <div class="invalid-feedback" v-if="submitted && !name">Name is required</div>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email Address</label>
              <input 
                type="email" 
                class="form-control" 
                id="email" 
                v-model="email" 
                :class="{'is-invalid': submitted && !isValidEmail}" 
                autocomplete="email"
                required 
              />
              <div class="invalid-feedback" v-if="submitted && !isValidEmail">Please enter a valid email address</div>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input 
                type="password" 
                class="form-control" 
                id="password" 
                v-model="password" 
                :class="{'is-invalid': submitted && !isValidPassword}" 
                autocomplete="new-password"
                required 
              />
              <div class="invalid-feedback" v-if="submitted && !isValidPassword">Password must be at least 8 characters long</div>
            </div>
            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input 
                type="password" 
                class="form-control" 
                id="confirmPassword" 
                v-model="confirmPassword" 
                :class="{'is-invalid': submitted && !passwordsMatch}" 
                autocomplete="new-password"
                required 
              />
              <div class="invalid-feedback" v-if="submitted && !passwordsMatch">Passwords do not match</div>
            </div>
            <div class="mb-3">
              <label for="role" class="form-label">Select Role</label>
              <select 
                class="form-select" 
                id="role" 
                v-model="role" 
                :class="{'is-invalid': submitted && !role}" 
                required
              >
                <option value="" disabled>Choose a role</option>
                <option value="blogUser">Blog User</option>
                <option value="admin">Admin</option>
              </select>
              <div class="invalid-feedback" v-if="submitted && !role">Please select a role</div>
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-sm p-2 w-50" :disabled="isLoading">
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sign Up
              </button>
            </div>
            <div v-if="errorMessage" class="alert alert-danger mt-3 text-center">{{ errorMessage }}</div>
            <div class="text-center mt-3">
              Already have an account? <router-link to="/login" class="text-primary">Login</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/Auth.js';
import { useToast } from "vue-toastification";

export default {
  setup() {
      const toast = useToast();
      return { toast }
    },
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      submitted: false,
      isLoading: false,
      errorMessage: '',
    };
  },
  computed: {
    isValidEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.email);
    },
    isValidPassword() {
      return this.password.length >= 8;
    },
    passwordsMatch() {
      return this.password === this.confirmPassword;
    }
  },
  methods: {
    async handleRegister() {
      this.errorMessage = '';
      this.submitted = true;

      if (!this.isValidEmail || !this.isValidPassword || !this.passwordsMatch || !this.name || !this.role) {
        return;
      }

      this.isLoading = true;

      try {
        // Create a plain object instead of FormData
        const registerData = {
          name: this.name,
          email: this.email,
          password: this.password,
          role: this.role
        };
        
        const authStore = useAuthStore();
        await authStore.register(registerData);

        this.toast.success('Registration successful! Please login.', {
          timeout: 3000,
        });
        
        // Redirect to login page
        this.$router.push('/login');
      } catch (error) {
        console.error('Registration error:', error);
        
        // Handle different types of errors
        if (error.response?.data?.errors) {
          // Laravel validation errors
          const errors = error.response.data.errors;
          const firstError = Object.values(errors)[0];
          this.errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (error.response?.data?.message) {
          // Server error message
          this.errorMessage = error.response.data.message;
        } else {
          // Generic error
          this.errorMessage = 'Registration failed. Please try again.';
        }
        
        this.toast.error(this.errorMessage, {
          timeout: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  padding: 2rem 0;
}

.signup-form {
  max-width: 500px;
  width: 100%;
}

</style>