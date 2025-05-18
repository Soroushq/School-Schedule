import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { UserRole } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  // پاکسازی دیتابیس قبل از اضافه کردن اطلاعات جدید
  await prisma.user.deleteMany();

  // ایجاد کاربر مدیر
  const adminPassword = await hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'مدیر سیستم',
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log(`کاربر مدیر با ایمیل ${admin.email} ایجاد شد`);

  // ایجاد کاربر کارشناس سازمان
  const expertPassword = await hash('Expert@123', 10);
  const expert = await prisma.user.create({
    data: {
      name: 'کارشناس سازمان',
      email: 'expert@example.com',
      password: expertPassword,
      personnelCode: 'EXP12345',
      organizationCode: 'ORG001',
      role: UserRole.ORG_EXPERT,
    },
  });
  console.log(`کاربر کارشناس با ایمیل ${expert.email} ایجاد شد`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 