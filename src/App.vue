<script setup>
import Sidebar from './components/shared/sideBar.vue'
import Toolbar from './components/shared/toolBar.vue'
import axios from "axios";
import { getCookie } from "./tools/methods.js";
import { useRouter, useRoute } from "vue-router"
import { useAdmin } from '@/stores/modules/admin';
import MobileFooter from './components/shared/mobileFooter.vue';
const router = useRouter();
const route = useRoute();
const store = useAdmin();

if (getCookie('token')) {
  axios.defaults.headers.common.Authorization = `Bearer ${getCookie('token')}`
  store.getAdminDetail();


} else {
  router.push("/login")
}
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      router.push({ name: "login" }); // برو به صفحه لاگین
    }
    return Promise.reject(error);
  }
);
</script>
<template>
  <div class=" mainpage-container d-flex w-100">
    <Sidebar v-if="route.path != '/login'" />
    <div class="flex-grow-1" id="mainContent">
      <router-view></router-view>
    </div>
  </div>
  <MobileFooter v-if="route.path != '/login'"></MobileFooter>
</template>

<style>
div#mainContent {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-right: 250px;
}


.yekanf {
  font-family: 'yekanbakhbold';
}
</style>