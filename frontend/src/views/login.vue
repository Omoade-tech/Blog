<template>
  <div class="container d-flex align-items-center justify-content-center">
    <div class="row">
      <div class="col-md-6">
        <img src="../assets/image/login.png" alt="Login Image" class="img-fluid" />
      </div>
      <div class="col-md-6">
        <div class="login-card">
          <form @submit.prevent="handleLogin">
            <h2 class="text-center mb-3">Login</h2>
            <div class="form-group input-group mb-3">
              <label for="email"></label>
              <input type="text" id="email" v-model="email" class="form-control" placeholder="Enter your email" required>
              <i class="bi bi-person"></i>
            </div>
            <div class="form-group input-group mb-3">
              <label for="password"></label>
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" class="form-control" placeholder="Enter your password" required>
              <i class="bi bi-lock" v-if="!showPassword"></i>
              <i class="bi bi-unlock" v-if="showPassword"></i>
              <button @click="togglePasswordVisibility" type="button" class="btn btn-link">
                <i class="bi bi-eye-slash" v-if="!showPassword"></i>
                <i class="bi bi-eye" v-if="showPassword"></i>
              </button>
            </div>
            <div class="remember-me form-group">
              <input type="checkbox" v-model="rememberMe" id="rememberMe" />
              <label for="rememberMe">Remember Me</label>
            </div>
            <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isLoading ? 'Logging in...' : 'Login' }}
            </button>
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
    const authStore = useAuthStore();
    return { toast, authStore }
  },
  
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      showPassword: false,
      isLoading: false
    };
  },
  
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    async handleLogin() {
      try {
        this.isLoading = true;
        
        // Use the authStore from setup()
        const response = await this.authStore.login({ 
          email: this.email, 
          password: this.password 
        });
        
        this.toast.success('Login successfully', {
          timeout: 3000,
        });
        
        if (response && response.user && response.user.role === 'admin') {
          this.$router.push('/admindashboard');
        } else {
          this.$router.push('/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
        this.toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.', {
          timeout: 5000,
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.login-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.input-group {
  position: relative;
}

.input-group i {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.input-group button[type="button"] {
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  border: none;
  padding: 0;
  font-size: 14px;
  cursor: pointer;
}

.input-group button[type="button"] i {
  font-size: 16px;
}

.remember-me {
  margin-bottom: 10px;
  
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>