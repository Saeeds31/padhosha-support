<template>
  <div id="sidebar">
    <!-- Overlay برای موبایل -->
    <div class="sidebar-overlay" v-if="mobileOpen" @click="mobileOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-open': mobileOpen }">
      <!-- Header با لوگو -->
      <div class="sidebar-header">
        <router-link to="/dashboard" class="logo-wrapper">
          <div class="logo-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#logoGrad)"/>
              <path d="M12 20L18 26L28 14" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stop-color="#0037ff"/>
                  <stop offset="100%" stop-color="#0055ff"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="logo-text" v-if="mobileOpen || windowWidth < 992">
            پنل مشتریان
          </span>
        </router-link>

        <!-- دکمه بستن در موبایل -->
        <button class="sidebar-close" @click="mobileOpen = false" v-if="windowWidth < 992">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- اطلاعات کاربر -->
      <div class="user-info" v-if="employer">
        <div class="user-avatar">
          <span>{{ employer.full_name?.charAt(0) || 'م' }}</span>
        </div>
        <div class="user-details">
          <div class="user-name">{{ employer.full_name || 'کاربر' }}</div>
          <div class="user-company">{{ employer.employer?.bussines_label || 'مشتری' }}</div>
        </div>
        <div class="user-badge" :class="levelClass">
          {{ levelLabel }}
        </div>
      </div>

      <!-- منو -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-title">منوی اصلی</span>
          <router-link
            v-for="item in menuItems"
            :key="item.name"
            :to="item.link"
            class="nav-item"
            :class="{ active: route.path === item.link }"
          >
            <i :class="item.icon"></i>
            <span v-if="mobileOpen || windowWidth < 992">{{ item.name }}</span>
            <span class="nav-badge" v-if="item.badge">{{ item.badge }}</span>
          </router-link>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">سیستم</span>
          <button class="nav-item logout-btn" @click="logout">
            <i class="bi bi-box-arrow-left"></i>
            <span v-if="mobileOpen || windowWidth < 992">خروج</span>
          </button>
        </div>
      </nav>

      <!-- نسخه -->
      <div class="sidebar-footer">
        <span>نسخه ۲.۰.۱</span>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAdmin } from '@/stores/modules/admin';
import axios from "axios";
import { deleteCookie } from "@/tools/methods.js";

const route = useRoute();
const router = useRouter();
const store = useAdmin();
const mobileOpen = ref(false);
const windowWidth = ref(window.innerWidth);

const employer = computed(() => store.getAdmin);

// سطح کاربر
const levelClass = computed(() => {
  const level = employer.value?.subscription?.level_type || 'bronze';
  return `badge-${level}`;
});

const levelLabel = computed(() => {
  const levels = {
    bronze: 'برنز',
    silver: 'نقره‌ای',
    gold: 'طلا',
    diamond: 'الماس'
  };
  const level = employer.value?.subscription?.level_type || 'bronze';
  return levels[level] || 'برنز';
});

// منوها
const menuItems = ref([
  { name: "داشبورد", link: "/dashboard", icon: "bi-grid-fill" },
  { name: "پرداختی‌ها", link: "/deposit", icon: "bi-wallet-fill" },
  { name: "هزینه‌ها", link: "/cost", icon: "bi-receipt-cutoff" },
  { name: "تیکت‌ها", link: "/ticket", icon: "bi-chat-dots-fill", },
  { name: "تیکت جدید", link: "/ticket/add", icon: "bi-plus-circle-fill" },
]);

const logout = () => {
  deleteCookie("token");
  delete axios.defaults.headers.common.Authorization;
  router.push('/login');
};

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 992) {
    mobileOpen.value = true;
  }
};

onMounted(() => {
  window.addEventListener("resize", updateWidth);
  if (windowWidth.value >= 992) {
    mobileOpen.value = true;
  }
});

onBeforeUnmount(() => window.removeEventListener("resize", updateWidth));
</script>

<style scoped>
/* ===== Sidebar ===== */
.sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: #ffffff;
  border-left: 1px solid rgba(0, 55, 255, 0.06);
  box-shadow: var(--shadow-md);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar-open {
  transform: translateX(0);
}

/* Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1099;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== Header ===== */
.sidebar-header {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 55, 255, 0.06);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-icon {
  flex-shrink: 0;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: -0.3px;
}

.sidebar-close {
  background: none;
  border: none;
  font-size: 22px;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar-close:hover {
  background: #f0f2f7;
  color: #1a1a2e;
}

/* ===== User Info ===== */
.user-info {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(0, 55, 255, 0.06);
  background: linear-gradient(135deg, #f8faff, #f0f4ff);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 55, 255, 0.25);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-company {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-bronze {
  background: #f5e6d3;
  color: #8b6b4a;
}

.badge-silver {
  background: #e8ecf1;
  color: #6b7a8a;
}

.badge-gold {
  background: #fef3c7;
  color: #b8860b;
}

.badge-diamond {
  background: #dbeafe;
  color: #1e40af;
}

/* ===== Navigation ===== */
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-section {
  margin-bottom: 20px;
}

.nav-section:last-child {
  margin-bottom: 0;
}

.nav-section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #a0a0b8;
  padding: 0 10px;
  display: block;
  margin-bottom: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  color: #4a4a6a;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  width: 100%;
  background: none;
  border: none;
  font-family: inherit;
}

.nav-item i {
  font-size: 18px;
  width: 24px;
  text-align: center;
  color: #8888aa;
  transition: color 0.2s;
}

.nav-item:hover {
  background: var(--primary-light);
  color: var(--primary);
}

.nav-item:hover i {
  color: var(--primary);
}

.nav-item.active {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 16px rgba(0, 55, 255, 0.3);
}

.nav-item.active i {
  color: white;
}

.nav-badge {
  margin-right: auto;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.nav-item.active .nav-badge {
  background: rgba(255, 255, 255, 0.25);
}

.logout-btn {
  color: #e74c3c;
}

.logout-btn i {
  color: #e74c3c;
}

.logout-btn:hover {
  background: #fef0ef;
  color: #c0392b;
}

.logout-btn:hover i {
  color: #c0392b;
}

/* ===== Footer ===== */
.sidebar-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 55, 255, 0.06);
  text-align: center;
  font-size: 11px;
  color: #aaa;
  background: #fafbfc;
}

/* ===== Responsive ===== */
@media (min-width: 992px) {
  .sidebar {
    transform: translateX(0) !important;
  }
  
  .sidebar-overlay {
    display: none !important;
  }
  
  .sidebar-close {
    display: none !important;
  }
}

@media (max-width: 991px) {
  .sidebar {
    width: 280px;
  }
}
</style>