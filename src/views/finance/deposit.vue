<template>
  <div class="deposit-page">
    <!-- هدر صفحه -->
    <div class="page-header">
      <div>
        <h1 class="page-title">پرداختی‌ها</h1>
        <p class="page-subtitle">مدیریت و مشاهده پرداخت‌های شما</p>
      </div>
      <div class="header-actions">
        <div class="total-badge">
          <span class="total-label">جمع کل پرداختی</span>
          <span class="total-amount">{{ formatCurrency(Number(mainData.total)) }}</span>
          <span class="total-currency">تومان</span>
        </div>
        <button class="btn btn-primary btn-add" @click="showAddReceiptModal = true">
          <i class="bi bi-plus-circle"></i>
          افزودن رسید
        </button>
      </div>
    </div>

    <!-- کارت فیلتر -->
    <div class="filter-card">
      <div class="filter-header" @click="showFilter = !showFilter">
        <i class="bi bi-funnel-fill"></i>
        <span>فیلتر اطلاعات</span>
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
                <label for="filter-amount">
                  <i class="bi bi-coin"></i>
                  مبلغ (حداقل)
                </label>
                <input type="number" class="filter-input" id="filter-amount" v-model.number="filters.amount"
                  placeholder="مبلغ را وارد کنید" />
              </div>

              <div class="filter-group">
                <label for="filter-date-from">
                  <i class="bi bi-calendar3"></i>
                  از تاریخ
                </label>
                <date-picker id="filter-date-from" display-format="jYYYY/jMM/jDD" placeholder="از تاریخ"
                  format="YYYY-MM-DD" v-model="filters.dateFrom" class="date-picker-custom" />
              </div>

              <div class="filter-group">
                <label for="filter-date-to">
                  <i class="bi bi-calendar3"></i>
                  تا تاریخ
                </label>
                <date-picker id="filter-date-to" display-format="jYYYY/jMM/jDD" placeholder="تا تاریخ"
                  format="YYYY-MM-DD" v-model="filters.dateTo" class="date-picker-custom" />
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

    <!-- جدول اطلاعات -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-title">
          <i class="bi bi-table"></i>
          <span>لیست پرداخت‌ها</span>
          <span class="record-count">{{ mainData.data?.total || 0 }} رکورد</span>
        </div>

        <b-pagination v-if="mainData.data" v-model="mainData.data.current_page" :total-rows="mainData.data.total"
          :per-page="mainData.data.per_page" @Update:modelValue="changePage" align="center" class="custom-pagination"
          size="sm" />
      </div>

      <div v-if="mainData.data" class="table-body">
        <!-- دسکتاپ -->
        <div class="table-responsive d-none d-md-block">
          <table class="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>عنوان</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
                <th>توضیحات</th>
                <th>یادداشت ادمین</th>
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
                  <span :class="['status-badge', getStatusClass(item.status)]">
                    <span class="status-dot"></span>
                    {{ translater(item.status) }}
                  </span>
                </td>
                <td>
                  <span class="item-desc">{{ item.description || '—' }}</span>
                </td>
                <td>
                  <span class="item-note">{{ item.admin_note || '—' }}</span>
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

        <!-- موبایل -->
        <div class="mobile-list d-md-none">
          <div v-for="(item, index) in mainData.data.data" :key="index" class="mobile-item">
            <div class="mobile-item-header">
              <span class="mobile-item-id">#{{ item.id }}</span>
              <span class="mobile-item-title">{{ item.title }}</span>
              <span :class="['status-badge', 'mobile-status', getStatusClass(item.status)]">
                {{ translater(item.status) }}
              </span>
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
              <div class="mobile-item-row" v-if="item.admin_note">
                <span class="mobile-item-label">یادداشت ادمین:</span>
                <span class="mobile-item-value note">{{ item.admin_note }}</span>
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
          <p>هیچ پرداختی یافت نشد</p>
          <span>با افزودن رسید جدید شروع کنید</span>
        </div>
      </div>

      <div class="table-footer d-md-none">
        <b-pagination v-if="mainData.data" v-model="mainData.data.current_page" :total-rows="mainData.data.total"
          :per-page="mainData.data.per_page" @Update:modelValue="changePage" align="center" class="custom-pagination"
          size="sm" />
      </div>
    </div>

    <!-- ===== مودال افزودن رسید ===== -->
    <div class="modal-overlay" v-if="showAddReceiptModal" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title-wrapper">
            <i class="bi bi-receipt-cutoff"></i>
            <h5 class="modal-title">افزودن رسید پرداخت</h5>
          </div>
          <button type="button" class="modal-close" @click="closeModal" :disabled="loader">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="submitReceipt" @keydown="clearFieldError">
            <div class="form-group">
              <label for="receipt-title">
                <i class="bi bi-pencil"></i>
                عنوان
                <span class="required">*</span>
              </label>
              <input type="text" class="form-input" id="receipt-title" v-model="newReceipt.title"
                :class="{ 'is-invalid': errors.title }" :disabled="loader" placeholder="عنوان رسید را وارد کنید"
                required />
              <small class="text-danger" v-if="errors.title">{{ errors.title[0] }}</small>
            </div>

            <div class="form-group">
              <label for="receipt-amount">
                <i class="bi bi-coin"></i>
                مبلغ
                <span class="required">*</span>
              </label>
              <div class="amount-wrapper">
                <input type="number" class="form-input" id="receipt-amount" v-model="newReceipt.amount"
                  :class="{ 'is-invalid': errors.amount }" :disabled="loader" placeholder="مبلغ را وارد کنید"
                  required />
                <span class="amount-suffix">تومان</span>
              </div>
              <small class="text-helper">{{ Number(newReceipt.amount).toLocaleString('fa') || '۰' }} تومان</small>
              <small class="text-danger" v-if="errors.amount">{{ errors.amount[0] }}</small>
            </div>

            <div class="form-group">
              <label for="receipt-description">
                <i class="bi bi-textarea"></i>
                توضیحات
              </label>
              <textarea class="form-input" id="receipt-description" v-model="newReceipt.description"
                :class="{ 'is-invalid': errors.description }" :disabled="loader" rows="3"
                placeholder="توضیحات اضافی را وارد کنید"></textarea>
              <small class="text-danger" v-if="errors.description">{{ errors.description[0] }}</small>
            </div>

            <div class="form-group">
              <label for="receipt-image">
                <i class="bi bi-image"></i>
                تصویر رسید
              </label>
              <div class="file-upload-area" :class="{ 'has-image': newReceipt.image, 'is-invalid': errors.image }"
                @click="$refs.fileInput.click()">
                <input type="file" ref="fileInput" id="receipt-image" @change="handleImageUpload" accept="image/*"
                  :disabled="loader" style="display: none" />
                <template v-if="!newReceipt.image">
                  <i class="bi bi-cloud-upload"></i>
                  <span>برای آپلود تصویر کلیک کنید</span>
                  <small>فرمت‌های مجاز: JPG, PNG, WebP</small>
                </template>
                <template v-else>
                  <i class="bi bi-check-circle-fill"></i>
                  <span>{{ newReceipt.image.name }}</span>
                  <small>{{ (newReceipt.image.size / 1024).toFixed(1) }} KB</small>
                  <button type="button" class="remove-image" @click.stop="removeImage" :disabled="loader">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </template>
              </div>
              <small class="text-danger" v-if="errors.image">{{ errors.image[0] }}</small>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="closeModal" :disabled="loader">
            <i class="bi bi-x"></i>
            بستن
          </button>
          <button type="submit" class="btn btn-primary" @click="submitReceipt" :disabled="loader || !isReceiptValid">
            <span v-if="!loader">
              <i class="bi bi-send"></i>
              ارسال رسید
            </span>
            <span v-else>
              <i class="bi bi-arrow-repeat spinner"></i>
              در حال ارسال...
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted, computed } from 'vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const showFilter = ref(true);
const showAddReceiptModal = ref(false);
const loader = ref(false);

