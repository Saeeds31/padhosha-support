<template>
  <div id="sidebar">

    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column bg-light" :class="{ 'sidebar-open': mobileOpen }">
      <!-- Logo -->
      <router-link to="/dashboard" class="p-3 d-flex justify-content-center border-bottom">
        <img v-if="employer" :src="findLogo(employer.employer.bussines_logo)" />
      </router-link>
      <div class="w-100 employerMenu">
        <template v-for="item in menuItems" :key="item.name">
          <b-nav-item :to="item.link" class="d-flex align-items-center">
            <i :class="item.icon + ' me-2'"></i>
            <span v-if="mobileOpen || windowWidth < 992">{{ item.name }}</span>
          </b-nav-item>
        </template>
        <b-nav-item @click="logout" class="d-flex align-items-center">
          <i class="bi bi-arrow-bar-leftx"></i>
          <span v-if="mobileOpen || windowWidth < 992">
            خروج از پشتیبانی

          </span>
        </b-nav-item>
      </div>
      <div class="employerName">

        <hr>
        <h4>
          {{ employer && employer.employer ? `${employer.employer.bussines_label} - ${employer.full_name}` : 'پنل مشتری'
          }}

        </h4>
      </div>
      <div v-if="!employer" class="sidebarLoader">

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { BNav, BNavItem, BButton, BCollapse } from "bootstrap-vue-3";
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();
const checkPermission = store.checkPermission;
const mobileOpen = ref(true);
const windowWidth = ref(window.innerWidth);
const openSubmenuStates = ref({});
const openSubmenu = ref(null);
const toggleSubmenu = (item) => {
  openSubmenuStates.value[item.name] = !openSubmenuStates.value[item.name];
  openSubmenu.value = openSubmenuStates.value[item.name] ? item.name : null;
};
let employer = computed(() => {
  return store.getAdmin
})
function findLogo(path) {
  return window.baseImageAddress + path
}
const logout = () => {
  toast.success("با موفقیت خارج شدید")
  deleteCookie("token")
  delete axios.defaults.headers.common.Authorization
  router.push('/login')
}
// منوها
const menuItems = ref(
  [
    {
      name: "داشبورد",
      link: "/dashboard", icon: "bi-house-fill"
    },
    {
      name: "پرداختی ها",
      icon: "bi-wallet",
      link: "/deposit",
    },
    {
      name: "هزینه ها",
      icon: "bi-table",
      link: "/cost",
    },
    {
      name: "تیکت ها",
      icon: "bi-ticket",
      link: "/ticket",
    },

    {
      name: "تیکت جدید",
      icon: "bi-plus",
      link: "/ticket/add",
    },
  ]
);
const updateWidth = () => (windowWidth.value = window.innerWidth);
onMounted(() => window.addEventListener("resize", updateWidth));
onBeforeUnmount(() => window.removeEventListener("resize", updateWidth));
</script>

<style scoped>
.sidebar {
  width: 250px;
  transition: width 0.2s;
  height: 100vh;
  overflow: auto;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-open {
  width: 250px;
  /* expanded */
}

.nav-link {
  padding: 0.5rem 1rem;
}

@media (max-width: 991px) {
  .sidebar {
    display: none !important;
  }

  .sidebar-open {
    transform: translateX(0);
  }
}

.employerMenu li {
  width: 90%;
  margin: 8px auto;
  background: #dfdfdf;
  padding: 4px 8px;
  border-radius: 8px;
}

.sidebarLoader {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  background: #1213;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(1px);
}

.employerName h4 {
  margin-right: 5%;
  font-weight: bold;
  font-size: 18px;
  font-family: 'yekanbakhbold';
}

.employerName {
  margin-top: auto;
}

.employerMenu li:hover {
  background: darkblue;
  color: white;
  transition: all 0.5s;
}

.employerMenu li a {
  width: 100%;
}
</style>
