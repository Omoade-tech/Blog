// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import navBar from './components/navBar.vue'
import footer from './components/footer.vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('navbar', navBar)
app.component('footer', footer)

app.mount('#app')
