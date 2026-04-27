<template>
    <b-container fluid class="py-4">
        <div class="employer-dashboard">
            <!-- عنوان صفحه -->
            <b-row class="mb-4 align-items-center">
                <b-col>
                    <h3 class="yekanf mb-0">داشبورد کارفرما</h3>
                    <small class="yekanf  text-muted">خلاصه وضعیت همکاری، مالی و تیکت‌ها</small>
                </b-col>
            </b-row>

            <!-- ردیف ۱: اطلاعات همکاری -->
            <b-row>
                <b-col cols="12" md="4" class="mb-3">
                    <b-card class="stat-card" body-class="d-flex align-items-center">
                        <div class="stat-icon bg-primary text-white">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-title">استارت همکاری</div>
                            <div class="stat-value"> {{ dashboard.subscription ? new
                                Date(dashboard.subscription.start_date).toLocaleDateString('fa') : 'وارد نشده' }} </div>
                            <small v-if="dashboard.subscription && dashboard.subscription.start_date"
                                class="text-muted">با افتخار در کنار شما هستیم</small>
                        </div>
                    </b-card>
                </b-col>

                <b-col cols="12" md="4" class="mb-3">
                    <b-card class="stat-card" body-class="d-flex align-items-center">
                        <div class="stat-icon bg-warning text-white">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-title">انقضاء پشتیبانی</div>
                            <div class="stat-value">
                                {{ dashboard.subscription ? new
                                    Date(dashboard.subscription.expiration_date).toLocaleDateString('fa') : 'وارد نشده' }}
                            </div>
                            <small v-if="dashboard.subscription"
                                :class="['font-weight-bold', !dashboard.active ? 'text-danger' : 'text-success']">
                                {{ !dashboard.active ? 'پشتیبانی منقضی شده' : 'پشتیبانی فعال' }}
                            </small>
                        </div>
                    </b-card>
                </b-col>

                <b-col cols="12" md="4" class="mb-3">
                    <b-card class="stat-card" body-class="d-flex align-items-center">
                        <div class="stat-icon bg-info text-white">
                            <i class="fas fa-medal"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-title">سطح همکاری</div>
                            <div class="stat-value">{{
                                dashboard.subscription ? trasnlater(dashboard.subscription.level_type) : "" }}</div>
                            <b-badge
                                :variant="cooperationLevelVariant(dashboard.subscription ? dashboard.subscription.level_type : '')"
                                pill>
                                {{ dashboard.subscription ? dashboard.subscription.level_type : 'وارد نشده' }}
                            </b-badge>
                        </div>
                    </b-card>
                </b-col>
            </b-row>

            <!-- ردیف ۲: اطلاعات مالی -->
            <b-row class="mt-2">
                <b-col cols="12" md="4" class="mb-3">
                    <b-card class="stat-card" body-class="d-flex align-items-center">
                        <div class="stat-icon bg-danger text-white">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-title">میزان بدهی</div>
                            <div class="stat-value text-danger">
                                {{ formatCurrency(dashboard.totalDebt) }}
                            </div>
                            <small class="text-muted">آخرین بروزرسانی:
                                {{ new Date().toLocaleDateString('fa') }}
                            </small>
                        </div>
                    </b-card>
                </b-col>

                <b-col cols="12" md="4" class="mb-3">
                    <b-card class="stat-card" body-class="d-flex align-items-center">
                        <div class="stat-icon bg-success text-white">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-title">کل پرداختی</div>
                            <div class="stat-value text-success">
                                {{ formatCurrency(dashboard.totalPay) }}
                            </div>
                            <small class="text-muted">از ابتدای همکاری</small>
                        </div>
                    </b-card>
                </b-col>

                <b-col cols="12" md="4" class="mb-3">
                    <b-card class="stat-card" body-class="d-flex align-items-center">
                        <div class="stat-icon bg-secondary text-white">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-title">پرداختی در این ماه</div>
                            <div class="stat-value">
                                {{ formatCurrency(dashboard.totalMonth) }}
                            </div>
                            <small class="text-muted">ماه جاری</small>
                        </div>
                    </b-card>
                </b-col>
            </b-row>

            <!-- ردیف ۳: وضعیت تیکت‌ها -->
            <b-row class="mt-2">
                <b-col cols="12" md="4" class="mb-3">
                    <b-card class="stat-card" body-class="d-flex align-items-center">
                        <div class="stat-icon bg-dark text-white">
                            <i class="fas fa-ticket-alt"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-title">تعداد تیکت</div>
                            <div class="stat-value">
                                {{ dashboard.ticket ? dashboard.ticket.totalTicket : '' }}
                            </div>
                            <small class="text-muted">کل تیکت‌های ثبت‌شده</small>
                        </div>
                    </b-card>
                </b-col>

                <b-col cols="12" md="4" class="mb-3">
                    <b-card class="stat-card" body-class="d-flex align-items-center">
                        <div class="stat-icon bg-primary text-white">
                            <i class="fas fa-envelope-open-text"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-title">تیکت‌های باز</div>
                            <div class="stat-value text-warning">
                                {{ dashboard.ticket ? dashboard.ticket.openTicket : '' }}
                            </div>
                            <small class="text-muted">در انتظار پاسخ/پیگیری</small>
                        </div>
                    </b-card>
                </b-col>

                <b-col cols="12" md="4" class="mb-3">
                    <b-card class="stat-card" body-class="d-flex align-items-center">
                        <div class="stat-icon bg-success text-white">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-title">تیکت‌های بسته شده</div>
                            <div class="stat-value text-success">
                                {{ dashboard.ticket ? dashboard.ticket.closeTicket : '' }}
                            </div>
                        </div>
                    </b-card>
                </b-col>
            </b-row>
        </div>

    </b-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useAdmin } from '@/stores/modules/admin';
