import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { compare } from "bcrypt";

// تعریف نوع‌های مورد نیاز برای NextAuth
export enum UserRole {
  ADMIN = "ADMIN",
  ORG_EXPERT = "ORG_EXPERT",
  INSTITUTE_ADMIN = "INSTITUTE_ADMIN",
  EDUCATOR = "EDUCATOR",
  USER = "USER"
}

// تمدید تایپ‌های NextAuth
declare module "next-auth" {
  interface User {
    role?: UserRole;
    personnelCode?: string;
    organizationCode?: string;
  }

  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      personnelCode?: string;
      organizationCode?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    personnelCode?: string;
    organizationCode?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        loginType: { label: "Login Type", type: "text" },
        identifier: { label: "Email or Personnel Code", type: "text" },
        password: { label: "Password", type: "password" },
        organizationCode: { label: "Organization Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("لطفاً اطلاعات ورود را وارد کنید");
        }

        const { loginType, identifier, password, organizationCode } = credentials;
        let user;

        if (loginType === "email") {
          // ورود با ایمیل
          user = await prisma.user.findUnique({
            where: {
              email: identifier,
            },
          });
        } else if (loginType === "personnelCode") {
          // ورود با کد پرسنلی
          user = await prisma.user.findUnique({
            where: {
              personnelCode: identifier,
              ...(organizationCode ? { organizationCode } : {}),
            },
          });
        } else {
          throw new Error("روش ورود نامعتبر است");
        }

        if (!user) {
          throw new Error("کاربری با این مشخصات یافت نشد");
        }

        if (!user.password) {
          throw new Error("این حساب کاربری نیاز به ورود از طریق روش دیگری دارد");
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("رمز عبور اشتباه است");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          personnelCode: user.personnelCode,
          organizationCode: user.organizationCode,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.personnelCode = user.personnelCode;
        token.organizationCode = user.organizationCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.personnelCode = token.personnelCode;
        session.user.organizationCode = token.organizationCode;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 