import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// این میدلور از NextAuth.js استفاده می‌کند و به صورت خودکار جلسات را بررسی می‌کند
export default withAuth(
  // دارای تابع withAuth و آنچه که جلسه را در درخواست قرار می‌دهد
  function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // مسیرهای عمومی که نیاز به احراز هویت ندارند
    const publicPaths = ["/", "/welcome", "/auth/signin", "/auth/signup", "/auth/error", "/about-app", "/about-me"];
    const isPublicPath = publicPaths.some(path => 
      pathname === path || 
      pathname.startsWith("/api/") || 
      pathname.startsWith("/_next") ||
      pathname.includes(".") // فایل‌های استاتیک
    );

    // اگر مسیر عمومی باشد، اجازه دسترسی بدهید و احراز هویت نیاز نیست
    if (isPublicPath) {
      return NextResponse.next();
    }
    
    // دسترسی کاربر از NextAuth دریافت می‌شود
    const token = req.nextauth.token;
    
    // بررسی سطح دسترسی برای مسیرهای حساس
    // مسیرهای مدیریتی که فقط مدیر اصلی می‌تواند به آنها دسترسی داشته باشد
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }

    // مسیرهای کارشناسان سازمان
    if (pathname.startsWith("/organization") && 
        token?.role !== "ADMIN" && 
        token?.role !== "ORG_EXPERT") {
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }

    // مسیرهای مدیران مؤسسات
    if (pathname.startsWith("/institute-admin") && 
        token?.role !== "ADMIN" && 
        token?.role !== "ORG_EXPERT" && 
        token?.role !== "INSTITUTE_ADMIN") {
      return NextResponse.redirect(new URL("/access-denied", req.url));
    }

    // ادامه پردازش درخواست
    return NextResponse.next();
  },
  {
    callbacks: {
      // این تابع تنها حد احراز هویت را مشخص می‌کند
      authorized: ({ token }) => !!token,
    },
  }
);

// پیکربندی مسیرهایی که میدلور باید روی آنها اعمال شود
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}; 