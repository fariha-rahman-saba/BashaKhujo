import Link from "next/link";
import { Search, Shield, MessageCircle, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parsePhotos } from "@/lib/utils";
import ListingCard from "@/components/ListingCard";

async function getFeaturedListings() {
  try {
    return await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: {
        lister: {
          select: {
            id: true,
            name: true,
            nidVerified: true,
            avgRating: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const listings = await getFeaturedListings();

  return (
    <div>
      <section className="bg-gradient-to-b from-primary-light to-background px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Find Your Safe Bachelor Room in{" "}
            <span className="text-primary">Dhaka</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600 md:text-xl">
            BashaKhujo connects genuine seekers with verified listers. Browse
            bachelor-friendly rooms, chat securely, and rent with confidence.
          </p>

          <form action="/search" className="mx-auto flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                placeholder="Search Mirpur, Uttara, Dhanmondi..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3.5 font-medium text-white shadow-sm hover:bg-primary-dark"
            >
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup?role=seeker"
              className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light"
            >
              I&apos;m looking for a room
            </Link>
            <Link
              href="/signup?role=lister"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              I have a room to rent
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Why BashaKhujo?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "Verified Listers",
              desc: "NID-verified landlords with ratings from past tenants",
            },
            {
              icon: MessageCircle,
              title: "Secure Chat",
              desc: "Message listers in-app without sharing phone numbers upfront",
            },
            {
              icon: Star,
              title: "Trusted Reviews",
              desc: "Honest ratings from both seekers and listers after move-in",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-200 bg-white p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {listings.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Latest Listings
            </h2>
            <Link
              href="/search"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={{ ...listing, photos: parsePhotos(listing.photos) }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
