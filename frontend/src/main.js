import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import i18n from './i18n'

console.log("API BASE URL:", process.env.VUE_APP_API_BASE_URL);

createApp(App).use(i18n).use(router).mount('#app');