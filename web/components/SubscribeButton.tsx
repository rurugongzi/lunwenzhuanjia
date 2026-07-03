"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PlanProps {
  planId: "trial" | "student" | "scholar" | "institution";
  name: string;
  price: string;
  period: string;
  cta: string;
  highlight?: boolean;
}

export function SubscribeButton({ planId, name, price, period, cta, highlight }: PlanProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubscribe() {
    setMsg("");
    if (status !== "authenticated") {
      router.push(`/signup?plan=${planId}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(`❌ ${data.error}`);
        return;
      }
      setMsg(`✅ ${data.message}`);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setMsg(`❌ ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={onSubscribe}
        disabled={loading}
        className={`w-full ${highlight ? "btn-primary" : "btn-secondary"} disabled:opacity-50`}
      >
        {loading ? "处理中…" : cta}
      </button>
      {msg && (
        <p className="text-xs mt-2 text-center text-gray-700">{msg}</p>
      )}
    </div>
  );
}