"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  MessageCircle,
  Heart,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import VerifiedBadge from "@/components/VerifiedBadge";
import ReportButton from "@/components/ReportButton";
import EscrowFlow from "@/components/EscrowFlow";
import ReviewForm from "@/components/ReviewForm";
import StarRating from "@/components/StarRating";
import { formatCurrency, formatRoomType, parsePhotos } from "@/lib/utils";

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  rent: number;
  areaName: string;
  latitude: number;
  longitude: number;
  roomType: string;
  bachelorFriendly: boolean;
  photos: string[];
  videoUrl: string | null;
  status: string;
  lister: {
    id: string;
    name: string;
    nidVerified: boolean;
    avgRating: number;
    reviewsReceived: Array<{
      id: string;
      rating: number;
      comment: string | null;
      reviewer: { id: string; name: string };
    }>;
  };
}

export default function ListingDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setListing(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!user) return;

    if (user.role === "SEEKER") {
      fetch("/api/saved")
        .then((r) => r.json())
        .then((savedListings: Array<{ id: string }>) => {
          setSaved(savedListings.some((item) => item.id === id));
        })
        .catch(() => {});
    }

    fetch("/api/transactions")
      .then((r) => r.json())
      .then(
        (
          transactions: Array<{
            listingId: string;
            status: string;
            listerId: string;
            seekerId: string;
          }>
        ) => {
          setCanReview(
            transactions.some(
              (tx) =>
                tx.listingId === id &&
                tx.status === "RELEASED" &&
                (tx.seekerId === user.id || tx.listerId === user.id)
            )
          );
        }
      )
      .catch(() => {});
  }, [user, id]);

  async function handleContact() {
    if (!user) {
      router.push("/login");
      return;
    }

    setContactLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: id }),
    });
    const data = await res.json();
    setContactLoading(false);

    if (res.ok) {
      router.push(`/chat/${data.id}`);
    }
  }

  async function toggleSave() {
    if (!user) {
      router.push("/login");
      return;
    }

    if (saved) {
      await fetch("/api/saved", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      });
      setSaved(false);
    } else {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      });
      setSaved(true);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="aspect-video rounded-xl bg-gray-200" />
          <div className="h-8 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-1/3 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg text-gray-600">Listing not found</p>
        <Link href="/search" className="mt-4 inline-block text-primary hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  const photos = (() => {
    const parsed = parsePhotos(listing.photos);
    return parsed.length > 0 ? parsed : ["/placeholder-room.svg"];
  })();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/search"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to search
      </Link>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="relative aspect-video bg-gray-100">
          <Image
            src={photos[activePhoto]}
            alt={listing.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === activePhoto ? "border-primary" : "border-transparent"
                }`}
              >
                <Image src={photo} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.areaName}, Dhaka
                </span>
                <span className="rounded bg-gray-100 px-2 py-0.5">
                  {formatRoomType(listing.roomType)}
                </span>
                {listing.bachelorFriendly && (
                  <span className="rounded bg-primary-light px-2 py-0.5 text-primary">
                    Bachelor Friendly
                  </span>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(listing.rent)}
              <span className="text-sm font-normal text-gray-500">/month</span>
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
              {listing.description}
            </p>
          </div>

          {listing.videoUrl && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold">Video Tour</h3>
              <video
                src={listing.videoUrl}
                controls
                className="w-full rounded-xl"
              />
            </div>
          )}

          <div className="mb-6 rounded-xl border border-gray-200 p-4">
            <h3 className="mb-3 font-semibold">Lister Reviews</h3>
            {listing.lister.reviewsReceived.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {listing.lister.reviewsReceived.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-sm font-medium">{review.reviewer.name}</span>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <ReportButton listingId={listing.id} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="mb-3 font-semibold">Listed by</h3>
            <p className="font-medium">{listing.lister.name}</p>
            <div className="mt-2 flex items-center gap-2">
              {listing.lister.nidVerified && <VerifiedBadge />}
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {listing.lister.avgRating.toFixed(1)}
              </span>
            </div>

            {listing.status === "ACTIVE" && user?.id !== listing.lister.id && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleContact}
                  disabled={contactLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  {contactLoading ? "Opening chat..." : "Contact Lister"}
                </button>
                <button
                  onClick={toggleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                  {saved ? "Saved" : "Save Listing"}
                </button>
              </div>
            )}
          </div>

          {user?.role === "SEEKER" && listing.status === "ACTIVE" && (
            <EscrowFlow listingId={listing.id} rent={listing.rent} />
          )}

          {user && user.id !== listing.lister.id && canReview && (
            <ReviewForm
              revieweeId={listing.lister.id}
              listingId={listing.id}
              revieweeName={listing.lister.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