const filters = reactive({
  amount: null,
  dateFrom: '',
  dateTo: '',
});

const errors = reactive({});
const newReceipt = reactive({
  title: '',
  description: '',
  image: null,
  amount: null,
});

const mainData = ref({});

// ===== Computed =====
const hasActiveFilter = computed(() => {
  return filters.amount || filters.dateFrom || filters.dateTo;
});

const isReceiptValid = computed(() => {
  return newReceipt.title?.trim() &&
    newReceipt.amount > 0 &&
    !loader.value;
});

// ===== Methods =====
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
    const { data } = await axios.get('/deposit', {
      params: { ...query }
    });
    mainData.value = data;
  } catch (error) {
    console.error('Error fetching deposits:', error);
    toast.error('خطا در دریافت اطلاعات');
  } finally {
    loader.value = false;
  }
}

function applyFilters(page) {
  const query = {
    amount: filters.amount || undefined,
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
  filters.amount = null;
  filters.dateFrom = '';
  filters.dateTo = '';
  router.replace({ name: route.name });
  getData({});
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('فرمت فایل مجاز نیست');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
      return;
    }
    newReceipt.image = file;
    if (errors.image) delete errors.image;
  }
}

function removeImage() {
  newReceipt.image = null;
  const fileInput = document.getElementById('receipt-image');
  if (fileInput) {
    fileInput.value = '';
  }
}

