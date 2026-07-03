/**
 * CiteTong 简单 JSON 存储层（开发用）
 *
 * 生产环境应替换为 Postgres + Drizzle ORM（schema 在 db/schema.ts）。
 * 本文件接口稳定，迁移只需替换实现。
 */

import { promises as fs } from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

export type PlanId = "trial" | "student" | "scholar" | "institution";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: PlanId;
  status: "active" | "expired" | "cancelled";
  started_at: string;
  expires_at: string;
  quota_total: number;
  quota_used: number;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  journal: string;
  citations_count: number;
  at: string;
}

const PLAN_CONFIG: Record<PlanId, { price: number; quota: number; days: number }> = {
  trial:       { price: 1,    quota: 5,    days: 7 },
  student:     { price: 39,   quota: 30,   days: 30 },
  scholar:     { price: 99,   quota: 100,  days: 30 },
  institution: { price: 399,  quota: 500,  days: 30 },
};

export function planConfig(plan: PlanId) {
  return PLAN_CONFIG[plan];
}

async function ensureFile<T>(name: string, defaultValue: T): Promise<T> {
  const fp = path.join(DATA_DIR, name);
  try {
    const data = await fs.readFile(fp, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    await fs.writeFile(fp, JSON.stringify(defaultValue, null, 2), "utf-8");
    return defaultValue;
  }
}

async function saveFile<T>(name: string, data: T): Promise<void> {
  const fp = path.join(DATA_DIR, name);
  await fs.writeFile(fp, JSON.stringify(data, null, 2), "utf-8");
}

// ──────────── Users ────────────

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await ensureFile<User[]>("users.json", []);
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await ensureFile<User[]>("users.json", []);
  return users.find((u) => u.id === id) || null;
}

export async function listUsers(): Promise<User[]> {
  return ensureFile<User[]>("users.json", []);
}

export async function createUser(input: {
  email: string;
  password_hash: string;
  name: string;
  role?: "user" | "admin";
}): Promise<User> {
  const users = await ensureFile<User[]>("users.json", []);
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("EMAIL_EXISTS");
  }
  const user: User = {
    id: randomUUID(),
    email: input.email,
    password_hash: input.password_hash,
    name: input.name,
    role: input.role || "user",
    created_at: new Date().toISOString(),
  };
  users.push(user);
  await saveFile("users.json", users);
  // 默认给一个 trial 订阅
  await createSubscription(user.id, "trial");
  return user;
}

// ──────────── Subscriptions ────────────

export async function listSubscriptions(): Promise<Subscription[]> {
  return ensureFile<Subscription[]>("subscriptions.json", []);
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const subs = await listSubscriptions();
  const now = new Date();
  return (
    subs.find(
      (s) =>
        s.user_id === userId &&
        s.status === "active" &&
        new Date(s.expires_at) > now,
    ) || null
  );
}

export async function createSubscription(
  userId: string,
  plan: PlanId,
): Promise<Subscription> {
  const subs = await ensureFile<Subscription[]>("subscriptions.json", []);
  // 把现有 active 标过期
  for (const s of subs) {
    if (s.user_id === userId && s.status === "active") {
      s.status = "expired";
    }
  }
  const cfg = PLAN_CONFIG[plan];
  const sub: Subscription = {
    id: randomUUID(),
    user_id: userId,
    plan,
    status: "active",
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + cfg.days * 86400_000).toISOString(),
    quota_total: cfg.quota,
    quota_used: 0,
  };
  subs.push(sub);
  await saveFile("subscriptions.json", subs);
  return sub;
}

export async function incrementUsage(userId: string, citations: number): Promise<Subscription | null> {
  const subs = await ensureFile<Subscription[]>("subscriptions.json", []);
  const sub = subs.find((s) => s.user_id === userId && s.status === "active");
  if (!sub) return null;
  sub.quota_used += 1; // 按"次"计算
  await saveFile("subscriptions.json", subs);
  await recordUsage(userId, citations);
  return sub;
}

// ──────────── Usage ────────────

export async function recordUsage(userId: string, citations: number): Promise<void> {
  const records = await ensureFile<UsageRecord[]>("usage.json", []);
  records.push({
    id: randomUUID(),
    user_id: userId,
    journal: "(unknown)",
    citations_count: citations,
    at: new Date().toISOString(),
  });
  // 只保留最近 1000 条
  await saveFile("usage.json", records.slice(-1000));
}

export async function listUsage(userId?: string): Promise<UsageRecord[]> {
  const records = await ensureFile<UsageRecord[]>("usage.json", []);
  return userId ? records.filter((r) => r.user_id === userId) : records;
}

// ──────────── Stats ────────────

export async function getStats() {
  const users = await listUsers();
  const subs = await listSubscriptions();
  const usage = await listUsage();
  const active = subs.filter((s) => s.status === "active");
  return {
    user_count: users.length,
    active_subscription_count: active.length,
    usage_count: usage.length,
    by_plan: active.reduce(
      (acc, s) => {
        acc[s.plan] = (acc[s.plan] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };
}