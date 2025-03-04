import { createRouter, createWebHistory } from 'vue-router'
import home from '../views/home.vue'
import About from '@/views/About.vue'
import Blog from '@/views/Blog.vue'
import Post from '@/views/Post.vue'
import login from '@/views/login.vue'
import Signup from '@/views/Signup.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: home,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/blog',
      name: 'blog',
      component: Blog,
    },
    {
      path: '/post',
      name: '/post',
      component: Post,
    },
    {
      path: '/login',
      name: 'login',
      component: login,
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
    },
  ],
})

export default router
