"use client";

import { useState } from "react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  revieweeId: string;
  listingId: string;
  revieweeName: string;
  onSuccess?: () => void;
}

export default function ReviewForm({
  revieweeId,
  listingId,
  revieweeName,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revieweeId, listingId, rating, comment }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      onSuccess?.();
    } else {
      setError(data.error || "Failed to submit review");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 p-4">
      <h4 className="mb-3 font-medium">Review {revieweeName}</h4>
      <div className="mb-3">
        <StarRating rating={rating} onChange={setRating} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="mb-3 w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-primary focus:outline-none"
      />
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
