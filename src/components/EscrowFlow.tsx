"use client";

import { useState } from "react";
import { Lock, CheckCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EscrowFlowProps {
  listingId: string;
  rent: number;
  onTransactionCreated?: () => void;
}

export default function EscrowFlow({
  listingId,
  rent,
  onTransactionCreated,
}: EscrowFlowProps) {
  const [step, setStep] = useState<"idle" | "held" | "released">("idle");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const advanceAmount = Math.round(rent * 0.5);

  async function handlePayAdvance() {
    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, advanceAmount }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setTransactionId(data.id);
      setStep("held");
      onTransactionCreated?.();
    }
  }

  async function handleConfirmMoveIn() {
    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId,
        action: "confirm_move_in",
      }),
    });
    setLoading(false);

    if (res.ok) {
      setStep("released");
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
        <Lock className="h-4 w-4 text-primary" />
        Secure Advance Payment
      </h4>
      <p className="mb-4 text-sm text-gray-600">
        Pay advance through BashaKhujo escrow. Funds are held until you confirm
        move-in, then released to the lister.
      </p>

      <div className="mb-4 flex items-center gap-2 text-sm">
        <span
          className={`rounded-full px-2 py-0.5 ${step === "idle" ? "bg-primary text-white" : "bg-gray-200 text-gray-600"}`}
        >
          1. Pay
        </span>
        <ArrowRight className="h-3 w-3 text-gray-400" />
        <span
          className={`rounded-full px-2 py-0.5 ${step === "held" ? "bg-amber-500 text-white" : step === "released" ? "bg-gray-200 text-gray-600" : "bg-gray-200 text-gray-600"}`}
        >
          2. Held
        </span>
        <ArrowRight className="h-3 w-3 text-gray-400" />
        <span
          className={`rounded-full px-2 py-0.5 ${step === "released" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"}`}
        >
          3. Released
        </span>
      </div>

      {step === "idle" && (
        <button
          onClick={handlePayAdvance}
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : `Pay Advance ${formatCurrency(advanceAmount)} (Mock)`}
        </button>
      )}

      {step === "held" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <Lock className="h-4 w-4" />
            {formatCurrency(advanceAmount)} is held securely by BashaKhujo
          </div>
          <button
            onClick={handleConfirmMoveIn}
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Confirming..." : "Confirm Move-in & Release Payment"}
          </button>
        </div>
      )}

      {step === "released" && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle className="h-4 w-4" />
          Payment released to lister. You can now leave a review!
        </div>
      )}
    </div>
  );
}
