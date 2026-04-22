import { createRouter, createWebHistory } from "vue-router";
import login from "../views/login.vue";
import dashboard from "../views/dashboard/dashboard.vue";

const routes = [
  { path: "/login", name: "login", component: login },
  { path: "/dashboard", name: "dashboard", component: dashboard },

  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
