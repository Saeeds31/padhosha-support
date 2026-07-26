<template>
  <div class="ticket-detail-page" v-if="mainData">
    <!-- هدر صفحه -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon" :class="getStatusColor(mainData.ticket.status)">
          <i class="bi bi-ticket-fill"></i>
        </div>
        <div>
          <div class="header-top">
            <h1 class="page-title">{{ mainData.ticket.title }}</h1>
            <span :class="['status-badge', getStatusClass(mainData.ticket.status)]">
              <span class="status-dot"></span>
              {{ translater(mainData.ticket.status) }}
            </span>
          </div>
          <p class="page-subtitle">
            <span>تیکت #{{ mainData.ticket.id }}</span>
            <span class="separator">•</span>
            <span>آخرین بروزرسانی: {{ formatDate(mainData.messages[0]?.created_at) }}</span>
          </p>
        </div>
      </div>
      <div class="header-actions">
        <router-link to="/ticket" class="btn btn-outline">
          <i class="bi bi-arrow-right"></i>
          بازگشت
        </router-link>
      </div>
    </div>

    <!-- کارت‌های اطلاعات -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-icon status-icon">
          <i class="bi bi-info-circle"></i>
        </div>
        <div class="info-content">
          <span class="info-label">وضعیت تیکت</span>
          <span :class="['info-value', 'status-text', getStatusColor(mainData.ticket.status)]">
            {{ translater(mainData.ticket.status) }}
          </span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-icon expert-icon">
          <i class="bi bi-person-badge"></i>
        </div>
        <div class="info-content">
          <span class="info-label">کارشناس مسئول</span>
          <span class="info-value">{{ mainData.ticket.doer?.full_name || 'تعیین نشده' }}</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-icon cost-icon">
          <i class="bi bi-coin"></i>
        </div>
        <div class="info-content">
          <span class="info-label">هزینه تیکت</span>
          <span class="info-value">{{ mainData.cost ? formatPrice(mainData.cost.amount) : 'بدون هزینه' }}</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-icon date-icon">
          <i class="bi bi-calendar3"></i>
        </div>
        <div class="info-content">
          <span class="info-label">تاریخ ایجاد</span>
          <span class="info-value">{{ formatDate(mainData.ticket.created_at) }}</span>
        </div>
      </div>
    </div>

    <!-- بخش ارسال پاسخ -->
    <div class="reply-section" v-if="mainData.ticket.status !== 'closed'">
      <div class="reply-card">
        <div class="reply-header">
          <i class="bi bi-reply-fill"></i>
          <h3>ارسال پاسخ جدید</h3>
        </div>
        
        <div class="reply-body">
          <b-form @submit.prevent="sendMessage" @keydown="clearFieldError">
            <!-- ویرایشگر -->
            <div class="form-group">
              <label for="reply-content">
                <i class="bi bi-pencil-square"></i>
                پاسخ شما
                <span class="required">*</span>
              </label>
              <div class="editor-wrapper" :class="{ 'has-error': errors.content }">
                <Editor 
                  v-model="form.content" 
                  placeholder="پاسخ خود را بنویسید..."
                  :disabled="loader"
                />
              </div>
              <small class="text-danger" v-if="errors.content">{{ errors.content[0] }}</small>
            </div>

            <!-- فایل پیوست -->
            <div class="form-group">
              <label>
                <i class="bi bi-paperclip"></i>
                فایل پیوست
              </label>
              <div class="file-upload-wrapper">
                <VueFileAgent 
                  @select="imageLoaded" 
                  :maxFiles="1" 
                  accept=".pdf,.jpg,.png,.webp" 
                  theme="grid"
                  deletable 
                  sortable 
                  :disabled="loader"
                />
              </div>
              <small class="text-helper">فرمت‌های مجاز: PDF, JPG, PNG, WebP</small>
            </div>

            <!-- دکمه‌ها -->
            <div class="reply-actions">
              <b-button 
                type="submit" 
                :disabled="loader || !isContentValid"
                variant="primary"
                class="btn-send"
              >
                <span v-if="!loader">
                  <i class="bi bi-send-fill"></i>
                  ارسال پاسخ
                </span>
                <span v-else>
                  <i class="bi bi-arrow-repeat spinner"></i>
                  در حال ارسال...
                </span>
              </b-button>
              
              <b-button 
                type="button" 
                variant="outline" 
                class="btn-cancel"
                @click="resetForm"
                :disabled="loader"
              >
                <i class="bi bi-x-circle"></i>
                پاک کردن
              </b-button>
            </div>

            <!-- هشدار -->
            <div v-if="!isContentValid && submitAttempted" class="form-warning">
              <i class="bi bi-exclamation-triangle-fill"></i>
              لطفاً متن پاسخ را وارد کنید
            </div>
          </b-form>
        </div>
      </div>
    </div>

    <!-- تیکت بسته شده -->
    <div class="reply-section" v-else>
      <div class="reply-card closed-card">
        <div class="reply-header">
          <i class="bi bi-lock-fill"></i>
          <h3>تیکت بسته شده</h3>
        </div>
        <div class="reply-body">
          <div class="closed-message">
            <i class="bi bi-info-circle-fill"></i>
            <p>این تیکت در وضعیت بسته شده قرار دارد و امکان ارسال پاسخ وجود ندارد.</p>
            <span>برای پیگیری مجدد، تیکت جدیدی ثبت کنید.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- پیام‌ها -->
    <div class="messages-section">
      <div class="messages-header">
        <div class="messages-title">
          <i class="bi bi-chat-dots-fill"></i>
          <span>پیام‌ها</span>
          <span class="message-count">{{ mainData.messages.length }} پیام</span>
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div v-if="mainData.messages.length === 0" class="empty-messages">
          <i class="bi bi-chat-square-text"></i>
          <p>هنوز پیامی ارسال نشده است</p>
        </div>
        
        <transition-group name="message" tag="div" class="messages-list">
          <div 
            v-for="(msg, idx) in mainData.messages" 
            :key="msg.id"
            :class="['message-item', msg.sender_side === 'employer' ? 'message-sent' : 'message-received']"
          >
            <!-- آواتار -->
            <div class="message-avatar" :class="msg.sender_side === 'employer' ? 'avatar-sent' : 'avatar-received'">
              <span>{{ getInitials(msg.sender?.full_name || 'کاربر') }}</span>
            </div>

            <!-- محتوای پیام -->
            <div class="message-bubble" :class="msg.sender_side === 'employer' ? 'bubble-sent' : 'bubble-received'">
              <div class="message-meta">
                <span class="message-sender">
                  {{ msg.sender_side === 'employer' ? 'شما' : (msg.sender?.full_name || 'کارشناس') }}
                </span>
                <span class="message-time">
                  {{ formatTime(msg.created_at) }}
                </span>
              </div>
              
              <div class="message-text" v-html="msg.message"></div>
              
              <!-- فایل پیوست -->
              <div v-if="msg.attachment" class="message-attachment">
                <a :href="fileHandler(msg.attachment)" target="_blank" class="attachment-link">
                  <i class="bi bi-file-earmark-arrow-down"></i>
                  <span>مشاهده فایل پیوست</span>
                </a>
              </div>
              
              <!-- وویس -->
              <div v-if="msg.voice" class="message-voice">
                <audio :src="fileHandler(msg.voice)" controls class="voice-player"></audio>
              </div>
              
              <div class="message-date">
                <i class="bi bi-calendar2"></i>
                {{ formatDate(msg.created_at) }}
              </div>
            </div>
          </div>
        </transition-group>
        
        <!-- دکمه اسکرول به پایین -->
        <button 
          v-if="showScrollButton" 
          class="scroll-bottom-btn"
          @click="scrollToBottom"
        >
          <i class="bi bi-chevron-down"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, reactive, ref, computed, nextTick, watch } from 'vue';
