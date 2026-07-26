<template>
    <div class="add-ticket-page">
        <!-- هدر صفحه -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-icon">
                    <i class="bi bi-plus-circle-fill"></i>
                </div>
                <div>
                    <h1 class="page-title">تیکت جدید</h1>
                    <p class="page-subtitle">ثبت درخواست پشتیبانی جدید</p>
                </div>
            </div>
            <div class="header-actions">
                <router-link to="/ticket" class="btn btn-outline">
                    <i class="bi bi-arrow-right"></i>
                    بازگشت
                </router-link>
            </div>
        </div>

        <!-- فرم -->
        <div class="form-card">
            <b-form @submit.prevent="handleSubmit" @keydown="clearFieldError">
                <!-- موضوع تیکت -->
                <div class="form-group">
                    <label for="subject">
                        <i class="bi bi-tag"></i>
                        موضوع تیکت
                        <span class="required">*</span>
                    </label>
                    <b-form-input id="subject" v-model="ticket.title" :state="getFieldState('title')"
                        placeholder="موضوع تیکت را وارد کنید" class="form-input" :disabled="loader" maxlength="255" />
                    <small class="text-danger" v-if="errors.title">{{ errors.title[0] }}</small>
                    <small class="text-helper">{{ ticket.title?.length || 0 }}/۲۵۵</small>
                </div>

                <!-- توضیحات -->
                <div class="form-group">
                    <label for="description">
                        <i class="bi bi-textarea"></i>
                        توضیحات
                        <span class="required">*</span>
                    </label>
                    <div class="editor-wrapper" :class="{ 'has-error': errors.description }">
                        <Editor v-model="ticket.description" rows="6" placeholder="توضیحات خود را بنویسید..."
                            :disabled="loader" />
                    </div>
                    <small class="text-danger" v-if="errors.description">{{ errors.description[0] }}</small>
                </div>

                <!-- فایل پیوست -->
                <div class="form-group">
                    <label>
                        <i class="bi bi-paperclip"></i>
                        فایل پیوست
                    </label>
                    <div class="file-upload-wrapper" :class="{ 'has-error': errors.file }">
                        <VueFileAgent @select="imageLoaded" :maxFiles="1" accept=".pdf,.jpg,.png,.webp" theme="grid"
                            deletable sortable :disabled="loader" />
                    </div>
                    <small class="text-danger" v-if="errors.file">{{ errors.file[0] }}</small>
                    <small class="text-helper">فرمت‌های مجاز: PDF, JPG, PNG, WebP | حداکثر ۵ مگابایت</small>
                </div>

                <!-- دکمه‌های اقدام -->
                <div class="form-actions">
                    <b-button type="submit" :disabled="loader || !isFormValid" variant="primary" class="btn-submit">
                        <span v-if="!loader">
                            <i class="bi bi-send-fill"></i>
                            ارسال تیکت
                        </span>
                        <span v-else>
                            <i class="bi bi-arrow-repeat spinner"></i>
                            در حال ارسال...
                        </span>
                    </b-button>

                    <b-button type="button" variant="outline" class="btn-reset" @click="resetForm" :disabled="loader">
                        <i class="bi bi-arrow-counterclockwise"></i>
                        پاک کردن
                    </b-button>
                </div>

                <!-- هشدار -->
                <div v-if="!isFormValid && touched" class="form-warning">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    لطفاً تمام فیلدهای ضروری را پر کنید
                </div>
            </b-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import Editor from '@/components/shared/editor.vue';
import axios from "axios";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { useRouter } from 'vue-router';

const router = useRouter();
const loader = ref(false);
const touched = ref(false);
const submitAttempted = ref(false);

const ticket = ref({
    title: '',
    description: '',
    file: null,
    audio: null
});

const errors = reactive({});

// ===== Computed =====
const isFormValid = computed(() => {
    return ticket.value.title?.trim() &&
        ticket.value.description?.trim();
});

// ===== Methods =====
function getFieldState(field) {
    if (!touched.value && !submitAttempted.value) return null;
    if (errors[field]) return false;
    if (field === 'title' || field === 'description') {
        return ticket.value[field] && ticket.value[field].toString().trim().length > 0;
    }
    return null;
}

function clearFieldError(event) {
    const field = event.target?.id;
    if (field && errors[field]) {
        delete errors[field];
    }
    touched.value = true;
}

function imageLoaded(files) {
    if (files && files.length > 0) {
        const file = files[0].file;
        // بررسی حجم فایل (حداکثر ۵ مگابایت)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
            return;
        }
        ticket.value.file = file;
        if (errors.file) {
            delete errors.file;
        }
    }
}

function resetForm() {
    if (loader.value) return;

    ticket.value.title = '';
    ticket.value.description = '';
    ticket.value.file = null;
    ticket.value.audio = null;

    Object.keys(errors).forEach(key => delete errors[key]);
    touched.value = false;
    submitAttempted.value = false;

    toast.info('فرم پاک شد');
}

