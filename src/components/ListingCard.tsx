import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, ShieldCheck, Users } from "lucide-react";
import { formatCurrency, formatRoomType, cn, parsePhotos } from "@/lib/utils";

export interface ListingCardData {
  id: string;
  title: string;
  rent: number;
  areaName: string;
  roomType: string;
  bachelorFriendly: boolean;
  photos: string[];
  status: string;
  lister: {
    id: string;
    name: string;
    nidVerified: boolean;
    avgRating: number;
  };
}

interface ListingCardProps {
  listing: ListingCardData;
  className?: string;
}

export default function ListingCard({ listing, className }: ListingCardProps) {
  const photo = parsePhotos(listing.photos)[0] || "/placeholder-room.svg";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        "group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={photo}
          alt={listing.title}
          fill
          className="object-cover transition group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {listing.bachelorFriendly && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
            Bachelor Friendly
          </span>
        )}
        {listing.status === "RENTED" && (
          <span className="absolute right-2 top-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs font-medium text-white">
            Rented
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-primary">
            {listing.title}
          </h3>
          <span className="shrink-0 font-bold text-primary">
            {formatCurrency(listing.rent)}
            <span className="text-xs font-normal text-gray-500">/mo</span>
          </span>
        </div>

        <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          {listing.areaName}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
            {formatRoomType(listing.roomType)}
          </span>
          <div className="flex items-center gap-2 text-gray-500">
            {listing.lister.nidVerified && (
              <span className="flex items-center gap-0.5 text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {listing.lister.avgRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-3 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}
