import { UserRole } from "@/lib/auth";

// تعریف تایپ کلی برای کامپوننت‌های مدال
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

// تعریف تایپ برای کاربر
export interface UserData {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: UserRole;
  personnelCode?: string;
  organizationCode?: string;
}

// تایپ برای فرم ورود
export interface SignInFormData {
  loginType: "email" | "personnelCode";
  identifier: string;
  password: string;
  organizationCode?: string;
}

// تایپ برای فرم ثبت‌نام
export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  personnelCode?: string;
  organizationCode?: string;
  role: UserRole;
} 