import Editor from '@/components/shared/editor.vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { useRoute } from 'vue-router';

const route = useRoute();
const mainData = ref(null);
const loader = ref(false);
const submitAttempted = ref(false);
const showScrollButton = ref(false);
const messagesContainer = ref(null);

const form = reactive({
  file: null,
  content: '',
  voice: null
});

const errors = reactive({});

// ===== Computed =====
const isContentValid = computed(() => {
  return form.content && form.content.trim().length > 0;
});

// ===== Methods =====
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0);
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
}

function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPrice(amount) {
  if (!amount) return '۰ تومان';
  return Number(amount).toLocaleString('fa-IR') + ' تومان';
}

function fileHandler(path) {
  if (!path) return '#';
  return window.baseImageAddress + path;
}

function translater(status) {
  const map = {
    'answered': 'پاسخ داده شده',
    'closed': 'بسته شده',
    'pending': 'در انتظار بررسی',
    'awaiting_payment': 'در انتظار پرداخت',
    'awaiting_response': 'در انتظار پاسخ',
    'referred': 'ارجاع شده'
  };
  return map[status] || status;
}

function getStatusClass(status) {
  const map = {
    'answered': 'status-answered',
    'closed': 'status-closed',
    'pending': 'status-pending',
    'awaiting_payment': 'status-payment',
    'awaiting_response': 'status-response',
    'referred': 'status-referred'
  };
  return map[status] || 'status-default';
}

