/**
 * Auth.js v5 配置
 *
 * 简化版：JWT session + Credentials Provider（邮箱密码）
 * 生产环境应替换为：
 *   - OAuth: 微信扫码 + Google
 *   - DB: Postgres + Drizzle adapter
 */

import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { findUserByEmail, findUserById } from "./storage";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

// JWT interface 已在 next-auth v5 中默认包含 id/email/name 等字段，
// 通过 callbacks.jwt 写入到 token.id / token.role，Session.user 自动继承。
// 无需再 declare module "next-auth/jwt"。

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await findUserByEmail(credentials.email as string);
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      // 每次刷新时同步 user 状态
      if (token.id) {
        const u = await findUserById(token.id as string);
        if (u) {
          token.role = u.role;
          token.name = u.name;
          token.email = u.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);