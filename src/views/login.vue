<template>
  <div class="login-wrapper">
    <div class="login-container">
      <!-- بخش بالایی با گرادینت و متن همکاری -->
      <div class="hero-section">
        <div class="badge-gradient">
          <i class="bi bi-briefcase-fill"></i>
          <span>همکاران ویژه تیم ما</span>
        </div>
        <h1 class="welcome-title">خوش آمدید</h1>
        <p class="welcome-subtitle">
          <i class="bi bi-diamond-fill"></i>
          این پنل مخصوص همکارانی است که با ما همکاری دارند
          <br />
          و سایتشان را ما طراحی کرده‌ایم
          <i class="bi bi-diamond-fill"></i>
        </p>
      </div>

      <!-- فرم با کارت شناور -->
      <div class="form-card">
        <b-form @submit.prevent="handleLogin">
          <!-- شماره موبایل + دکمه ارسال کد -->
          <div class="input-otp-group">
            <label class="input-label">شماره موبایل</label>
            <div class="mobile-input-wrapper">
              <b-form-input
                id="username"
                v-model="username"
                type="tel"
                placeholder="09123456789"
                class="mobile-input"
                required
              ></b-form-input>
              <button
                type="button"
                @click="sendOtp()"
                :disabled="counter != 0 || loader"
                class="send-otp-btn"
                :class="{ 'btn-disabled': counter != 0 }"
              >
                <span v-if="counter <= 0">
                  <i class="bi bi-envelope-paper-fill"></i>
                  <span>{{ loader ? 'منتظر...' : 'ارسال کد' }}</span>
                </span>
                <span v-else class="counter-circle">{{ counter }}</span>
              </button>
            </div>
          </div>

          <!-- کد یکبار مصرف -->
          <div class="input-otp-group">
            <label class="input-label">کد یکبار مصرف</label>
            <v-otp-input
              ref="otpInput"
              input-classes="otp-input-modern"
              inputmode="tel"
              separator="-"
              inputType="letter-numeric"
              :num-inputs="6"
              v-model:value="otp"
            />
          </div>

          <!-- دکمه ورود -->
          <button type="submit" class="login-submit-btn">
            <i class="bi bi-arrow-left-circle-fill"></i>
            <span>ورود به پنل همکاران</span>
          </button>
        </b-form>

        <div v-if="message" class="error-message">
          <i class="bi bi-exclamation-triangle-fill"></i>
          {{ message }}
        </div>
      </div>

      <!-- فوتر مینیمال -->
      <div class="footer-note">
        <i class="bi bi-shield-lock-fill"></i>
        <span>دسترسی انحصاری | مخصوص همکاران ما</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  BCard,
  BForm,
  BFormGroup,
  BFormInput,
  BButton
} from 'bootstrap-vue-3';
import axios from 'axios';
import { ref } from "vue"
import { toast } from 'vue3-toastify'
import { useRouter } from "vue-router";
import VOtpInput from "vue3-otp-input";
import { setCookie } from "../tools/methods.js"
import { useAdmin } from '@/stores/modules/admin';
const store = useAdmin();

const router = useRouter();
let username = ref('');
let password = ref('');
let message = ref('');
let otp = ref();
let counter = ref(0);

function handleLogin() {
  if (!username.value || !otp) {
    toast.error("لطفا شماره تماس و کد یکبار مصرف را وارد کنید")
    return
  }
  let fd = new FormData();
  fd.append("mobile", username.value)
  fd.append("token", otp.value)
  axios.post("/login", fd).then(res => {
    toast.success("ورود موفقیت  آمیز بود! 🎉")
    axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
    message.value = '';
    setCookie("token", res.data.token)
    store.getAdminDetail();

    router.push("/dashboard")
  }).catch(err => {
    console.log(err);
    message.value = 'نام کاربری و رمز عبور اشتباه است.'

  })
}
let loader = ref(false);
async function sendOtp() {
  if (loader.value) return;
  loader.value = true;
  counter.value = -1;
  let fd = new FormData();
  fd.append("mobile", username.value);
  try {
    let { data } = await axios.post("/send-token", fd)
    toast.success("کد یکبار مصرف برای شما ارسال شد! ")
    showTimer();
  } catch (error) {
    toast.error(error.response?.data?.message)
  } finally {
    loader.value = false;

  }
}
let timer = null;
function showTimer() {
  counter.value = 60;
  clearInterval(timer);
  timer = setInterval(() => {
    counter.value--;
    if (counter.value == 0) {
      clearInterval(timer);
    }
  }, 1000);
}
</script>



