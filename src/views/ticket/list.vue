<template>
  <div class="ticket-page">
    <!-- هدر صفحه -->
    <div class="page-header">
      <div>
        <h1 class="page-title">تیکت‌ها</h1>
        <p class="page-subtitle">مدیریت و پیگیری تیکت‌های پشتیبانی</p>
      </div>
      <router-link to="/ticket/add" class="btn btn-primary btn-add">
        <i class="bi bi-plus-circle"></i>
        تیکت جدید
      </router-link>
    </div>

    <!-- کارت آمار -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--primary-gradient)">
          <i class="bi bi-ticket-fill"></i>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ mainData.data?.total || 0 }}</span>
          <span class="stat-label">کل تیکت‌ها</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #fbbf24)">
          <i class="bi bi-exclamation-circle-fill"></i>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ mainData.openedTotal || 0 }}</span>
          <span class="stat-label">تیکت‌های باز</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #34d399)">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ mainData.closedTotal || 0 }}</span>
          <span class="stat-label">تیکت‌های بسته</span>
        </div>
      </div>
    </div>

    <!-- کارت فیلتر -->
    <div class="filter-card">
      <div class="filter-header" @click="showFilter = !showFilter">
        <i class="bi bi-funnel-fill"></i>
        <span>فیلتر تیکت‌ها</span>
        <span class="filter-badge" v-if="hasActiveFilter">فعال</span>
        <button class="filter-toggle">
          <i :class="showFilter ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
      </div>
      
      <transition name="slide-down">
        <div v-if="showFilter" class="filter-body">
          <form @submit.prevent="applyFilters()">
            <div class="filter-grid">
              <div class="filter-group">
                <label for="filter-status">
                  <i class="bi bi-tag"></i>
                  وضعیت
                </label>
                <select class="filter-select" id="filter-status" v-model="filters.status">
                  <option value="">همه</option>
                  <option value="pending">در انتظار بررسی</option>
                  <option value="answered">پاسخ داده شده</option>
                  <option value="awaiting_response">در انتظار پاسخ</option>
                  <option value="awaiting_payment">در انتظار پرداخت</option>
                  <option value="referred">ارجاع شده</option>
                  <option value="closed">بسته شده</option>
                </select>
              </div>
              
              <div class="filter-group">
                <label for="filter-date-from">
                  <i class="bi bi-calendar3"></i>
                  از تاریخ
                </label>
                <date-picker 
                  id="filter-date-from"
                  display-format="jYYYY/jMM/jDD" 
                  placeholder="از تاریخ" 
                  format="YYYY-MM-DD"
                  v-model="filters.dateFrom"
                  class="date-picker-custom"
                />
              </div>
              
              <div class="filter-group">
                <label for="filter-date-to">
                  <i class="bi bi-calendar3"></i>
                  تا تاریخ
                </label>
                <date-picker 
                  id="filter-date-to"
                  display-format="jYYYY/jMM/jDD" 
                  placeholder="تا تاریخ" 
                  format="YYYY-MM-DD"
                  v-model="filters.dateTo"
                  class="date-picker-custom"
                />
              </div>
            </div>
            
            <div class="filter-actions">
              <button type="submit" class="btn btn-primary" :disabled="loader">
                <i class="bi bi-search"></i>
                اعمال فیلتر
              </button>
              <button type="button" class="btn btn-outline" @click="resetFilters" :disabled="loader">
                <i class="bi bi-arrow-counterclockwise"></i>
                حذف فیلتر
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>

    <!-- جدول تیکت‌ها -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-title">
          <i class="bi bi-list-ul"></i>
          <span>لیست تیکت‌ها</span>
          <span class="record-count">{{ mainData.data?.total || 0 }} رکورد</span>
        </div>
        
        <b-pagination 
          v-if="mainData.data" 
          v-model="mainData.data.current_page" 
          :total-rows="mainData.data.total"
          :per-page="mainData.data.per_page" 
          @Update:modelValue="changePage" 
          align="center"
          class="custom-pagination"
          size="sm"
        />
      </div>

      <div v-if="mainData.data" class="table-body">
        <!-- دسکتاپ -->
        <div class="table-responsive d-none d-md-block">
          <table class="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>موضوع</th>
                <th>وضعیت</th>
                <th>تاریخ</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in mainData.data.data" :key="index">
                <td>
                  <span class="id-badge">#{{ item.id }}</span>
                </td>
                <td>
                  <span class="item-title">{{ item.title }}</span>
                </td>
                <td>
                  <span :class="['status-badge', getStatusBadgeClass(item.status)]">
                    <span class="status-dot"></span>
                    {{ translater(item.status) }}
                  </span>
                </td>
                <td>
                  <span class="item-date">
                    <i class="bi bi-calendar2"></i>
                    {{ new Date(item.created_at).toLocaleDateString('fa') }}
                  </span>
                </td>
                <td>
                  <router-link :to="`/ticket/${item.id}`" class="btn-view">
                    <i class="bi bi-eye"></i>
                    مشاهده
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- موبایل -->
        <div class="mobile-list d-md-none">
          <div v-for="(item, index) in mainData.data.data" :key="index" class="mobile-item">
            <div class="mobile-item-header">
              <span class="mobile-item-id">#{{ item.id }}</span>
              <span class="mobile-item-title">{{ item.title }}</span>
            </div>
            <div class="mobile-item-body">
              <div class="mobile-item-row">
                <span class="mobile-item-label">وضعیت:</span>
                <span :class="['status-badge', 'mobile-status', getStatusBadgeClass(item.status)]">
                  {{ translater(item.status) }}
                </span>
              </div>
              <div class="mobile-item-row">
                <span class="mobile-item-label">تاریخ:</span>
                <span class="mobile-item-value">
                  <i class="bi bi-calendar2"></i>
                  {{ new Date(item.created_at).toLocaleDateString('fa') }}
                </span>
              </div>
              <div class="mobile-item-actions">
                <router-link :to="`/ticket/${item.id}`" class="btn-view">
                  <i class="bi bi-eye"></i>
                  مشاهده جزئیات
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- وضعیت خالی -->
        <div v-if="!mainData.data?.data?.length" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>هیچ تیکتی یافت نشد</p>
          <span>با ایجاد یک تیکت جدید شروع کنید</span>
          <router-link to="/ticket/add" class="btn btn-primary btn-empty">
            <i class="bi bi-plus-circle"></i>
            ایجاد تیکت جدید
          </router-link>
        </div>
      </div>

      <div class="table-footer d-md-none">
        <b-pagination 
          v-if="mainData.data" 
          v-model="mainData.data.current_page" 
          :total-rows="mainData.data.total"
          :per-page="mainData.data.per_page" 
          @Update:modelValue="changePage" 
          align="center"
          class="custom-pagination"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const showFilter = ref(true);
