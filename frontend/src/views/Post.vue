<template>
    <div class="container mt-4">
        <h3 class="text-center mb-4">Post Blog</h3>

        <div class="row justify-content-center">
            <div class="col-md-8">
                <form @submit.prevent="handlePostBlog">
                    <!-- authorName -->
                    <div class="mb-3">
                        <label for="authorName" class="form-label">Author Name</label>
                        <input 
                            type="text"
                            id="authorName"
                            v-model="authorName"
                            class="form-control"
                            placeholder="Enter Author Name"
                            required
                        />
                    </div>

                    <!-- title -->
                    <div class="mb-3">
                        <label for="title" class="form-label">Blog Title</label>
                        <input 
                            type="text"
                            id="title"
                            v-model="title"
                            class="form-control"
                            placeholder="Enter the Blog Title"
                            required
                        />
                    </div>

                    <!-- content -->
                    <div class="mb-3">
                        <label for="content" class="form-label">Content</label>
                        <textarea
                            id="content"
                            v-model="content"
                            class="form-control"
                            placeholder="Enter the Content"
                            rows="6"
                            required
                        ></textarea>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMessage" class="alert alert-danger mb-3">
                        {{ errorMessage }}
                    </div>

                    <!-- Success Message -->
                    <div v-if="successMessage" class="alert alert-success mb-3">
                        {{ successMessage }}
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        Post Blog
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '@/stores/Auth.js'
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';


export default {
    data() {
        return {
            authorName: '',
            title: '',
            content: '',
            loading: false,
            errorMessage: '',
            successMessage: '',
            user_id: null,
            authStore: null
        }
    },

    setup() {
        const router = useRouter();
        const toast = useToast();
        return { router, toast };
    },

    created() {
        this.authStore = useAuthStore()
        
        // Check if user is authenticated and has the correct role
        if (!this.authStore.isAuthenticated) {
            this.errorMessage = 'You must be logged in to post a blog.'
            setTimeout(() => {
                this.$router.push('/login')
            }, 2000)
            return
        }

        // Get the user ID from the authenticated user
        this.user_id = this.authStore.user?.id || this.authStore.user?.user_id
        
        // Pre-fill author name if available
        if (this.authStore.user?.name) {
            this.authorName = this.authStore.user.name
        }
    },
    methods: {
        async handlePostBlog() {
            this.loading = true
            this.errorMessage = ''
            this.successMessage = ''

            try {
                if (!this.user_id) {
                    throw new Error('User ID not available. Please log in again.')
                }

                const blogData = {
                    authorName: this.authorName,
                    title: this.title,
                    content: this.content,
                    user_id: this.user_id
                }

                // Call the createBlog method from the Auth store
                const response = await this.authStore.createBlog(blogData)

                this.toast.success('Blog Posted Successfully  Cruiz-blog.' ,{
          timeout: 3000,

        });
                
                // Display success message
                // this.successMessage = 'Blog posted successfully!'
                
                // Reset form fields
                this.authorName = ''
                this.title = ''
                this.content = ''
                
                // Redirect to blog list after a short delay
                setTimeout(() => {
                    this.$router.push('/blog')
                }, 2000)
                
            } catch (error) {
                this.errorMessage = error.response?.data?.message || error.message || 'Failed to post blog. Please try again.'
                console.error('Blog post error:', error)
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

<style scoped>
/* You can add custom styles here if needed */
</style>