<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-wrapper {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(145deg, #f6f9fc 0%, #eef2f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: system-ui, 'Segoe UI', 'Tahoma', sans-serif;
}

.login-container {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

/* بخش هدر با گرادینت */
.hero-section {
  text-align: center;
  margin-bottom: 30px;
}

.badge-gradient {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(110deg, #1e2a5e, #2a3f8e);
  color: white;
  padding: 6px 18px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  box-shadow: 0 6px 14px rgba(30, 42, 94, 0.2);
  margin-bottom: 18px;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e2a5e, #2a4f8e);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: 12px;
}

.welcome-subtitle {
  font-size: 0.85rem;
  color: #5a6e8a;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  display: inline-block;
  padding: 8px 16px;
  border-radius: 40px;
  line-height: 1.5;
}

.welcome-subtitle i {
  font-size: 0.7rem;
  margin: 0 5px;
  color: #f5b042;
}

/* کارت فرم شناور و مدرن */
.form-card {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-radius: 32px;
  padding: 30px 24px;
  box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.input-otp-group {
  margin-bottom: 28px;
}

.input-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e66;
  margin-bottom: 10px;
  padding-right: 4px;
}

.mobile-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.mobile-input {
  flex: 1;
  border: 1.5px solid #e2e8f0;
  border-radius: 24px;
  padding: 14px 18px;
  font-size: 0.95rem;
  background: #ffffff;
  transition: all 0.2s ease;
  direction: ltr;
  text-align: left;
}

.mobile-input:focus {
  border-color: #2a4f8e;
  outline: none;
  box-shadow: 0 0 0 3px rgba(42, 79, 142, 0.1);
}

.send-otp-btn {
  background: linear-gradient(110deg, #2a4f8e, #1e3a6b);
  border: none;
  border-radius: 40px;
  padding: 0 20px;
  height: 52px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}

.send-otp-btn:hover:not(:disabled) {
  transform: scale(0.97);
  background: linear-gradient(110deg, #1e3a6b, #122b52);
}

.btn-disabled,
.send-otp-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.counter-circle {
  background: white;
  color: #1e3a6b;
  border-radius: 30px;
  padding: 4px 12px;
  font-weight: bold;
  font-size: 1rem;
}

/* استایل مدرن otp */
:deep(.otp-input-modern) {
  width: 52px !important;
  height: 58px !important;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  transition: 0.2s;
  margin: 0 5px;
  color: #1e2a5e;
}

:deep(.otp-input-modern:focus) {
  border-color: #2a4f8e;
  box-shadow: 0 0 0 3px rgba(42, 79, 142, 0.15);
  outline: none;
}

.login-submit-btn {
  width: 100%;
  background: linear-gradient(105deg, #1e2a5e, #2f4590);
  border: none;
  border-radius: 60px;
  padding: 16px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: 0.2s ease;
  margin-top: 12px;
  cursor: pointer;
  box-shadow: 0 12px 20px -12px rgba(30, 42, 94, 0.4);
}

.login-submit-btn:hover {
  transform: translateY(-2px);
  background: linear-gradient(105deg, #16224b, #253a7a);
}

.error-message {
  margin-top: 20px;
  text-align: center;
  color: #e53e3e;
  background: #fff5f5;
  border-radius: 60px;
  padding: 10px;
  font-size: 0.8rem;
  font-weight: 500;
}

.footer-note {
  text-align: center;
  margin-top: 28px;
  font-size: 0.7rem;
  color: #7a8aa5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.5);
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  padding: 6px 18px;
  border-radius: 60px;
  backdrop-filter: blur(2px);
}

/* ========== ریسپانسیو عالی برای موبایل ========== */
@media (max-width: 560px) {
  .login-wrapper {
    padding: 12px;
    align-items: center;
  }

  .form-card {
    padding: 22px 18px;
    border-radius: 28px;
  }

  .welcome-title {
    font-size: 1.7rem;
  }

  .welcome-subtitle {
    font-size: 0.75rem;
    padding: 6px 14px;
  }

  .mobile-input {
    padding: 12px 14px;
    font-size: 0.9rem;
  }

  .send-otp-btn {
    height: 48px;
    padding: 0 16px;
    font-size: 0.75rem;
  }

  :deep(.otp-input-modern) {
    width: 42px !important;
    height: 48px !important;
    font-size: 1.2rem;
    margin: 0 3px;
  }

  .login-submit-btn {
    padding: 14px;
    font-size: 0.9rem;
  }
}

@media (max-width: 420px) {
  .form-card {
    padding: 20px 14px;
  }

  :deep(.otp-input-modern) {
    width: 36px !important;
    height: 44px !important;
    font-size: 1rem;
    margin: 0 2px;
  }

  .mobile-input-wrapper {
    gap: 8px;
  }

  .send-otp-btn {
    padding: 0 12px;
  }

  .badge-gradient {
    font-size: 0.7rem;
    padding: 4px 14px;
  }
}
</style>