const loader = ref(false);

const filters = reactive({
  dateFrom: '',
  status: '',
  dateTo: '',
});

const mainData = ref({});

// ===== Computed =====
const hasActiveFilter = computed(() => {
  return filters.status || filters.dateFrom || filters.dateTo;
});

// ===== Methods =====
function getStatusBadgeClass(status) {
  switch (status) {
    case 'answered': return 'status-answered';
    case 'closed': return 'status-closed';
    case 'pending': return 'status-pending';
    case 'awaiting_payment': return 'status-payment';
    case 'awaiting_response': return 'status-response';
    case 'referred': return 'status-referred';
    default: return 'status-default';
  }
}

function translater(status) {
  switch (status) {
    case 'answered': return 'پاسخ داده شده';
    case 'closed': return 'بسته شده';
    case 'pending': return 'در انتظار بررسی';
    case 'awaiting_payment': return 'در انتظار پرداخت';
    case 'awaiting_response': return 'در انتظار پاسخ';
    case 'referred': return 'ارجاع شده';
    default: return 'نامشخص';
  }
}

function changePage(selectedPage) {
  if (selectedPage) {
    applyFilters(selectedPage);
  } else {
    getData({});
  }
}

async function getData(query = {}) {
  loader.value = true;
  try {
    const { data } = await axios.get('/tickets', {
      params: { ...query }
    });
    mainData.value = data;
  } catch (error) {
    console.error('Error fetching tickets:', error);
  } finally {
    loader.value = false;
  }
}

