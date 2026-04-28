<template>
  <div id="financial-page" class="container mt-4">
    <!-- بخش فیلتر جدول -->
    <div class="card mb-4">
      <div class="card-header costHeader d-flex justify-content-between align-items-center">
        <h3 class="fy">
          فیلتر اطلاعات مالی
        </h3>
        <h4>
          <span class="fy">
            جمع کل بدهی (تومان):
          </span>
          <span class="text-dark">{{ formatCurrency(Number(mainData.total)) }}</span>
        </h4>


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
              <button type="submit" class="btn btn-secondary me-2">اعمال فیلتر</button>
              <button type="button" class="btn btn-outline-secondary" @click="resetFilters">حذف فیلتر</button>
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
      <div v-if="mainData.data" class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>شناسه هزینه</th>
                <th>عنوان</th>
                <th>قیمت</th>
                <th>توضیحات</th>
                <th>تاریخ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in mainData.data.data" :key="index">
                <td>
                  <span class="showInMobile">شناسه هزینه:</span>
                  <span>
                    {{ item.id }}

                  </span>
                </td>
                <td>
                  <span class="showInMobile">عنوان هزینه:</span>
                  <span>
                    {{ item.title }}

                  </span>
                </td>
                <td>
                  <span class="showInMobile">مبلغ هزینه:</span>
                  <span>
                    {{ formatCurrency(item.amount) }} تومان

                  </span>
                </td>
                <td>
                  <span class="showInMobile">توضیحات هزینه:</span>
                  <span>
                    {{ item.description }}

                  </span>
                </td>
                <td>
                  <span class="showInMobile">تاریخ ثبت هزینه:</span>
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
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const filters = reactive({
  amount: '',
  dateFrom: '',
  dateTo: '',
});
const mainData = ref({}); // تعداد آیتم در هر صفحه
const applyFilters = (page) => {
  router.replace({ name: route.name, query: { amount: filters.amount, dateTo: filters.dateTo, dateFrom: filters.dateFrom, page: page ?? 1 } })
  getData({ amount: filters.amount, dateTo: filters.dateTo, dateFrom: filters.dateFrom, page: page ?? 1 })

};
function changePage(selectedPage) {
  if (selectedPage) {
    applyFilters(selectedPage)
  }
  else getData({})
}
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
async function getData(query = {}) {
  const { data } = await axios.get('/cost', {
    params: {
      ...query
    }
  })
  mainData.value = data;

}

onMounted(() => {
  getData(route.query)
})
function resetFilters() {
  filters.amount = null;
  filters.dateFrom = '';
  filters.dateTo = '';
  router.replace({ name: route.name })
  getData({})
};

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

@media (max-width:991px) {
  .costHeader h3 {
    display: none;
  }

  .costHeader h4 {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    width: 100%;
  }
}
</style>
