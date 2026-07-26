<template>
  <div class="mobile-footer">
    <button
      v-for="item in footerItems"
      :key="item.path"
      class="footer-btn"
      :class="{ active: isActive(item.path) }"
      @click="go(item.path)"
    >
      <div class="btn-content">
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const footerItems = [
  { path: '/dashboard', icon: 'bi bi-house-fill', label: 'خانه' },
  { path: '/ticket', icon: 'bi bi-chat-dots-fill', label: 'تیکت' },
  { path: '/deposit', icon: 'bi bi-wallet-fill', label: 'پرداخت' },
  { path: '/cost', icon: 'bi bi-receipt-cutoff', label: 'هزینه' },
]

const isActive = (path) => route.path === path
const go = (path) => router.push(path)
</script>

<style>
/* ===== Mobile Footer ===== */
@media (min-width: 768px) {
  .mobile-footer {
    display: none !important;
  }
}

.mobile-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1050;
  background: #ffffff;
  border-top: 1px solid rgba(0, 55, 255, 0.08);
  padding: 8px 8px calc(8px + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.footer-btn {
  background: none;
  border: none;
  padding: 8px 4px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  color: #8888aa;
  font-family: inherit;
  position: relative;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.footer-btn i {
  font-size: 22px;
  transition: all 0.25s ease;
}

.footer-btn span {
  font-size: 10px;
  font-weight: 500;
  transition: color 0.25s;
}

.footer-btn:hover {
  color: var(--primary);
}

.footer-btn:hover i {
  transform: translateY(-2px);
}

.footer-btn.active {
  color: var(--primary);
}

.footer-btn.active i {
  transform: translateY(-2px);
  filter: drop-shadow(0 4px 8px rgba(0, 55, 255, 0.25));
}

.footer-btn.active::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 30%;
  right: 30%;
  height: 3px;
  background: var(--primary-gradient);
  border-radius: 0 0 4px 4px;
}

/* حالت اکتیو با دایره پشت آیکون */
.footer-btn.active .btn-content {
  position: relative;
}

.footer-btn.active .btn-content::after {
  content: '';
  position: absolute;
  inset: -4px -8px;
  background: var(--primary-light);
  border-radius: var(--radius-sm);
  z-index: -1;
}
</style>