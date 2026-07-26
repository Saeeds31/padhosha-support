<template>
  <div class="dashboard-page">
    <!-- Header خوش‌آمدگویی -->
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">داشبورد</h1>
        <p class="page-subtitle">خلاصه وضعیت همکاری و مالی شما</p>
      </div>
      <div class="header-actions">
        <span class="date-badge">
          <i class="bi bi-calendar3"></i>
          {{ currentDate }}
        </span>
      </div>
    </div>

    <!-- کارت‌های آماری -->
    <div class="stats-grid">
      <!-- کارت همکاری -->
      <div class="stat-card">
        <div class="stat-card-icon" style="background: var(--primary-gradient)">
          <i class="bi bi-handshake"></i>
        </div>
        <div class="stat-card-content">
          <span class="stat-label">استارت همکاری</span>
          <span class="stat-value">{{ startDate }}</span>
          <span class="stat-sub">با افتخار در کنار شما</span>
        </div>
      </div>

      <!-- کارت انقضا -->
      <div class="stat-card" :class="{ 'expired': !dashboard.active }">
        <div class="stat-card-icon" :style="{ background: dashboard.active ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #ef4444, #f87171)' }">
          <i class="bi bi-calendar-check"></i>
        </div>
        <div class="stat-card-content">
          <span class="stat-label">انقضاء پشتیبانی</span>
          <span class="stat-value">{{ expirationDate }}</span>
          <span class="stat-sub" :class="{ 'text-danger': !dashboard.active, 'text-success': dashboard.active }">
            {{ dashboard.active ? '✅ فعال' : '❌ منقضی شده' }}
          </span>
        </div>
      </div>

      <!-- کارت سطح -->
      <div class="stat-card">
        <div class="stat-card-icon" style="background: linear-gradient(135deg, #8b5cf6, #a78bfa)">
          <i class="bi bi-award"></i>
        </div>
        <div class="stat-card-content">
          <span class="stat-label">سطح همکاری</span>
          <span class="stat-value">{{ levelLabel }}</span>
          <span class="stat-sub">{{ levelDesc }}</span>
        </div>
      </div>

      <!-- کارت بدهی -->
      <div class="stat-card">
        <div class="stat-card-icon" style="background: linear-gradient(135deg, #ef4444, #f87171)">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <div class="stat-card-content">
          <span class="stat-label">میزان بدهی</span>
          <span class="stat-value text-danger">{{ formatCurrency(dashboard.totalDebt) }}</span>
          <span class="stat-sub">آخرین بروزرسانی: امروز</span>
        </div>
      </div>

      <!-- کارت کل پرداختی -->
      <div class="stat-card">
        <div class="stat-card-icon" style="background: linear-gradient(135deg, #10b981, #34d399)">
          <i class="bi bi-coins"></i>
        </div>
        <div class="stat-card-content">
          <span class="stat-label">کل پرداختی</span>
          <span class="stat-value text-success">{{ formatCurrency(dashboard.totalPay) }}</span>
          <span class="stat-sub">از ابتدای همکاری</span>
        </div>
      </div>

      <!-- کارت پرداختی ماه -->
      <div class="stat-card">
        <div class="stat-card-icon" style="background: linear-gradient(135deg, #f59e0b, #fbbf24)">
          <i class="bi bi-calendar2-week"></i>
        </div>
        <div class="stat-card-content">
          <span class="stat-label">پرداختی این ماه</span>
          <span class="stat-value text-warning">{{ formatCurrency(dashboard.totalMonth) }}</span>
          <span class="stat-sub">ماه جاری</span>
        </div>
      </div>
    </div>

    <!-- بخش تیکت‌ها -->
    <div class="ticket-section">
      <div class="section-header">
        <h3><i class="bi bi-ticket-detailed"></i> وضعیت تیکت‌ها</h3>
        <router-link to="/ticket" class="view-all">مشاهده همه <i class="bi bi-chevron-left"></i></router-link>
      </div>
      <div class="ticket-stats">
        <div class="ticket-stat">
          <span class="ticket-number">{{ dashboard.ticket?.totalTicket || 0 }}</span>
          <span class="ticket-label">کل تیکت‌ها</span>
        </div>
        <div class="ticket-stat">
          <span class="ticket-number" style="color: #f59e0b">{{ dashboard.ticket?.openTicket || 0 }}</span>
          <span class="ticket-label">باز</span>
        </div>
        <div class="ticket-stat">
          <span class="ticket-number" style="color: #10b981">{{ dashboard.ticket?.closeTicket || 0 }}</span>
          <span class="ticket-label">بسته شده</span>
        </div>
        <div class="ticket-stat">
          <span class="ticket-number" style="color: #8b5cf6">{{ dashboard.ticket?.totalTicket || 0 }}</span>
          <span class="ticket-label">در حال پیگیری</span>
        </div>
      </div>
    </div>

    <!-- اقدامات سریع -->
    <div class="quick-actions">
      <h3 class="section-title"><i class="bi bi-lightning-fill"></i> اقدامات سریع</h3>
      <div class="actions-grid">
        <router-link to="/ticket/add" class="action-btn">
          <i class="bi bi-plus-circle"></i>
          <span>تیکت جدید</span>
        </router-link>
        <router-link to="/deposit" class="action-btn">
          <i class="bi bi-wallet"></i>
          <span>پرداخت</span>
        </router-link>
        <router-link to="/cost" class="action-btn">
          <i class="bi bi-receipt"></i>
          <span>مشاهده هزینه‌ها</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { useAdmin } from '@/stores/modules/admin';
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const store = useAdmin();
const router = useRouter();
const dashboard = ref({});

