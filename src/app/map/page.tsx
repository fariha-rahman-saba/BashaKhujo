"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatCurrency, formatRoomType } from "@/lib/utils";

interface MapListing {
  id: string;
  title: string;
  rent: number;
  areaName: string;
  latitude: number;
  longitude: number;
  roomType: string;
  bachelorFriendly: boolean;
}

function MapView() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<MapListing[]>([]);
  const [selected, setSelected] = useState<MapListing | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const params = new URLSearchParams();
    searchParams.forEach((v, k) => params.set(k, v));
    if (!params.has("status")) params.set("status", "ACTIVE");

    fetch(`/api/listings?${params.toString()}`)
      .then((r) => r.json())
      .then(setListings);
  }, [searchParams]);

  const center = listings.length
    ? {
        lat: listings.reduce((s, l) => s + l.latitude, 0) / listings.length,
        lng: listings.reduce((s, l) => s + l.longitude, 0) / listings.length,
      }
    : { lat: 23.8103, lng: 90.4125 };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Map View</h1>
      <p className="mb-6 text-sm text-gray-500">
        Browse listings by location in Dhaka
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {apiKey ? (
            <iframe
              title="Listings Map"
              width="100%"
              height="500"
              className="rounded-xl border border-gray-200"
              loading="lazy"
              src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center.lat},${center.lng}&zoom=12`}
            />
          ) : (
            <div className="relative h-[500px] overflow-hidden rounded-xl border border-gray-200 bg-primary-light">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWY2ZjRmIiBzdHJva2Utd2lkdGg9IjAuNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L3N2Zz4=')] opacity-30" />
              {listings.map((listing) => {
                const x = ((listing.longitude - 90.35) / 0.1) * 100;
                const y = ((23.85 - listing.latitude) / 0.08) * 100;
                return (
                  <button
                    key={listing.id}
                    onClick={() => setSelected(listing)}
                    style={{
                      left: `${Math.min(Math.max(x, 5), 95)}%`,
                      top: `${Math.min(Math.max(y, 5), 95)}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-full transition hover:scale-110"
                  >
                    <MapPin
                      className={`h-8 w-8 drop-shadow ${
                        selected?.id === listing.id
                          ? "fill-primary text-primary"
                          : "fill-red-500 text-red-600"
                      }`}
                    />
                  </button>
                );
              })}
              <p className="absolute bottom-3 left-3 rounded bg-white/90 px-2 py-1 text-xs text-gray-600">
                Demo map (add Google Maps API key for live map)
              </p>
            </div>
          )}
        </div>

        <div className="max-h-[500px] space-y-2 overflow-y-auto">
          {listings.map((listing) => (
            <button
              key={listing.id}
              onClick={() => setSelected(listing)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selected?.id === listing.id
                  ? "border-primary bg-primary-light"
                  : "border-gray-200 bg-white hover:border-primary/30"
              }`}
            >
              <p className="font-medium text-gray-900">{listing.title}</p>
              <p className="text-sm text-gray-500">{listing.areaName}</p>
              <p className="text-sm font-medium text-primary">
                {formatCurrency(listing.rent)}/mo ·{" "}
                {formatRoomType(listing.roomType)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="font-semibold">{selected.title}</h3>
          <p className="text-sm text-gray-500">
            {selected.areaName} · {formatCurrency(selected.rent)}/month
          </p>
          <Link
            href={`/listings/${selected.id}`}
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            View details →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading map...</div>}>
      <MapView />
    </Suspense>
  );
}
