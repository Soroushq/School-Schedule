# سیستم مدیریت برنامه مدرسه

یک سیستم کامل برای مدیریت برنامه‌های زمانی مدرسه با پشتیبانی از هر دو حالت localStorage و backend API.

## ویژگی‌ها

### Frontend (Next.js)
- 🎯 مدیریت برنامه‌های پرسنلی و کلاسی
- 🔄 همگام‌سازی خودکار بین برنامه‌ها
- 🌙 پشتیبانی از حالت تاریک/روشن
- 📱 طراحی ریسپانسیو
- 🔒 مدیریت دسترسی و نقش‌ها
- 💾 ذخیره‌سازی محلی با localStorage
- 🌐 پشتیبانی از backend API
- 🔄 تغییر آنی بین localStorage و API

### Backend (Flask)
- 🗄️ پایگاه داده SQLite
- 🔌 API RESTful کامل
- 🔐 مدیریت امن داده‌ها
- 🌐 پشتیبانی از CORS
- 📊 مدیریت روابط بین جداول

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+ 
- Python 3.8+
- npm یا yarn

### Frontend

```bash
# نصب dependencies
npm install

# اجرای محیط توسعه
npm run dev
```

Frontend روی `http://localhost:3000` اجرا خواهد شد.

### Backend

```bash
# رفتن به پوشه backend
cd backend

# نصب dependencies
pip install -r requirements.txt

# اجرای سرور
python app.py
```

Backend روی `http://localhost:5000` اجرا خواهد شد.

## تنظیمات

### متغیرهای محیطی

فایل `.env.local` در ریشه پروژه ایجاد کنید:

```env
# تنظیمات API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_USE_API=false

# تنظیمات توسعه
NEXT_PUBLIC_ENV=development
```

### تغییر بین localStorage و API

در رابط کاربری، در گوشه پایین سمت چپ، کلید تغییر حالت وجود دارد که می‌توانید بین localStorage و API تغییر دهید.

## ساختار پروژه

```
├── src/
│   ├── app/                    # صفحات Next.js
│   ├── components/             # کامپوننت‌های React
│   ├── services/              # سرویس‌های داده
│   │   ├── storageService.ts  # مدیریت localStorage
│   │   ├── apiService.ts      # ارتباط با API
│   │   ├── hybridStorageService.ts # سرویس ترکیبی
│   │   └── scheduleSync.ts    # همگام‌سازی برنامه‌ها
│   ├── types/                 # تعریف انواع TypeScript
│   └── data/                  # داده‌های استاتیک
├── backend/
│   ├── app.py                 # سرور Flask اصلی
│   ├── config.py              # تنظیمات
│   └── requirements.txt       # dependencies Python
└── public/                    # فایل‌های استاتیک
```

## API Endpoints

### پرسنل
- `GET /api/personnel` - دریافت تمام پرسنل
- `POST /api/personnel` - ایجاد پرسنل جدید
- `GET /api/personnel/{id}` - دریافت پرسنل با ID
- `PUT /api/personnel/{id}` - به‌روزرسانی پرسنل

### برنامه‌های پرسنلی
- `GET /api/personnel/{id}/schedules` - دریافت برنامه‌های پرسنل
- `POST /api/personnel/{id}/schedules` - ذخیره برنامه‌های پرسنل

### برنامه‌های کلاسی
- `GET /api/class-schedules` - دریافت تمام برنامه‌های کلاسی
- `GET /api/class-schedules/{grade}/{class}/{field}` - دریافت برنامه کلاس خاص
- `POST /api/class-schedules/{grade}/{class}/{field}` - ذخیره برنامه کلاسی

## ویژگی‌های کلیدی

### سیستم ترکیبی ذخیره‌سازی
- **localStorage**: ذخیره‌سازی محلی در مرورگر
- **API Backend**: ذخیره‌سازی در پایگاه داده سرور
- **تغییر آنی**: امکان تغییر بین دو حالت بدون از دست دادن داده‌ها
- **Fallback**: در صورت عدم دسترسی به API، خودکار به localStorage برمی‌گردد

### همگام‌سازی داده‌ها
- همگام‌سازی خودکار بین برنامه‌های پرسنلی و کلاسی
- به‌روزرسانی فوری تغییرات در تمام بخش‌ها
- حفظ یکپارچگی داده‌ها

### امنیت و حریم خصوصی
- مدیریت توافق‌نامه حریم خصوصی
- کنترل دسترسی به localStorage
- اعتبارسنجی داده‌ها در backend

## توسعه

### اضافه کردن API جدید

1. در `backend/app.py` endpoint جدید اضافه کنید
2. در `src/services/apiService.ts` متد مربوطه را اضافه کنید
3. در `src/services/hybridStorageService.ts` منطق ترکیبی را پیاده‌سازی کنید

### اضافه کردن کامپوننت جدید

1. کامپوننت را در `src/components/` ایجاد کنید
2. از `hybridStorageService` برای دسترسی به داده‌ها استفاده کنید
3. تست کنید که در هر دو حالت localStorage و API کار می‌کند

## مشکلات رایج

### خطای CORS
اگر با خطای CORS مواجه شدید، مطمئن شوید که:
- Backend در حال اجرا است
- آدرس frontend در تنظیمات CORS backend اضافه شده

### مشکل در ذخیره‌سازی
- بررسی کنید که توافق‌نامه حریم خصوصی پذیرفته شده
- در Developer Tools مرورگر، وضعیت localStorage را بررسی کنید

### عدم اتصال به API
- مطمئن شوید که backend روی پورت 5000 اجرا می‌شود
- از کامپوننت ApiToggle برای بررسی وضعیت اتصال استفاده کنید

## مشارکت

برای مشارکت در پروژه:

1. Fork کنید
2. Branch جدید ایجاد کنید
3. تغییرات را commit کنید
4. Pull Request ارسال کنید

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.
