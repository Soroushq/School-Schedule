import { z } from "zod";
import { UserRole } from "./auth";

// اعتبارسنجی فرم ورود
export const signInSchema = z.object({
  loginType: z.enum(["email", "personnelCode"], {
    required_error: "لطفاً نوع ورود را انتخاب کنید",
  }),
  identifier: z.string().min(1, "لطفاً این فیلد را پر کنید"),
  password: z.string().min(1, "رمز عبور الزامی است"),
  organizationCode: z.string().optional(),
});

// اعتبارسنجی فرم ثبت‌نام
export const signUpSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  email: z.string().email("ایمیل نامعتبر است"),
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .regex(/[A-Z]/, "رمز عبور باید حداقل یک حرف بزرگ داشته باشد")
    .regex(/[a-z]/, "رمز عبور باید حداقل یک حرف کوچک داشته باشد")
    .regex(/[0-9]/, "رمز عبور باید حداقل یک عدد داشته باشد"),
  passwordConfirm: z.string(),
  personnelCode: z.string().optional(),
  organizationCode: z.string().optional(),
  role: z.nativeEnum(UserRole, {
    required_error: "انتخاب نقش الزامی است",
  }),
}).refine(data => data.password === data.passwordConfirm, {
  message: "رمز عبور و تکرار آن باید یکسان باشند",
  path: ["passwordConfirm"],
});

// اعتبارسنجی فرم بازیابی رمز عبور
export const forgotPasswordSchema = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
});

// اعتبارسنجی فرم تغییر رمز عبور
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .regex(/[A-Z]/, "رمز عبور باید حداقل یک حرف بزرگ داشته باشد")
    .regex(/[a-z]/, "رمز عبور باید حداقل یک حرف کوچک داشته باشد")
    .regex(/[0-9]/, "رمز عبور باید حداقل یک عدد داشته باشد"),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, {
  message: "رمز عبور و تکرار آن باید یکسان باشند",
  path: ["passwordConfirm"],
}); 