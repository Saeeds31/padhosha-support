<template>
    <div class="mobile-footer">
        <b-button class="footer-btn" :class="{ active: isActive('/dashboard') }" variant="link"
            @click="go('/dashboard')">
            <i class="bi bi-house-door-fill"></i>
            <span>خانه</span>
        </b-button>

        <b-button class="footer-btn" :class="{ active: isActive('/ticket') }" variant="link" @click="go('/ticket')">
            <i class="bi bi-chat-dots-fill"></i>
            <span>تیکت</span>
        </b-button>

        <b-button class="footer-btn" :class="{ active: isActive('/deposit') }" variant="link" @click="go('/deposit')">
            <i class="bi bi-wallet2"></i>
            <span>پرداختی‌ها</span>
        </b-button>

        <b-button class="footer-btn" :class="{ active: isActive('/cost') }" variant="link" @click="go('/cost')">
            <i class="bi bi-cash-stack"></i>
            <span>هزینه‌ها</span>
        </b-button>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isActive = (path) => route.path === path
const go = (path) => router.push(path)
</script>

<style >
/* فقط موبایل */
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

    /* تم تیره */
    background: linear-gradient(135deg, #0f172a, #111827);
    border-top: 1px solid rgba(255, 255, 255, 0.08);

    /* برای فضای داخلی */
    padding: 10px 10px calc(10px + env(safe-area-inset-bottom));
    display: grid;
    grid-template-columns: repeat(4, 1fr);

    /* حس اپ‌مانند */
    backdrop-filter: blur(10px);
    box-shadow: 0 -12px 30px rgba(0, 0, 0, 0.35);
}

/* دکمه‌ها */
.footer-btn {

    text-decoration: none;
    padding: 12px 6px;
    border-radius: 16px;
    margin: 0 4px;
    text-decoration: none !important;
    color: rgba(255, 255, 255, 0.78) !important;
    transition: transform 180ms ease, background-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
}

.btn-content {
    display: flex !important;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;

    gap: 6px;
}

.footer-btn i {
    font-size: 1.35rem;
    line-height: 1;
    transition: color 180ms ease, transform 180ms ease;
}

.footer-btn span {
    font-size: 0.78rem;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* هاور */
.footer-btn:hover {
    background-color: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
    color: rgba(255, 255, 255, 0.95) !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.footer-btn:hover i {
    transform: translateY(-1px);
    color: #8b5cf6;
    /* بنفش نئونی ملایم */
}

/* اکتیو */
.footer-btn.active {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(16, 185, 129, 0.15));
    color: #fff !important;

    /* حاشیه نرم */
    box-shadow:
        0 0 0 1px rgba(139, 92, 246, 0.45),
        0 10px 28px rgba(139, 92, 246, 0.18);
}

.footer-btn.active i {
    color: #c4b5fd;
    /* روشن‌ترِ تم بنفش */
    transform: translateY(-1px);
}

/* حذف focus outline خیلی تند (در صورت نیاز) */
.footer-btn:focus {
    box-shadow: none !important;
}
</style>