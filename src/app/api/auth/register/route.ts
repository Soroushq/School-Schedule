import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcrypt';
import { signUpSchema } from '@/lib/validations';
import { UserRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // اعتبارسنجی داده‌های ورودی
    const result = signUpSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'اطلاعات ورودی نامعتبر است', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { name, email, password, personnelCode, organizationCode, role } = result.data;
    
    // بررسی آیا کاربری با این ایمیل یا کد پرسنلی وجود دارد
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است' },
        { status: 409 }
      );
    }
    
    if (personnelCode) {
      const existingUserByPersonnelCode = await prisma.user.findUnique({
        where: { personnelCode },
      });
      
      if (existingUserByPersonnelCode) {
        return NextResponse.json(
          { message: 'کاربری با این کد پرسنلی قبلاً ثبت‌نام کرده است' },
          { status: 409 }
        );
      }
    }
    
    // فقط مدیر اصلی می‌تواند نقش کارشناس سازمان یا خودش را ایجاد کند (بعداً این بخش را با احراز هویت تکمیل می‌کنیم)
    if (role === UserRole.ADMIN) {
      return NextResponse.json(
        { message: 'شما نمی‌توانید با نقش مدیر اصلی ثبت‌نام کنید' },
        { status: 403 }
      );
    }
    
    // رمزنگاری رمز عبور
    const hashedPassword = await hash(password, 10);
    
    // ایجاد کاربر جدید
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        personnelCode,
        organizationCode,
        role,
      },
    });
    
    // حذف رمز عبور از پاسخ
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      { message: 'کاربر با موفقیت ثبت‌نام شد', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('خطا در ثبت‌نام:', error);
    return NextResponse.json(
      { message: 'خطای سرور در هنگام ثبت‌نام' },
      { status: 500 }
    );
  }
} 