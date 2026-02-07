"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const CREDIT_PACKS = [
  { id: "10", credits: 10, price: "₹99", popular: false },
  { id: "50", credits: 50, price: "₹399", popular: true },
  { id: "100", credits: 100, price: "₹699", popular: false },
];

export default function CreditsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else setUser(user);
    });
  }, [router]);

  const handlePurchase = (packId: string) => {
    // Stripe checkout would go here
    // For now, show placeholder
    alert(`Stripe checkout for pack ${packId} - Add STRIPE_PUBLIC_KEY to enable`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/dashboard" className="text-xl font-bold text-red-600">
          Hinglish Editor
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="mb-2 text-2xl font-bold">Get more credits</h1>
        <p className="mb-8 text-gray-600">
          Use credits for transcription and export. 1 credit = 1 video.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-lg border-2 p-6 ${
                pack.popular
                  ? "border-primary bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {pack.popular && (
                <span className="mb-2 inline-block rounded bg-primary px-2 py-0.5 text-xs text-white">
                  Popular
                </span>
              )}
              <p className="text-2xl font-bold">{pack.credits} credits</p>
              <p className="mb-4 text-gray-600">{pack.price}</p>
              <button
                type="button"
                onClick={() => handlePurchase(pack.id)}
                className="w-full rounded bg-primary py-2 text-white hover:bg-primary-hover"
              >
                Buy now
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Payment powered by Stripe. Add your Stripe keys to enable purchases.
        </p>
      </main>
    </div>
  );
}
