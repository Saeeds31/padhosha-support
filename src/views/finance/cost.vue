<template>
  <div class="cost-page">
    <!-- هدر صفحه -->
    <div class="page-header">
      <div>
        <h1 class="page-title">هزینه‌ها</h1>
        <p class="page-subtitle">مدیریت و مشاهده هزینه‌های شما</p>
      </div>
      <div class="total-debt-badge">
        <span class="debt-label">جمع کل بدهی</span>
        <span class="debt-amount">{{ formatCurrency(Number(mainData.total)) }}</span>
        <span class="debt-currency">تومان</span>
      </div>
    </div>

    <!-- کارت فیلتر -->
    <div class="filter-card">
      <div class="filter-header">
        <i class="bi bi-funnel-fill"></i>
        <span>فیلتر اطلاعات</span>
        <button class="filter-toggle" @click="showFilter = !showFilter">
          <i :class="showFilter ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
      </div>
      
      <transition name="slide-down">
        <div v-if="showFilter" class="filter-body">
          <form @submit.prevent="applyFilters()">
            <div class="filter-grid">
              <div class="filter-group">
                <label for="filter-cost">
                  <i class="bi bi-coin"></i>
                  مبلغ (حداقل)
                </label>
                <input 
                  type="number" 
                  class="filter-input" 
                  id="filter-cost" 
                  v-model.number="filters.amount"
                  placeholder="مبلغ را وارد کنید"
                />
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
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-search"></i>
                اعمال فیلتر
              </button>
              <button type="button" class="btn btn-outline" @click="resetFilters">
                <i class="bi bi-arrow-counterclockwise"></i>
                حذف فیلتر
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>

    <!-- جدول اطلاعات -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-title">
          <i class="bi bi-table"></i>
          <span>لیست هزینه‌ها</span>
          <span class="record-count">{{ mainData.data?.total || 0 }} رکورد</span>
        </div>
        
        <!-- صفحه‌بندی -->
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
        <!-- دسکتاپ: نمایش جدول -->
        <div class="table-responsive d-none d-md-block">
          <table class="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>عنوان</th>
                <th>مبلغ</th>
                <th>توضیحات</th>
                <th>تاریخ</th>
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
                  <span class="item-amount">{{ formatCurrency(item.amount) }}</span>
                  <span class="currency-unit">تومان</span>
                </td>
                <td>
                  <span class="item-desc">{{ item.description || '—' }}</span>
                </td>
                <td>
                  <span class="item-date">
                    <i class="bi bi-calendar2"></i>
                    {{ new Date(item.created_at).toLocaleDateString('fa') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- موبایل: نمایش کارتی -->
        <div class="mobile-list d-md-none">
          <div v-for="(item, index) in mainData.data.data" :key="index" class="mobile-item">
            <div class="mobile-item-header">
              <span class="mobile-item-id">#{{ item.id }}</span>
              <span class="mobile-item-title">{{ item.title }}</span>
            </div>
            <div class="mobile-item-body">
              <div class="mobile-item-row">
                <span class="mobile-item-label">مبلغ:</span>
                <span class="mobile-item-value amount">{{ formatCurrency(item.amount) }} تومان</span>
              </div>
              <div class="mobile-item-row" v-if="item.description">
                <span class="mobile-item-label">توضیحات:</span>
                <span class="mobile-item-value">{{ item.description }}</span>
              </div>
              <div class="mobile-item-row">
                <span class="mobile-item-label">تاریخ:</span>
                <span class="mobile-item-value">
                  <i class="bi bi-calendar2"></i>
                  {{ new Date(item.created_at).toLocaleDateString('fa') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- وضعیت خالی -->
        <div v-if="!mainData.data?.data?.length" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>هیچ هزینه‌ای یافت نشد</p>
          <span>با اعمال فیلترهای مختلف جستجو کنید</span>
        </div>
      </div>

      <!-- صفحه‌بندی پایین (موبایل) -->
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
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const showFilter = ref(true);

const filters = reactive({
  amount: '',
  dateFrom: '',
  dateTo: '',
});

const mainData = ref({});

const applyFilters = (page) => {
  const query = {
    amount: filters.amount || undefined,
    dateTo: filters.dateTo || undefined,
    dateFrom: filters.dateFrom || undefined,
    page: page ?? 1
  };
  
  // حذف کلیدهای خالی
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
};

const changePage = (selectedPage) => {
  if (selectedPage) {
    applyFilters(selectedPage);
  } else {
    getData({});
  }
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number' && isNaN(amount)) return '۰';
  return Number(amount).toLocaleString('fa-IR');
};

async function getData(query = {}) {
  try {
    const { data } = await axios.get('/cost', {
      params: { ...query }
    });
    mainData.value = data;
  } catch (error) {
    console.error('Error fetching costs:', error);
  }
}

function resetFilters() {
  filters.amount = null;
  filters.dateFrom = '';
  filters.dateTo = '';
  router.replace({ name: route.name });
  getData({});
}

onMounted(() => {
  // همگام‌سازی فیلترها با query
  if (route.query.amount) filters.amount = route.query.amount;
  if (route.query.dateFrom) filters.dateFrom = route.query.dateFrom;
  if (route.query.dateTo) filters.dateTo = route.query.dateTo;
  getData(route.query);
});
</script>

<style scoped>
/* ===== Page ===== */
.cost-page {
  direction: rtl;
}

/* ===== Header ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.total-debt-badge {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fca5a5;
  border-radius: var(--radius);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.debt-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.debt-amount {
  font-size: 22px;
  font-weight: 700;
  color: #dc2626;
}

.debt-currency {
  font-size: 13px;
  color: #6b7280;
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

/* ===== Filter Body ===== */
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

.filter-input {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.25s ease;
  background: #f8fafc;
  font-family: inherit;
  width: 100%;
}

.filter-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 55, 255, 0.08);
  outline: none;
  background: white;
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 22px;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}

.btn-primary {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 16px rgba(0, 55, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 55, 255, 0.3);
}

.btn-outline {
  background: transparent;
  color: #4a4a6a;
  border: 1.5px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* ===== Table Card ===== */
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

.table-body {
  padding: 0;
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

.item-amount {
  font-weight: 600;
  color: #dc2626;
}

.currency-unit {
  font-size: 11px;
  color: #8888aa;
  margin-right: 4px;
}

.item-desc {
  color: #6b7280;
  font-size: 13px;
}

.item-date {
  color: #6b7280;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-date i {
  font-size: 14px;
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

.mobile-item:active {
  transform: scale(0.98);
}

.mobile-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  padding-bottom: 8px;
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
  gap: 4px;
}

.mobile-item-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.mobile-item-label {
  color: #8888aa;
}

.mobile-item-value {
  color: #1a1a2e;
  font-weight: 500;
}

.mobile-item-value.amount {
  color: #dc2626;
}

.mobile-item-value i {
  margin-left: 4px;
  color: #8888aa;
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
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }
  
  .total-debt-badge {
    width: 100%;
    justify-content: center;
  }
  
  .debt-amount {
    font-size: 18px;
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
}

@media (max-width: 576px) {
  .page-title {
    font-size: 20px;
  }
  
  .filter-header {
    padding: 12px 16px;
  }
  
  .filter-body {
    padding: 16px;
  }
  
  .mobile-item {
    padding: 12px 14px;
  }
}
</style>