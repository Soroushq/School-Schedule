# مدل داده جدید برای برنامه‌ریزی مدرسه

این مدل داده جدید برای بهبود ارتباط بین برنامه‌های کلاسی و پرسنلی طراحی شده است.

## ساختار مدل داده

1. **مدل پرسنل (Personnel):**
   - شامل اطلاعات پایه‌ای پرسنل مانند کد پرسنلی، نام و عنوان شغلی

2. **مدل برنامه (Schedule):**
   - هر برنامه شامل اطلاعات زمان (روز و ساعت)، اطلاعات کلاس و پرسنل است
   - هر برنامه دارای یک شناسه منحصر به فرد (id) است
   - هر برنامه به یک پرسنل (با personnelId) و یک کلاس (با classScheduleId) مرتبط است

3. **مدل برنامه پرسنلی (SavedPersonnelSchedule):**
   - شامل اطلاعات یک پرسنل و لیستی از برنامه‌های آن پرسنل

4. **مدل برنامه کلاسی (ClassSchedule):**
   - شامل اطلاعات یک کلاس (پایه، شماره، رشته) و لیستی از برنامه‌های آن کلاس

## نحوه استفاده

### 1. ذخیره و بازیابی داده‌ها

برای ذخیره و بازیابی داده‌ها از کامپوننت `ScheduleDataManager` استفاده کنید:

```typescript
// ذخیره برنامه پرسنلی
ScheduleDataManager.savePersonnelSchedule(personnel, schedules);

// بارگذاری برنامه پرسنلی با کد پرسنلی
const { personnel, schedules } = ScheduleDataManager.loadPersonnelScheduleByCode(personnelCode);

// ذخیره برنامه کلاسی
ScheduleDataManager.saveClassSchedule(grade, classNumber, field, schedules);

// بارگذاری برنامه کلاسی
const schedules = ScheduleDataManager.loadClassScheduleFromPersonnelData(grade, classNumber, field);
```

### 2. انتقال به مدل جدید

برای انتقال تدریجی به مدل جدید، از کامپوننت `ScheduleDataAdapter` استفاده کنید:

```typescript
// ذخیره برنامه پرسنلی با استفاده از آداپتور
ScheduleDataAdapter.savePersonnelScheduleToLocalStorage(personnel, schedules);

// بارگذاری برنامه کلاسی با استفاده از آداپتور
const schedules = ScheduleDataAdapter.loadClassScheduleFromLocalStorage(grade, classNumber, field);
```

## تغییرات نسبت به مدل قبلی

1. **ارتباط دو طرفه:** هر برنامه هم به پرسنل و هم به کلاس مرتبط می‌شود
2. **همگام‌سازی خودکار:** تغییرات در برنامه پرسنلی به طور خودکار در برنامه کلاسی اعمال می‌شود و بالعکس
3. **مدیریت تداخل:** در هر خانه جدول برنامه کلاسی فقط یک پرسنل می‌تواند وجود داشته باشد

## مراحل پیاده‌سازی

1. ابتدا از کامپوننت `ScheduleDataAdapter` برای استفاده از مدل جدید استفاده کنید
2. به تدریج کدهای موجود را به مدل جدید منتقل کنید
3. در نهایت مستقیماً از `ScheduleDataManager` استفاده کنید 