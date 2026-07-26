import { createApp } from "vue";
import "./assets/css/style.css";
import "./assets/css/theme.css"; // تم جدید اضافه شد
import App from "./App.vue";

// Bootstrap
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap.rtl.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap"; // برای کامپوننت‌های JS

// Vue plugins
import BootstrapVue3 from "bootstrap-vue-3";
import router from "./router";
import pinia from "./stores";
import axios from "axios";
import Vue3Toastify, { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

// کامپوننت‌های ثالث
import VueFileAgent from "@boindil/vue-file-agent-next";
import "@boindil/vue-file-agent-next/dist/vue-file-agent-next.css";
import Vue3PersianDatetimePicker from "vue3-persian-datetime-picker";
import Multiselect from "vue-multiselect";
import "vue3-treeselect/dist/vue3-treeselect.css";

// ===== تنظیمات Axios =====
axios.defaults.baseURL = "https://api.padhosha.ir/api/v1/employer";
window.baseImageAddress = "https://api.padhosha.ir/storage_public/";

// ===== توابع مدیریت کوکی =====
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=; Max-Age=-99999999; path=/";
}

// ===== اینترسپتورهای Axios =====

// ۱. درخواست (Request Interceptor)
axios.interceptors.request.use(
  (config) => {
    // اضافه کردن توکن به هدر درخواست
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ۲. پاسخ (Response Interceptor) - مدیریت خطای ۴۰۱
axios.interceptors.response.use(
  (response) => {
    // درخواست موفق - کاری نمی‌کنیم
    return response;
  },
  (error) => {
    // بررسی می‌کنیم که خطا ۴۰۱ باشد
    if (error.response && error.response.status === 401) {
      // پاک کردن کوکی‌ها
      deleteCookie('token');
      deleteCookie('session_expiry');
      
      // حذف هدر Authorization
      delete axios.defaults.headers.common.Authorization;
      
      // نمایش پیام به کاربر
      toast.error('نشست شما منقضی شده است. لطفاً مجدداً وارد شوید.', {
        position: 'top-right',
        autoClose: 3000,
      });
      
      // هدایت به صفحه لاگین
      // با استفاده از setTimeout تا مطمئن شویم توست نمایش داده می‌شود
      setTimeout(() => {
        router.push('/login');
      }, 500);
    }
    
    // خطاهای ۴۲۲ (اعتبارسنجی) را هم مدیریت می‌کنیم
    if (error.response && error.response.status === 422) {
      // این خطاها توسط کامپوننت‌ها مدیریت می‌شوند
      // فقط برای لاگ کردن
      console.warn('Validation error:', error.response.data.errors);
    }
    
    return Promise.reject(error);
  }
);

// ===== ایجاد اپ =====
const app = createApp(App);

// ===== پلاگین‌ها =====
app.use(pinia);
app.use(router);
app.use(BootstrapVue3);

// ===== Toastify با تنظیمات RTL =====
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: "top-right",
  rtl: true,
  theme: "colored",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progressBar: true,
});

// ===== کامپوننت‌های ثالث =====
app.use(VueFileAgent);
app.component("DatePicker", Vue3PersianDatetimePicker);
app.component("multiselect", Multiselect);

// ===== Mount =====
app.mount("#app");