import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
// import MyBlog from '@/components/MyBlog.vue';

import App from './App.vue'
import router from './router'

const app = createApp(App)

// const toast = createToast({
//   position: 'center',
//   timeout: 3000,
//   closeButton: false,
//   icon: false,
//   className: 'toast-modal',
// })

app.use(createPinia())
app.use(router)
// app.component('MyBlog', MyBlog)
app.use(Toast);

// Mount the app to the DOM
app.mount('#app')