function clearFieldError(event) {
  const field = event.target?.id?.replace('receipt-', '');
  if (field && errors[field]) {
    delete errors[field];
  }
}

function closeModal() {
  if (loader.value) return;
  showAddReceiptModal.value = false;
  // ریست فرم
  Object.keys(newReceipt).forEach(key => {
    newReceipt[key] = key === 'image' ? null : '';
  });
  Object.keys(errors).forEach(key => delete errors[key]);
  const fileInput = document.getElementById('receipt-image');
  if (fileInput) {
    fileInput.value = '';
  }
}

async function submitReceipt() {
  if (!isReceiptValid.value) {
    toast.warning('لطفاً عنوان و مبلغ را وارد کنید');
    return;
  }

  const fd = new FormData();
  fd.append('title', newReceipt.title);
  fd.append('amount', newReceipt.amount);
  fd.append('description', newReceipt.description || '');
  if (newReceipt.image) {
    fd.append('image', newReceipt.image);
  }

  loader.value = true;
  Object.keys(errors).forEach(key => delete errors[key]);

  try {
    await axios.post('/receipt', fd);

    toast.success('رسید شما با موفقیت ثبت شد ✅', {
      position: 'top-right'
    });

    // به‌روزرسانی لیست
    await getData(route.query);

    // بستن مودال و ریست فرم
    closeModal();

  } catch (error) {
    if (error.response?.status === 422) {
      Object.assign(errors, error.response.data.errors);
      toast.error('خطاهای فرم را بررسی کنید ❌');

      // اسکرول به اولین خطا
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.getElementById(`receipt-${firstError}`);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }, 100);
        }
      }
    } else {
      toast.error('خطا در ثبت رسید ❌');
    }
  } finally {
    loader.value = false;
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'accepted': return 'status-success';
    case 'rejected': return 'status-danger';
    case 'pending': return 'status-warning';
    default: return 'status-secondary';
  }
}

function translater(status) {
  switch (status) {
    case 'accepted': return 'تایید شده';
    case 'rejected': return 'رد شده';
    case 'pending': return 'در انتظار';
    default: return 'نامشخص';
  }
}