const currentDate = computed(() => {
  return new Date().toLocaleDateString('fa-IR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

const startDate = computed(() => {
  if (dashboard.value.subscription?.start_date) {
    return new Date(dashboard.value.subscription.start_date).toLocaleDateString('fa-IR');
  }
  return 'وارد نشده';
});

const expirationDate = computed(() => {
  if (dashboard.value.subscription?.expiration_date) {
    return new Date(dashboard.value.subscription.expiration_date).toLocaleDateString('fa-IR');
  }
  return 'وارد نشده';
});

const levelLabel = computed(() => {
  const levels = {
    bronze: '🥉 برنز',
    silver: '🥈 نقره‌ای',
    gold: '🥇 طلا',
    diamond: '💎 الماس'
  };
  const level = dashboard.value.subscription?.level_type || 'bronze';
  return levels[level] || 'برنز';
});

const levelDesc = computed(() => {
  const descs = {
    bronze: 'سطح پایه',
    silver: 'سطح متوسط',
    gold: 'سطح پیشرفته',
    diamond: 'سطح ویژه'
  };
  const level = dashboard.value.subscription?.level_type || 'bronze';
  return descs[level] || 'سطح پایه';
});

function formatCurrency(value) {
  if (value == null) return "-";
  return value.toLocaleString("fa-IR") + " تومان";
}

onMounted(async () => {
  try {
    const { data } = await axios.get("/dashboard");
    dashboard.value = data;
    
    if (!dashboard.value.active) {
      Swal.fire({
        icon: 'warning',
        title: 'پشتیبانی منقضی شده',
        text: 'تاریخ پشتیبانی شما به انتها رسیده است، لطفاً با پشتیبانی تماس بگیرید.',
        confirmButtonColor: '#0037ff',
      });
      router.push('/login');
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
});
</script>

<style scoped>
.dashboard-page {
  direction: rtl;
}

/* ===== Header ===== */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #8888aa;
  margin: 0;
}

.date-badge {
  background: white;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: #4a4a6a;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.date-badge i {
  color: var(--primary);
}

/* ===== Stats Grid ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: white;
  border-radius: var(--radius);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
  border: 1px solid rgba(0, 55, 255, 0.04);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-card.expired {
  border-color: #fca5a5;
  background: #fef2f2;
}

.stat-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-card-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #8888aa;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: block;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  display: block;
  margin: 2px 0;
}

.stat-sub {
  font-size: 11px;
  color: #aaa;
}

.text-success { color: #10b981 !important; }
.text-danger { color: #ef4444 !important; }
.text-warning { color: #f59e0b !important; }

/* ===== Ticket Section ===== */
.ticket-section {
  background: white;
  border-radius: var(--radius);
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 28px;
  border: 1px solid rgba(0, 55, 255, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-all {
  font-size: 13px;
  color: var(--primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.ticket-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.ticket-stat {
  background: #f8faff;
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  text-align: center;
}

.ticket-number {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  display: block;
}

.ticket-label {
  font-size: 12px;
  color: #8888aa;
}

/* ===== Quick Actions ===== */
.quick-actions {
  margin-top: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.action-btn {
  background: white;
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #4a4a6a;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
  border: 1px solid rgba(0, 55, 255, 0.04);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  color: var(--primary);
  border-color: var(--primary);
}

.action-btn i {
  font-size: 24px;
  color: var(--primary);
}

.action-btn span {
  font-size: 13px;
  font-weight: 500;
}

/* ===== Responsive ===== */
@media (max-width: 576px) {
  .dashboard-header {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .stat-card {
    padding: 14px 16px;
  }
  
  .ticket-stats {
    grid-template-columns: 1fr 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .page-title {
    font-size: 20px;
  }
}

@media (max-width: 400px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>