import { useRouter } from "vue-router";
const store = useAdmin();
const router = useRouter()
let dashboard = ref({})
// دریافت داده از API
onMounted(async () => {
    const { data } = await axios.get("/dashboard");
    dashboard.value = data;
    if (!dashboard.value.active) {
        Swal.fire("متوجه شدم", "تاریخ پشتیبانی شما به انتها رسیده است لطفا برای استفاده مجدد از سیستم با پشتیبانی تماس بگیرید", "success");
        // router.push('/login')
    }
});
function formatCurrency(value) {
    if (value == null) return "-";
    return value.toLocaleString("fa-IR") + " تومان";
}
function trasnlater(level_type) {
    if (level_type == 'silver') {
        return "نقره ای"
    } else if (level_type == 'bronze') {
        return "برنز"
    } else if (level_type == 'gold') {
        return "طلا"
    } else {
        return "الماس"
    }
}
function cooperationLevelVariant(level_type) {
    switch (level_type) {
        case "gold":
            return "warning";
        case "silver":
            return "info";
        case "bronze":
            return "secondary";
        default:
            return "error";
    }
}
</script>

<style scoped>
.employer-dashboard {
    direction: rtl;
}

/* کارت‌ها */
.stat-card {
    border-radius: 12px;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
    border: 1px solid #f0f0f0;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.07);
}

/* آیکون‌ها */
.stat-icon {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
    font-size: 20px;
    flex-shrink: 0;
}

/* متن داخل کارت */
.stat-content {
    flex: 1;
}

.stat-title {
    font-size: 0.85rem;
    color: #6c757d;
}

.stat-value {
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 4px;
    margin-bottom: 4px;
}

h5 {
    font-size: 1rem;
    font-weight: 600;
}

.small {
    font-size: 0.85rem;
    border-bottom: 1px solid #1213;
    padding-bottom: 8px;
}

.dashboardItem strong {
    width: 100%;
    min-height: 40px;
}

.dashboardItem .small {
    background-color: var(--theme-color);
    color: white !important;
    width: 100%;
    padding: 8px 0;
}

.dashboardItem {
    border: 1px solid #1213;
    border-radius: 8px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 0 5px #1213;
    padding: 0;
    overflow: hidden;
}
</style>