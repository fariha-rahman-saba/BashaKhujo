"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ListingCard, { ListingCardSkeleton } from "@/components/ListingCard";
import type { ListingCardData } from "@/components/ListingCard";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => params.set(key, value));

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      setListings(data);
      setLoading(false);
    }

    fetchListings();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-lg text-gray-600">No listings found</p>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your filters or search in a different area
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mt-6 text-sm text-gray-500">
        {listings.length} listing{listings.length !== 1 ? "s" : ""} found
      </p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
