"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

interface ReportButtonProps {
  listingId?: string;
  reportedUserId?: string;
}

export default function ReportButton({
  listingId,
  reportedUserId,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, reportedUserId, reason }),
    });

    setLoading(false);
    if (res.ok) {
      setDone(true);
      setOpen(false);
    }
  }

  if (done) {
    return (
      <span className="text-sm text-green-600">Report submitted. Thank you.</span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
      >
        <Flag className="h-4 w-4" />
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Report Issue</h3>
            <form onSubmit={handleSubmit}>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the issue (min 10 characters)..."
                rows={4}
                required
                minLength={10}
                className="mb-4 w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || reason.length < 10}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