function getStatusColor(status) {
  const map = {
    'answered': 'status-answered',
    'closed': 'status-closed',
    'pending': 'status-pending',
    'awaiting_payment': 'status-payment',
    'awaiting_response': 'status-response',
    'referred': 'status-referred'
  };
  return map[status] || 'status-default';
}

async function getTicket() {
  try {
    const { data } = await axios.get(`/tickets/${route.params.id}`);
    mainData.value = data.data;
    await nextTick();
    scrollToBottom();
  } catch (error) {
    toast.error('خطا در دریافت اطلاعات تیکت');
  }
}

function imageLoaded(files) {
  if (files && files.length > 0) {
    const file = files[0].file;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
      return;
    }
    form.file = file;
    if (errors.file) delete errors.file;
  }
}

function clearFieldError(event) {
  const field = event.target?.id;
  if (field && errors[field]) {
    delete errors[field];
  }
}

function resetForm() {
  if (loader.value) return;
  form.content = '';
  form.file = null;
  form.voice = null;
  Object.keys(errors).forEach(key => delete errors[key]);
  submitAttempted.value = false;
  toast.info('فرم پاک شد');
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function handleScroll() {
  if (messagesContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
    showScrollButton.value = scrollHeight - scrollTop - clientHeight > 100;
  }
}

async function sendMessage() {
  submitAttempted.value = true;
  
  if (!isContentValid.value) {
    toast.warning('لطفاً متن پاسخ را وارد کنید');
    return;
  }

  Object.keys(errors).forEach(key => delete errors[key]);
  loader.value = true;

  try {
    const fd = new FormData();
    fd.append('ticket_id', mainData.value.ticket.id);
    fd.append('message', form.content);
    if (form.file) fd.append('file', form.file);
    if (form.voice) fd.append('voice', form.voice);

    await axios.post('/messages', fd);
    
    toast.success('پیام شما با موفقیت ارسال شد ✅');
    
    // ریست فرم
    form.content = '';
    form.file = null;
    form.voice = null;
    submitAttempted.value = false;
    
    // دریافت مجدد تیکت
    await getTicket();
    
  } catch (error) {
    if (error.response?.status === 422) {
      Object.assign(errors, error.response.data.errors);
      toast.error('خطاهای فرم را بررسی کنید ❌');
    } else {
      toast.error('خطا در ارسال پیام ❌');
    }
  } finally {
    loader.value = false;
  }
}

// ===== Watch =====
watch(() => mainData.value?.messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

// ===== Lifecycle =====
onMounted(() => {
  getTicket();
  
  // گوش دادن به اسکرول
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.addEventListener('scroll', handleScroll);
    }
  });
});
</script>

<style scoped>
/* ===== Page ===== */
.ticket-detail-page {
  direction: rtl;
  padding: 0;
}

/* ===== Header ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.header-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: #8888aa;
  margin: 4px 0 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.separator {
  color: #d1d5db;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

/* ===== Status Badge ===== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

/* وضعیت‌ها */
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

/* ===== Info Grid ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  background: white;
  border-radius: var(--radius);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 55, 255, 0.04);
  transition: all 0.25s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
}

.status-icon {
  background: var(--primary-gradient);
}
.expert-icon {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
}
.cost-icon {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}
.date-icon {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  color: #8888aa;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: block;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  display: block;
  margin-top: 2px;
}

.info-value.status-text {
  font-size: 14px;
}

/* ===== Reply Section ===== */
.reply-section {
  margin-bottom: 24px;
}

.reply-card {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 55, 255, 0.04);
  overflow: hidden;
}

.reply-header {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fafbfc;
  border-bottom: 1px solid rgba(0, 55, 255, 0.04);
}

.reply-header i {
  color: var(--primary);
  font-size: 20px;
}

