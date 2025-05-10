import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const { to, subject, data } = await req.json();
    
    if (!to || !subject || !data) {
      return NextResponse.json(
        { error: 'اطلاعات کافی فراهم نشده است' },
        { status: 400 }
      );
    }
    
    // تبدیل اطلاعات به متن قابل خواندن
    const deviceInfoText = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    // برای محیط توسعه، به جای ارسال ایمیل، داده‌ها را در کنسول نمایش می‌دهیم
    console.log('درخواست ارسال اطلاعات آنالیتیکس دریافت شد:');
    console.log(`ایمیل گیرنده: ${to}`);
    console.log(`موضوع: ${subject}`);
    console.log('داده‌ها:', data);
    
    // تلاش برای ذخیره اطلاعات در فایل (اگر دسترسی وجود داشته باشد)
    try {
      // ایجاد دایرکتوری داده‌ها اگر وجود نداشته باشد
      const dataDir = path.join(process.cwd(), 'analytics_data');
      
      try {
        await fsPromises.mkdir(dataDir, { recursive: true });
      } catch (mkdirError) {
        console.error('خطا در ایجاد دایرکتوری:', mkdirError);
      }
      
      // ایجاد نام فایل با تاریخ و زمان
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `analytics_${timestamp}_${data.sessionId}.json`;
      const filePath = path.join(dataDir, fileName);
      
      // ذخیره اطلاعات در فایل
      await fsPromises.writeFile(
        filePath,
        JSON.stringify({ to, subject, data }, null, 2),
        'utf8'
      );
      
      console.log(`اطلاعات آنالیتیکس در فایل "${fileName}" ذخیره شد.`);
    } catch (fileError) {
      console.error('خطا در ذخیره‌سازی فایل:', fileError);
      // ادامه دادن به پردازش درخواست حتی اگر ذخیره‌سازی فایل با خطا مواجه شد
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'اطلاعات آنالیتیکس با موفقیت دریافت و ثبت شد'
    });
    
  } catch (error) {
    console.error('خطا در پردازش درخواست:', error);
    return NextResponse.json(
      { 
        error: 'خطا در پردازش درخواست', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 