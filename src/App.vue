<script setup>
import Sidebar from './components/shared/sideBar.vue'
import MobileFooter from './components/shared/mobileFooter.vue'
import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "./tools/methods.js";
import { useRouter, useRoute } from "vue-router"
import { useAdmin } from '@/stores/modules/admin';

const router = useRouter();
const route = useRoute();
const store = useAdmin();

// ===== مدیریت نشست کاربر =====
function checkSession() {
  const token = getCookie('token');
  
  if (!token) {
    router.push("/login");
    return false;
  }
  
  // بررسی تاریخ انقضای کوکی
  const sessionExpiry = getCookie('session_expiry');
  if (sessionExpiry) {
    const now = Date.now();
    const expiryTime = parseInt(sessionExpiry);
    
    // اگر زمان انقضا گذشته باشد
    if (now > expiryTime) {
      // پاک کردن کوکی‌ها
      deleteCookie('token');
      deleteCookie('session_expiry');
      delete axios.defaults.headers.common.Authorization;
      
      // نمایش پیام به کاربر
      alert('نشست شما منقضی شده است. لطفاً مجدداً وارد شوید.');
      
      router.push("/login");
      return false;
    }
  }
  
  return true;
}

// ===== تابع تمدید نشست =====
function refreshSession() {
  const token = getCookie('token');
  if (token) {
    // تنظیم مجدد زمان انقضا به یک هفته دیگر
    const oneWeekLater = Date.now() + (7 * 24 * 60 * 60 * 1000);
    setCookie('session_expiry', oneWeekLater.toString(), 7);
  }
}

// ===== تنظیم اولیه =====
const token = getCookie('token');

if (token) {
  // تنظیم هدر Authorization
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  
  // بررسی نشست
  if (checkSession()) {
    // دریافت اطلاعات کاربر
    store.getAdminDetail();
    
    // تمدید نشست با هر بار بارگذاری صفحه
    refreshSession();
  }
} else {
  router.push("/login");
}

// ===== اینترسپتور برای تمدید خودکار نشست =====
axios.interceptors.response.use(
  (response) => {
    // در هر درخواست موفق، نشست را تمدید کن
    if (getCookie('token')) {
      refreshSession();
    }
    return response;
  },
  (error) => {
    // اگر خطای ۴۰۱ (Unauthorized) برگشت، کاربر را به لاگین ببر
    if (error.response && error.response.status === 401) {
      deleteCookie('token');
      deleteCookie('session_expiry');
      delete axios.defaults.headers.common.Authorization;
      router.push({ name: "login" });
    }
    return Promise.reject(error);
  }
);

// ===== تابع برای بررسی دوره‌ای =====
let sessionCheckInterval = null;

// بررسی هر ۵ دقیقه
function startSessionCheck() {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }
  
  sessionCheckInterval = setInterval(() => {
    if (getCookie('token')) {
      checkSession();
    }
  }, 5 * 60 * 1000); // هر ۵ دقیقه
}

// شروع بررسی دوره‌ای
startSessionCheck();

// ===== پاکسازی اینتروال هنگام خروج =====
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
  }
});
</script>

<template>
  <div class="app-wrapper">
    <Sidebar v-if="route.path != '/login'" />
    <div class="main-content" :class="{ 'with-sidebar': route.path != '/login' }">
      <div class="page-container">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
    <MobileFooter v-if="route.path != '/login'" />
  </div>
</template>

<style>
/* ===== Reset & Base ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #0037ff;
  --primary-dark: #0029c4;
  --primary-light: #e8edff;
  --primary-gradient: linear-gradient(135deg, #0037ff, #0055ff);
  --shadow-sm: 0 2px 12px rgba(0, 55, 255, 0.08);
  --shadow-md: 0 8px 30px rgba(0, 55, 255, 0.12);
  --shadow-lg: 0 16px 48px rgba(0, 55, 255, 0.18);
  --radius: 16px;
  --radius-sm: 10px;
}

body {
  font-family: 'yekanbakhbold', 'Segoe UI', system-ui, sans-serif;
  background: #f5f7fb;
  color: #1a1a2e;
  direction: rtl;
}

/* ===== App Layout ===== */
.app-wrapper {
  display: flex;
  min-height: 100vh;
  background: #f5f7fb;
}

.main-content {
  flex: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
}

.main-content.with-sidebar {
  margin-right: 260px;
}

.page-container {
  padding: 24px 28px 100px 28px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Animations ===== */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* ===== Scrollbar ===== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f0f2f7;
}

::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

/* ===== Responsive ===== */
@media (max-width: 991px) {
  .main-content.with-sidebar {
    margin-right: 0;
  }
  
  .page-container {
    padding: 16px 16px 90px 16px;
  }
}

@media (max-width: 576px) {
  .page-container {
    padding: 12px 12px 80px 12px;
  }
}
</style>