# Backend سیستم مدیریت برنامه مدرسه

این بخش backend سیستم مدیریت برنامه مدرسه است که با Flask پیاده‌سازی شده است.

## ویژگی‌ها

- مدیریت پرسنل و اطلاعات آنها
- مدیریت برنامه‌های پرسنلی
- مدیریت برنامه‌های کلاسی
- همگام‌سازی بین برنامه‌های پرسنلی و کلاسی
- API RESTful کامل
- پایگاه داده SQLite
- پشتیبانی از CORS برای ارتباط با frontend

## نصب و راه‌اندازی

### پیش‌نیازها

- Python 3.8 یا بالاتر
- pip

### مراحل نصب

1. نصب dependencies:
```bash
pip install -r requirements.txt
```

2. اجرای سرور:
```bash
python app.py
```

سرور روی پورت 5000 اجرا خواهد شد.

## API Endpoints

### پرسنل

- `GET /api/personnel` - دریافت تمام پرسنل
- `GET /api/personnel/{id}` - دریافت پرسنل با ID
- `GET /api/personnel/by-code/{code}` - دریافت پرسنل با کد پرسنلی
- `POST /api/personnel` - ایجاد پرسنل جدید
- `PUT /api/personnel/{id}` - به‌روزرسانی پرسنل

### برنامه‌های پرسنلی

- `GET /api/personnel/{id}/schedules` - دریافت برنامه‌های پرسنل
- `GET /api/personnel/by-code/{code}/schedules` - دریافت برنامه‌های پرسنل با کد
- `POST /api/personnel/{id}/schedules` - ذخیره برنامه‌های پرسنل

### برنامه‌های کلاسی

- `GET /api/class-schedules` - دریافت تمام برنامه‌های کلاسی
- `GET /api/class-schedules/{grade}/{class}/{field}` - دریافت برنامه کلاس خاص
- `POST /api/class-schedules/{grade}/{class}/{field}` - ذخیره برنامه کلاسی

### برنامه‌ها

- `DELETE /api/schedules/{id}` - حذف برنامه
- `PUT /api/schedules/{id}` - به‌روزرسانی برنامه

### کمکی

- `GET /api/health` - بررسی سلامت سرور
- `DELETE /api/clear-all` - حذف تمام برنامه‌ها

## ساختار پایگاه داده

### جدول Personnel
- id (String, Primary Key)
- personnel_code (String, Unique)
- full_name (String)
- main_position (String)
- employment_status (String)
- created_at (DateTime)
- updated_at (DateTime)

### جدول Schedule
- id (String, Primary Key)
- personnel_id (String, Foreign Key)
- personnel_code (String)
- employment_status (String)
- main_position (String)
- grade (String)
- class_number (String)
- field (String)
- class_schedule_id (String)
- day (String)
- time_start (String)
- time_end (String)
- hour_type (String)
- teaching_group (String)
- description (Text)
- timestamp (BigInteger)
- created_at (DateTime)
- updated_at (DateTime)

### جدول ClassSchedule
- id (String, Primary Key)
- grade (String)
- class_number (String)
- field (String)
- timestamp (BigInteger)
- created_at (DateTime)
- updated_at (DateTime)

## تنظیمات

متغیرهای محیطی قابل تنظیم:

- `DATABASE_URL`: آدرس پایگاه داده (پیش‌فرض: sqlite:///school_schedule.db)
- `SECRET_KEY`: کلید امنیتی Flask
- `FLASK_ENV`: محیط اجرا (development/production)

## امنیت

- استفاده از CORS برای کنترل دسترسی
- اعتبارسنجی داده‌های ورودی
- مدیریت خطاها
- استفاده از UUID برای شناسه‌ها

## توسعه

برای توسعه بیشتر:

1. فایل `app.py` شامل تمام API endpoints است
2. فایل `config.py` شامل تنظیمات مختلف است
3. مدل‌های پایگاه داده در `app.py` تعریف شده‌اند

## مشکلات رایج

### خطای CORS
اگر با خطای CORS مواجه شدید، مطمئن شوید که آدرس frontend در تنظیمات CORS اضافه شده است.

### خطای پایگاه داده
در صورت مشکل با پایگاه داده، فایل `school_schedule.db` را حذف کنید تا مجدداً ایجاد شود. 