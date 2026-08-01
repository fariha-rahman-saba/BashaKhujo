"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { DHAka_AREAS, ROOM_TYPES } from "@/lib/constants";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [area, setArea] = useState(searchParams.get("area") || "");
  const [minRent, setMinRent] = useState(searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(searchParams.get("maxRent") || "");
  const [roomType, setRoomType] = useState(searchParams.get("roomType") || "");
  const [bachelorFriendly, setBachelorFriendly] = useState(
    searchParams.get("bachelorFriendly") === "true"
  );
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (area) params.set("area", area);
    if (minRent) params.set("minRent", minRent);
    if (maxRent) params.set("maxRent", maxRent);
    if (roomType) params.set("roomType", roomType);
    if (bachelorFriendly) params.set("bachelorFriendly", "true");
    router.push(`/search?${params.toString()}`);
  }, [q, area, minRent, maxRent, roomType, bachelorFriendly, router]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by area, title..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        <button
          onClick={applyFilters}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Search
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Area
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">All areas</option>
              {DHAka_AREAS.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Room Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">All types</option>
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Min Budget (BDT)
            </label>
            <input
              type="number"
              value={minRent}
              onChange={(e) => setMinRent(e.target.value)}
              placeholder="5000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Max Budget (BDT)
            </label>
            <input
              type="number"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              placeholder="20000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={bachelorFriendly}
              onChange={(e) => setBachelorFriendly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Bachelor friendly only</span>
          </label>
        </div>
      )}
    </div>
  );
}