.reply-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.reply-body {
  padding: 20px;
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

.file-upload-wrapper {
  border: 2px dashed #e2e8f0;
  border-radius: var(--radius-sm);
  padding: 12px;
  transition: all 0.25s ease;
  background: #fafbfc;
}

.file-upload-wrapper:hover {
  border-color: var(--primary);
  background: #f8faff;
}

.text-helper {
  color: #8888aa;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.text-danger {
  color: #ef4444 !important;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

/* ===== Reply Actions ===== */
.reply-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.btn-send {
  background: var(--primary-gradient);
  color: white;
  padding: 10px 28px;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0, 55, 255, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 55, 255, 0.3);
}

.btn-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-cancel {
  background: transparent;
  color: #4a4a6a;
  border: 1.5px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}

.btn-cancel:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== Form Warning ===== */
.form-warning {
  margin-top: 12px;
  padding: 10px 14px;
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

/* ===== Closed Card ===== */
.closed-card .reply-header {
  background: #fef2f2;
}

.closed-card .reply-header i {
  color: #ef4444;
}

.closed-message {
  text-align: center;
  padding: 24px 16px;
}

.closed-message i {
  font-size: 40px;
  color: #f59e0b;
  display: block;
  margin-bottom: 12px;
}

.closed-message p {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.closed-message span {
  font-size: 14px;
  color: #8888aa;
}

/* ===== Messages Section ===== */
.messages-section {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(0, 55, 255, 0.04);
  overflow: hidden;
}

.messages-header {
  padding: 14px 20px;
  background: #fafbfc;
  border-bottom: 1px solid rgba(0, 55, 255, 0.04);
}

.messages-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 15px;
  color: #1a1a2e;
}

.messages-title i {
  color: var(--primary);
  font-size: 18px;
}

.message-count {
  font-size: 12px;
  font-weight: 400;
  color: #8888aa;
  background: #f0f2f7;
  padding: 2px 10px;
  border-radius: 12px;
}

.messages-container {
  max-height: 600px;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  background: #f8fafc;
}

/* ===== Messages List ===== */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  animation: messageIn 0.3s ease;
}

.message-sent {
  flex-direction: row-reverse;
}

.message-received {
  flex-direction: row;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ===== Avatar ===== */
.message-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.avatar-sent {
  background: var(--primary-gradient);
}

.avatar-received {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
}

/* ===== Bubble ===== */
.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.bubble-sent {
  background: var(--primary-gradient);
  color: white;
  border-bottom-left-radius: 4px;
}

.bubble-received {
  background: white;
  color: #1a1a2e;
  border-bottom-right-radius: 4px;
  border: 1px solid rgba(0, 55, 255, 0.06);
}

/* ===== Message Meta ===== */
.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 12px;
  font-size: 12px;
}

.message-sender {
  font-weight: 600;
}

.bubble-received .message-sender {
  color: var(--primary);
}

.message-time {
  opacity: 0.7;
  font-size: 11px;
}

/* ===== Message Text ===== */
.message-text {
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}

.message-text :deep(p) {
  margin: 0 0 8px 0;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

/* ===== Attachment ===== */
.message-attachment {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.bubble-received .message-attachment {
  border-top-color: rgba(0, 0, 0, 0.06);
}

.attachment-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  color: #3b82f6;
  transition: color 0.2s;
}

.bubble-sent .attachment-link {
  color: #93c5fd;
}

.attachment-link:hover {
  text-decoration: underline;
}

/* ===== Voice ===== */
.message-voice {
  margin-top: 8px;
}

.voice-player {
  width: 100%;
  max-width: 240px;
  height: 40px;
  border-radius: 8px;
}

/* ===== Message Date ===== */
.message-date {
  margin-top: 6px;
  font-size: 11px;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ===== Empty Messages ===== */
.empty-messages {
  text-align: center;
  padding: 48px 20px;
  color: #8888aa;
}

.empty-messages i {
  font-size: 48px;
  color: #d1d5db;
  display: block;
  margin-bottom: 12px;
}

.empty-messages p {
  font-size: 16px;
  font-weight: 500;
  color: #4a4a6a;
  margin: 0;
}

/* ===== Scroll Button ===== */
.scroll-bottom-btn {
  position: sticky;
  bottom: 16px;
  left: 50%;
  transform: translateX(50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-gradient);
  color: white;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 55, 255, 0.3);
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.scroll-bottom-btn:hover {
  transform: translateX(50%) scale(1.1);
}

/* ===== Spinner ===== */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== Buttons ===== */
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

/* ===== Responsive ===== */
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-icon {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 18px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .reply-actions {
    flex-direction: column;
  }
  
  .btn-send {
    width: 100%;
    justify-content: center;
  }
  
  .btn-cancel {
    width: 100%;
    justify-content: center;
  }
  
  .messages-container {
    max-height: 400px;
    padding: 12px;
  }
  
  .reply-body {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .message-bubble {
    max-width: 92%;
    padding: 10px 12px;
  }
  
  .message-text {
    font-size: 13px;
  }
  
  .message-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .messages-container {
    max-height: 350px;
    padding: 8px;
  }
}
</style>