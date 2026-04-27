<template>
  <div id="financial-page" class="container mt-4">
    <!-- بخش بالایی: جمع بدهی، جمع پرداختی، دکمه افزودن رسید -->
    <div class="card mb-3">
      <div class="card-body row mb-4 d-flex justify-content-between align-items-center">

        <div class="col-md-4">
          <h4>جمع کل پرداختی: <span class="text-success" v-if="mainData.total">{{ formatCurrency(Number(mainData.total))
          }}</span></h4>
        </div>
        <div class="col-md-4 text-end">
          <button class="btn btn-primary" @click="showAddReceiptModal = true">
            <i class="bi bi-receipt-fill me-2"></i> افزودن رسید پرداخت
          </button>
        </div>
      </div>
    </div>

    <!-- بخش فیلتر جدول -->
    <div class="card mb-4">
      <div class="card-header">
        فیلتر اطلاعات مالی
      </div>
      <div class="card-body">
        <form @submit.prevent="applyFilters()">
          <div class="row g-3">
            <div class="col-md-4">
              <label for="filter-cost" class="form-label">مبلغ (حداقل)</label>
              <input type="number" class="form-control" id="filter-cost" v-model.number="filters.amount">
            </div>
            <div class="col-md-4">
              <label for="filter-date-from" class="form-label">از تاریخ</label>
              <date-picker display-format="jYYYY/jMM/jDD" placeholder="از تاریخ" format="YYYY-MM-DD"
                v-model="filters.dateFrom"></date-picker>
            </div>
            <div class="col-md-4">
              <label for="filter-date-to" class="form-label">تا تاریخ</label>
              <date-picker display-format="jYYYY/jMM/jDD" placeholder="تا تاریخ" format="YYYY-MM-DD"
                v-model="filters.dateTo"></date-picker>
            </div>
            <div class="col-12 text-end">
              <button type="submit" class="btn btn-secondary me-2" @click="setFilter()">اعمال فیلتر</button>
              <button type="button" class="btn btn-outline-secondary" @click="resetFilters()">حذف فیلتر</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- جدول نمایش اطلاعات مالی -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>لیست اطلاعات مالی</span>
        <!-- کنترل‌های صفحه‌بندی -->
        <b-pagination v-if="mainData.data" v-model="mainData.data.current_page" :total-rows="mainData.data.total"
          :per-page="mainData.data.per_page" @Update:modelValue="changePage" align="center" class="mt-3"></b-pagination>

      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>شناسه واریز</th>
                <th>عنوان</th>
                <th>قیمت</th>
                <th>وضعیت</th>
                <th>توضیحات</th>
                <th>یادداشت ادمین</th>
                <th>تاریخ</th>
              </tr>
            </thead>
            <tbody v-if="mainData.data">
              <tr v-for="(item, index) in mainData.data.data" :key="index">
                <td>
                  <span class="showInMobile">شناسه واریز:</span>

                  <span>
                    {{ item.id }}
                  </span>
                </td>
                <td>
                  <span class="showInMobile">عنوان واریز:</span>
                  <span>
                    {{ item.title }}
                  </span>
                </td>
                <td>
                  <span class="showInMobile">مبلغ واریزی:</span>
                  <span>
                    {{ formatCurrency(item.amount) }} تومان

                  </span>
                </td>
                <td>
                  <span class="showInMobile">وضعیت واریزی:</span>


                  <span :class="getStatusClass(item.status)">{{ translater(item.status) }}</span>
                </td>
                <td>
                  <span class="showInMobile">توضیحات واریزی:</span>
                  <span>
                    {{ item.description ?? '-' }}

                  </span>
                </td>
                <td>
                  <span class="showInMobile">یادداشت ادمین:</span>
                  <span>
                    {{ item.admin_note ?? '-' }}
                  </span>
                </td>
                <td>
                  <span class="showInMobile">تاریخ واریز:</span>
                  <span>
                    {{ new Date(item.created_at).toLocaleDateString('fa') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- مودال افزودن رسید پرداخت -->
    <div class="modal" id="reciptModal" :class="{ 'd-block': showAddReceiptModal }" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">افزودن رسید پرداخت</h5>
            <button type="button" class="btn-close" @click="showAddReceiptModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitReceipt">
              <div class="mb-3">
                <label for="receipt-title" class="form-label">عنوان</label>
                <input type="text" class="form-control" id="receipt-title" v-model="newReceipt.title" required>
                <small class="text-danger" v-if="errors.title">{{ errors.title[0] }}</small>
              </div>
              <div class="mb-3">
                <label for="receipt-description" class="form-label">توضیحات</label>
                <textarea class="form-control" id="receipt-description" v-model="newReceipt.description"
                  rows="3"></textarea>
                <small class="text-danger" v-if="errors.description">{{ errors.description[0] }}</small>
              </div>
              <div class="mb-3">
                <label for="receipt-image" class="form-label">تصویر رسید</label>
                <input class="form-control" type="file" id="receipt-image" @change="handleImageUpload" accept="image/*">
                <small class="text-danger" v-if="errors.image">{{ errors.image[0] }}</small>
              </div>
              <div class="mb-3">
                <label for="receipt-amount" class="form-label">
                  تومان ({{ Number(newReceipt.amount).toLocaleString('fa') }})
                </label>
                <input type="number" class="form-control" id="receipt-amount" v-model="newReceipt.amount" required>
                <small class="text-danger" v-if="errors.amount">{{ errors.amount[0] }}</small>
              </div>
              <div class="modal-footer">
                <button type="button" :disabled="loader" class="btn btn-secondary"
                  @click="showAddReceiptModal = false">بستن</button>
                <button type="submit" :disabled="loader" class="btn btn-primary">ارسال</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import Swal from "sweetalert2";
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
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
const showAddReceiptModal = ref(false);
function changePage(selectedPage) {
  if (selectedPage) {
    applyFilters(selectedPage)
  }
  else getData({})
}
onMounted(() => {
  getData(route.query);
})

let mainData = ref({});
const applyFilters = (page) => {
  router.replace({ name: route.name, query: { amount: filters.amount, dateTo: filters.dateTo, dateFrom: filters.dateFrom, page: page ?? 1 } })
  getData({ amount: filters.amount, dateTo: filters.dateTo, dateFrom: filters.dateFrom, page: page ?? 1 })
};

function resetFilters() {
  filters.amount = null;
  filters.dateFrom = '';
  filters.dateTo = '';
  router.replace({ name: route.name })
  getData({})
};



const handleImageUpload = (event) => {
  newReceipt.image = event.target.files[0];
};
let loader = ref(false);
const submitReceipt = async () => {
  const fd = new FormData();
  fd.append('title', newReceipt.title);
  fd.append('amount', newReceipt.amount);
  fd.append('description', newReceipt.description);
  fd.append('image', newReceipt.image);
  loader.value = true;
  try {
    let { data } = await axios.post('/receipt', fd);
    getData(route.query);
    Swal.fire("موفق", "رسید شما با موفقیت ثبت شد و بعد از بررسی تایید میگردد", "success");
    showAddReceiptModal.value = false;

  } catch (error) {
    if (error.response?.status === 422) {
      Object.assign(errors, error.response.data.errors)
      toast.error('خطاهای فرم را بررسی کنید ❌')
    }
  } finally {
    loader.value = false;

  }
  // 
  financialData.value.push(newRowData);
  // ریست کردن فیلترها و رفتن به صفحه اول جهت نمایش داده جدید
  resetFilters();
  currentPage.value = 1; // یا رفتن به آخرین صفحه برای دیدن آیتم جدید

  Object.assign(newReceipt, {
    title: '', description: '', image: null, amount: null,
  });
  showAddReceiptModal.value = false;
  alert('رسید با موفقیت ثبت شد و به جدول اضافه شد.');
};

const getStatusClass = (status) => {
  switch (status) {
    case 'accepted': return 'badge bg-success';
    case 'rejected': return 'badge bg-danger';
    case 'pending': return 'badge bg-warning text-dark';
    default: return 'badge bg-secondary';
  }
};
const translater = (status) => {
  switch (status) {
    case 'accepted': return 'تایید شده';
    case 'rejected': return 'رد شده';
    case 'pending': return 'در انتظار';
  }
};

// تابع فرمت دهی پول
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
async function getData(query = {}) {
  loader.value = true;
  try {
    const { data } = await axios.get('/deposit', {
      params: {
        ...query
      }
    })
    mainData.value = data;
  } catch (error) {
    console.log(error)
  } finally {
    loader.value = false;
  }


}
</script>

<style scoped>
.modal-dialog {
  max-width: 700px;
}

.table-responsive {
  overflow-x: auto;
}

/* برای استفاده از آیکون‌های Bootstrap Icons */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.2/font/bootstrap-icons.css");

/* برای استایل صفحه بندی */
.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.page-link {
  cursor: pointer;
}

#reciptModal {
  background-color: white;
}
</style>
