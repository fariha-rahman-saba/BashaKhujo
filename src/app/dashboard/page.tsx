"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Home,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ListingCard, { ListingCardSkeleton } from "@/components/ListingCard";
import type { ListingCardData } from "@/components/ListingCard";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  advanceAmount: number;
  status: string;
  listing: { id: string; title: string; areaName: string };
  seeker: { id: string; name: string };
  lister: { id: string; name: string };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [savedListings, setSavedListings] = useState<ListingCardData[]>([]);
  const [myListings, setMyListings] = useState<ListingCardData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [nidNumber, setNidNumber] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      Promise.all([
        user.role === "SEEKER"
          ? fetch("/api/saved").then((r) => r.json())
          : Promise.resolve([]),
        user.role === "LISTER"
          ? fetch(`/api/listings?listerId=${user.id}`).then((r) => r.json())
          : Promise.resolve([]),
        fetch("/api/transactions").then((r) => r.json()),
      ]).then(([saved, listings, txs]) => {
        setSavedListings(saved);
        setMyListings(listings);
        setTransactions(txs);
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  async function handleVerify() {
    setVerifying(true);
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nidNumber }),
    });
    setVerifying(false);
    if (res.ok) {
      window.location.reload();
    }
  }

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.name} ·{" "}
            {user?.role === "SEEKER" ? "Room Seeker" : "Lister"}
          </p>
        </div>
        {user?.role === "LISTER" && (
          <Link
            href="/listings/create"
            className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <PlusCircle className="h-4 w-4" />
            New Listing
          </Link>
        )}
      </div>

      {user?.role === "LISTER" && !user.nidVerified && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                Get Verified
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                Verified listers get more inquiries. Submit your NID for
                verification (mock approval for MVP).
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  placeholder="NID number"
                  className="rounded-lg border border-amber-200 px-3 py-2 text-sm focus:outline-none"
                />
                <button
                  onClick={handleVerify}
                  disabled={verifying || nidNumber.length < 10}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {verifying ? "Verifying..." : "Verify NID"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {user?.role === "SEEKER" && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Heart className="h-5 w-5 text-primary" />
            Saved Listings
          </h2>
          {savedListings.length === 0 ? (
            <p className="text-sm text-gray-500">
              No saved listings yet.{" "}
              <Link href="/search" className="text-primary hover:underline">
                Browse rooms
              </Link>
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>
      )}

      {user?.role === "LISTER" && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Home className="h-5 w-5 text-primary" />
            My Listings
          </h2>
          {myListings.length === 0 ? (
            <p className="text-sm text-gray-500">
              No listings yet.{" "}
              <Link
                href="/listings/create"
                className="text-primary hover:underline"
              >
                Post your first listing
              </Link>
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="h-5 w-5 text-primary" />
          Messages
        </h2>
        <Link
          href="/chat"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View all conversations →
        </Link>
      </section>

      {transactions.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Transactions</h2>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium">{tx.listing.title}</p>
                  <p className="text-sm text-gray-500">
                    {tx.listing.areaName} ·{" "}
                    {user?.role === "SEEKER"
                      ? `Lister: ${tx.lister.name}`
                      : `Seeker: ${tx.seeker.name}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(tx.advanceAmount)}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      tx.status === "HELD"
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  >
                    {tx.status === "HELD" ? "Held by platform" : "Released"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