const handleSubmit = async () => {
    submitAttempted.value = true;
    touched.value = true;

    // اعتبارسنجی سمت کلاینت
    if (!isFormValid.value) {
        toast.warning('لطفاً موضوع و توضیحات را وارد کنید');

        // اسکرول به اولین خطا
        const firstError = document.getElementById('subject');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        return;
    }

    // پاک کردن خطاهای قبلی
    Object.keys(errors).forEach(key => delete errors[key]);

    loader.value = true;

    try {
        const formData = new FormData();
        formData.append('title', ticket.value.title);
        formData.append('description', ticket.value.description);
        formData.append('file', ticket.value.file ?? '');
        formData.append('voice', ticket.value.audio ?? '');

        await axios.post('/tickets', formData);

        toast.success('تیکت با موفقیت ثبت شد ✅', {
            position: 'top-right'
        });

        // ریست فرم بعد از موفقیت
        resetForm();

        // رفتن به لیست تیکت‌ها بعد از ۱ ثانیه
        setTimeout(() => {
            router.push('/ticket');
        }, 1000);

    } catch (err) {
        if (err.response && err.response.status === 422) {
            Object.assign(errors, err.response.data.errors);
            toast.error('خطاهای فرم را بررسی کنید ❌');

            // نمایش اولین خطا
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) {
                const fieldMap = {
                    title: 'subject',
                    description: 'description',
                    file: 'file'
                };
                const elementId = fieldMap[firstErrorKey] || firstErrorKey;
                const element = document.getElementById(elementId);
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.focus();
                    }, 100);
                }
            }
        } else {
            toast.error('خطا در ارسال تیکت ❌');
        }
    } finally {
        loader.value = false;
    }
};

// ===== ضبط صوت (اختیاری) =====
// اگر نیاز به ضبط صوت دارید، می‌تونید این بخش رو فعال کنید
// اما چون v-if="false" هست، نیازی به پیاده‌سازی کامل نیست
</script>

<style scoped>
/* ===== Page ===== */
.add-ticket-page {
    direction: rtl;
    padding: 0;
}

/* ===== Header ===== */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    flex-wrap: wrap;
    gap: 16px;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.header-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: var(--primary-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: 0 4px 16px rgba(0, 55, 255, 0.25);
    flex-shrink: 0;
}

.page-title {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 2px 0;
}

.page-subtitle {
    font-size: 14px;
    color: #8888aa;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.btn {
    padding: 9px 18px;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: inherit;
    text-decoration: none;
}

.btn-outline {
    background: white;
    color: #4a4a6a;
    border: 1.5px solid #e2e8f0;
    box-shadow: var(--shadow-sm);
}

.btn-outline:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    color: #1a1a2e;
    text-decoration: none;
}

/* ===== Form Card ===== */
.form-card {
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(0, 55, 255, 0.04);
    padding: 28px 32px;
    max-width: 700px;
}

/* ===== Form Group ===== */
.form-group {
    margin-bottom: 24px;
}

.form-group label {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.form-group label i {
    color: var(--primary);
}

.required {
    color: #ef4444;
    font-size: 16px;
}

/* ===== Form Input ===== */
.form-input {
    padding: 11px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: var(--radius-sm);
    font-size: 14px;
    transition: all 0.25s ease;
    background: #fafbfc;
    font-family: inherit;
    width: 100%;
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

/* ===== Editor ===== */
.editor-wrapper {
    border: 1.5px solid #e2e8f0;
    border-radius: var(--radius-sm);
    overflow: hidden;
    transition: all 0.25s ease;
    background: #fafbfc;
}

.editor-wrapper:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(0, 55, 255, 0.08);
}

.editor-wrapper.has-error {
    border-color: #ef4444;
}

.editor-wrapper.has-error:focus-within {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

/* ===== File Upload ===== */
.file-upload-wrapper {
    border: 2px dashed #e2e8f0;
    border-radius: var(--radius-sm);
    padding: 12px;
    transition: all 0.25s ease;
    background: #fafbfc;
}

.file-upload-wrapper:hover:not(.has-error) {
    border-color: var(--primary);
    background: #f8faff;
}

.file-upload-wrapper.has-error {
    border-color: #ef4444;
    background: #fef2f2;
}

/* ===== Text Helpers ===== */
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

/* ===== Form Actions ===== */
.form-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px solid rgba(0, 55, 255, 0.06);
    flex-wrap: wrap;
}

.btn-submit {
    background: var(--primary-gradient);
    color: white;
    padding: 12px 32px;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 4px 16px rgba(0, 55, 255, 0.2);
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: inherit;
    min-width: 160px;
    justify-content: center;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0, 55, 255, 0.3);
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn-reset {
    background: transparent;
    color: #4a4a6a;
    border: 1.5px solid #e2e8f0;
    padding: 12px 24px;
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

.btn-reset:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
}

.btn-reset:disabled {
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

/* ===== Form Warning ===== */
.form-warning {
    margin-top: 16px;
    padding: 12px 16px;
    background: #fef3c7;
    border-radius: var(--radius-sm);
    border: 1px solid #fcd34d;
    color: #92400e;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

.form-warning i {
    font-size: 18px;
    color: #d97706;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: stretch;
    }

    .header-content {
        flex-direction: column;
        align-items: flex-start;
        text-align: right;
    }

    .header-icon {
        width: 40px;
        height: 40px;
        font-size: 20px;
    }

    .form-card {
        padding: 20px 16px;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn-submit {
        width: 100%;
    }

    .btn-reset {
        width: 100%;
        justify-content: center;
    }

    .page-title {
        font-size: 18px;
    }
}

@media (max-width: 576px) {
    .form-card {
        padding: 16px 12px;
    }

    .form-input {
        font-size: 13px;
        padding: 10px 12px;
    }

    .btn-submit {
        font-size: 14px;
        padding: 11px 20px;
        min-width: unset;
    }
}
</style>