function applyFilters(page) {
  const query = {
    status: filters.status || undefined,
    dateTo: filters.dateTo || undefined,
    dateFrom: filters.dateFrom || undefined,
    page: page ?? 1
  };
  
  Object.keys(query).forEach(key => {
    if (query[key] === undefined || query[key] === '') {
      delete query[key];
    }
  });
  
  router.replace({ 
    name: route.name, 
    query 
  });
  getData(query);
}

function resetFilters() {
  filters.dateFrom = '';
  filters.dateTo = '';
  filters.status = '';
  router.replace({ name: route.name });
  getData({});
}

onMounted(() => {
  // همگام‌سازی فیلترها با query
  if (route.query.status) filters.status = route.query.status;
  if (route.query.dateFrom) filters.dateFrom = route.query.dateFrom;
  if (route.query.dateTo) filters.dateTo = route.query.dateTo;
  getData(route.query);
});
</script>

<style scoped>
/* ===== Page ===== */
.ticket-page {
  direction: rtl;
}

/* ===== Header ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
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

.btn-add {
  background: var(--primary-gradient);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0, 55, 255, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
  text-decoration: none;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 55, 255, 0.3);
  color: white;
  text-decoration: none;
}

/* ===== Stats Grid ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: var(--radius);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 55, 255, 0.04);
  transition: all 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
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

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  display: block;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #8888aa;
  font-weight: 500;
}

/* ===== Filter Card ===== */
.filter-card {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 55, 255, 0.04);
  margin-bottom: 24px;
  overflow: hidden;
}

.filter-header {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  background: #fafbfc;
  border-bottom: 1px solid rgba(0, 55, 255, 0.04);
}

.filter-header i:first-child {
  color: var(--primary);
  font-size: 18px;
}

.filter-header span {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a2e;
  flex: 1;
}

.filter-badge {
  font-size: 10px;
  font-weight: 700;
  background: var(--primary);
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  text-transform: uppercase;
}

.filter-toggle {
  background: none;
  border: none;
  color: #8888aa;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.filter-toggle:hover {
  background: #f0f2f7;
  color: #1a1a2e;
}

.filter-body {
  padding: 20px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 500;
  color: #4a4a6a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-group label i {
  color: var(--primary);
}

.filter-input,
.filter-select {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.25s ease;
  background: #f8fafc;
  font-family: inherit;
  width: 100%;
  color: #1a1a2e;
}

.filter-input:focus,
.filter-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 55, 255, 0.08);
  outline: none;
  background: white;
}

.filter-select {
  appearance: auto;
  cursor: pointer;
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* ===== Table ===== */
.table-card {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 55, 255, 0.04);
  overflow: hidden;
}

.table-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 55, 255, 0.04);
  flex-wrap: wrap;
  gap: 12px;
  background: #fafbfc;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 15px;
  color: #1a1a2e;
}

.table-title i {
  color: var(--primary);
  font-size: 18px;
}

.record-count {
  font-size: 12px;
  font-weight: 400;
  color: #8888aa;
  background: #f0f2f7;
  padding: 2px 10px;
  border-radius: 12px;
}

/* ===== Custom Table ===== */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.custom-table thead th {
  padding: 12px 16px;
  text-align: right;
  font-weight: 600;
  color: #4a4a6a;
  background: #f8faff;
  border-bottom: 2px solid rgba(0, 55, 255, 0.06);
  font-size: 13px;
}

.custom-table tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 55, 255, 0.04);
  color: #1a1a2e;
  vertical-align: middle;
}

.custom-table tbody tr:hover {
  background: #f8faff;
}

.id-badge {
  background: #f0f2f7;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #4a4a6a;
}

.item-title {
  font-weight: 500;
}

