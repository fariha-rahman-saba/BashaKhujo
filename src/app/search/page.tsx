import { Suspense } from "react";
import SearchFilters from "@/components/SearchFilters";
import SearchResults from "./SearchResults";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Browse Rooms & Flats
      </h1>

      <Suspense fallback={<div className="h-20 animate-pulse rounded-xl bg-gray-200" />}>
        <SearchFilters />
      </Suspense>

      <Suspense fallback={<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
