"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-lg text-gray-900">引用通</span>
            <span className="text-xs text-gray-400 ml-1">CiteTong</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/check" className="text-gray-700 hover:text-primary-600">
              校验论文
            </Link>
            <Link href="/journals" className="text-gray-700 hover:text-primary-600">
              期刊库
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-primary-600">
              定价
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                  {session?.user?.name || "Dashboard"}
                </Link>
                {session?.user?.role === "admin" && (
                  <Link href="/admin" className="text-orange-600 hover:text-orange-700">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-700 hover:text-red-600"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-primary-600">
                  登录
                </Link>
                <Link href="/check" className="btn-primary !py-1.5 !px-4 !text-sm">
                  立即试用
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}