import { createRouter, createWebHistory } from "vue-router";
import login from "../views/login.vue";
import dashboard from "../views/dashboard/dashboard.vue";

const routes = [
  { path: "/login", name: "login", component: login },
  { path: "/dashboard", name: "dashboard", component: dashboard },
  {
    path: "/deposit",
    name: "deposit",
    component: () => import("@/views/finance/deposit.vue"),
  },
  {
    path: "/cost",
    name: "cost",
    component: () => import("@/views/finance/cost.vue"),
  },
  {
    path: "/ticket",
    name: "ticket",
    component: () => import("@/views/ticket/list.vue"),
  },
  {
    path: "/ticket/:id",
    name: "ticket-detail",
    component: () => import("@/views/ticket/detail.vue"),
  },
  {
    path: "/ticket/add",
    name: "ticket-add",
    component: () => import("@/views/ticket/add.vue"),
  },
  { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