.item-date {
  color: #6b7280;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.btn-view {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  background: var(--primary-light);
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-view:hover {
  background: var(--primary);
  color: white;
  text-decoration: none;
}

/* ===== Status Badges ===== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

/* وضعیت‌های مختلف */
.status-answered {
  background: #dbeafe;
  color: #1e40af;
}
.status-answered .status-dot {
  background: #3b82f6;
}

.status-closed {
  background: #f0f2f7;
  color: #4a4a6a;
}
.status-closed .status-dot {
  background: #8888aa;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}
.status-pending .status-dot {
  background: #f59e0b;
}

.status-payment {
  background: #fee2e2;
  color: #991b1b;
}
.status-payment .status-dot {
  background: #ef4444;
}

.status-response {
  background: #fce4ec;
  color: #9a1f3e;
}
.status-response .status-dot {
  background: #e91e63;
}

.status-referred {
  background: #e8e0f0;
  color: #5b3a7a;
}
.status-referred .status-dot {
  background: #8b5cf6;
}

.status-default {
  background: #f0f2f7;
  color: #4a4a6a;
}
.status-default .status-dot {
  background: #8888aa;
}

/* ===== Mobile List ===== */
.mobile-list {
  padding: 12px;
}

.mobile-item {
  background: #f8faff;
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  margin-bottom: 10px;
  border: 1px solid rgba(0, 55, 255, 0.04);
  transition: all 0.2s;
}

.mobile-item:last-child {
  margin-bottom: 0;
}

.mobile-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 55, 255, 0.04);
}

.mobile-item-id {
  font-size: 12px;
  color: #8888aa;
  font-weight: 600;
}

.mobile-item-title {
  font-weight: 600;
  color: #1a1a2e;
  flex: 1;
}

.mobile-item-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.mobile-item-label {
  color: #8888aa;
}

.mobile-item-value {
  color: #1a1a2e;
  font-weight: 500;
}

.mobile-item-value i {
  margin-left: 4px;
  color: #8888aa;
}

.mobile-status {
  font-size: 11px;
  padding: 2px 10px;
}

.mobile-item-actions {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 55, 255, 0.04);
}

.mobile-item-actions .btn-view {
  width: 100%;
  justify-content: center;
}

/* ===== Empty State ===== */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: #8888aa;
}

.empty-state i {
  font-size: 48px;
  color: #d1d5db;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 16px;
  font-weight: 500;
  color: #4a4a6a;
  margin: 0;
}

.empty-state span {
  font-size: 13px;
  display: block;
  margin-bottom: 16px;
}

.btn-empty {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
  font-family: inherit;
}

.btn-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 55, 255, 0.3);
  color: white;
  text-decoration: none;
}

/* ===== Pagination ===== */
.custom-pagination {
  margin: 0;
}

.custom-pagination :deep(.page-item.active .page-link) {
  background: var(--primary-gradient) !important;
  border-color: var(--primary) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(0, 55, 255, 0.25);
}

.custom-pagination :deep(.page-link) {
  border: none !important;
  color: #4a4a6a !important;
  border-radius: 8px !important;
  margin: 0 2px !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
  background: transparent !important;
}

.custom-pagination :deep(.page-link:hover) {
  background: #f0f2f7 !important;
  color: var(--primary) !important;
}

.table-footer {
  padding: 12px;
  border-top: 1px solid rgba(0, 55, 255, 0.04);
}

/* ===== Buttons ===== */
.btn {
  padding: 10px 22px;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 16px rgba(0, 55, 255, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 55, 255, 0.3);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-outline {
  background: transparent;
  color: #4a4a6a;
  border: 1.5px solid #e2e8f0;
}

.btn-outline:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== Animations ===== */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

.slide-down-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

/* ===== Responsive ===== */
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-add {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
  }
  
  .filter-actions .btn {
    width: 100%;
    justify-content: center;
  }
  
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-title {
    justify-content: center;
  }
  
  .page-title {
    font-size: 20px;
  }
}

@media (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 14px 16px;
  }
  
  .stat-number {
    font-size: 18px;
  }
}
</style>