function formatCurrency(amount) {
  if (typeof amount !== 'number' && isNaN(amount)) return '۰';
  return Number(amount).toLocaleString('fa-IR');
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
.deposit-page {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.total-badge {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #6ee7b7;
  border-radius: var(--radius);
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.total-label {
  font-size: 13px;
  color: #065f46;
  font-weight: 500;
}

.total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #065f46;
}

.total-currency {
  font-size: 13px;
  color: #065f46;
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
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 55, 255, 0.3);
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  white-space: nowrap;
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

.item-amount {
  font-weight: 600;
  color: #065f46;
}

.currency-unit {
  font-size: 11px;
  color: #8888aa;
  margin-right: 4px;
}

.item-desc,
.item-note {
  color: #6b7280;
  font-size: 13px;
  max-width: 120px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-date {
  color: #6b7280;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

/* ===== Status Badge ===== */
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

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-success .status-dot {
  background: #10b981;
}

.status-danger {
  background: #fee2e2;
  color: #991b1b;
}

.status-danger .status-dot {
  background: #ef4444;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.status-warning .status-dot {
  background: #f59e0b;
}

.status-secondary {
  background: #f0f2f7;
  color: #4a4a6a;
}

.status-secondary .status-dot {
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
  flex-wrap: wrap;
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

.mobile-status {
  font-size: 11px;
  padding: 2px 10px;
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
  color: #065f46;
  font-weight: 600;
}

.mobile-item-value.note {
  color: #6b7280;
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

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  padding: 16px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: var(--radius);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 55, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafbfc;
  border-radius: var(--radius) var(--radius) 0 0;
}

.modal-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title-wrapper i {
  font-size: 24px;
  color: var(--primary);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #8888aa;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.modal-close:hover:not(:disabled) {
  background: #f0f2f7;
  color: #1a1a2e;
}

.modal-close:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 55, 255, 0.06);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ===== Form ===== */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.form-group label i {
  color: var(--primary);
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.25s ease;
  background: #fafbfc;
  font-family: inherit;
  color: #1a1a2e;
}

.form-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(0, 55, 255, 0.08);
  outline: none;
  background: white;
}

.form-input:disabled {
  background: #f0f2f7;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-input.is-invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

.form-input.is-invalid:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.text-danger {
  color: #ef4444 !important;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.text-helper {
  color: #8888aa;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.amount-wrapper {
  position: relative;
}

.amount-suffix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8888aa;
  font-size: 13px;
  font-weight: 500;
}

.amount-wrapper .form-input {
  padding-left: 70px;
}

/* ===== File Upload ===== */
.file-upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: var(--radius-sm);
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #fafbfc;
  position: relative;
}

.file-upload-area:hover:not(.has-image) {
  border-color: var(--primary);
  background: #f8faff;
}

.file-upload-area.is-invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

.file-upload-area.has-image {
  border-color: #10b981;
  background: #ecfdf5;
  padding: 16px;
}

.file-upload-area i {
  font-size: 32px;
  color: var(--primary);
  display: block;
  margin-bottom: 8px;
}

.file-upload-area.has-image i {
  color: #10b981;
}

.file-upload-area span {
  display: block;
  font-size: 14px;
  color: #4a4a6a;
  font-weight: 500;
}

.file-upload-area small {
  display: block;
  color: #8888aa;
  font-size: 12px;
  margin-top: 4px;
}

.remove-image {
  position: absolute;
  top: 8px;
  left: 8px;
  background: none;
  border: none;
  color: #ef4444;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-image:hover:not(:disabled) {
  background: #fee2e2;
}

.remove-image:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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

/* ===== Spinner ===== */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
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

  .header-actions {
    justify-content: space-between;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .total-badge {
    flex: 1;
    justify-content: center;
  }

  .total-amount {
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

  .modal-container {
    max-width: 100%;
    margin: 16px;
    max-height: 95vh;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }

  .page-title {
    font-size: 20px;
  }
}

@media (max-width: 576px) {
  .page-header {
    padding: 0;
  }

  .header-actions {
    flex-direction: column;
  }

  .total-badge {
    width: 100%;
    justify-content: center;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-header {
    padding: 16px;
  }
}
</style>