import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'admin-lte/dist/js/adminlte.min.js';


import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { useUserStore } from '@/stores/user';
import { apiVerify } from '@/functions/api/auth';
import { createPinia } from 'pinia'
import axios from 'axios';
import {createI18n} from 'vue-i18n'

const i18n = createI18n({
    locale: 'kh',
    fallbackLocale: 'en',
    messages: {
        en: {
            // English messages
            messages: {
                welcome: 'Welcome',
                signIn: 'Sign In',
                signOut: 'Sign Out',
                dashboard: 'Dashboard',
                profile: 'Profile',
                settings: 'Settings'
            }
        },
        kh: {
            // Khmer messages
            messages: {
                welcome: 'សួស្តី',
                signIn: 'ចុះឈ្មោះ',
                signOut: 'ចាកចេញ',
                dashboard: 'ផ្ទាំងគ្រប់គ្រង',
                profile: 'ប្រវត្តិរបស់ខ្ញុំ',
                settings: 'ការកំណត់'
            }
        }
    }
});

const pinia = createPinia();

createApp(App).use(router).use(i18n).use(pinia).mount('#app');

const userStore = useUserStore();

axios.interceptors.request.use((config) => {
    const token = userStore.getSanctumToken();
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

router.beforeEach(async (to, from) => {
    const { guarded } = to.meta;
    if (guarded === undefined) { // if the route is not guarded, we don't need to verify the token
        return;
    }

    try {
        const response = await apiVerify();
        const { data } = response;
        userStore.setState(data.user);
    } catch (error) {
        userStore.reset();
    }

    if (guarded && !userStore.isAuthenticated) { // if the route is guarded and the user is not authenticated, redirect to signin page
        return { name: 'SignIn' };
    }
    if (!guarded && userStore.isAuthenticated) { // if the route is not guarded and the user is authenticated, redirect to dashboard page
        return { name: 'Dashboard' };
    }
});