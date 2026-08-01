"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DHAka_AREAS, ROOM_TYPES } from "@/lib/constants";
import { Upload, X } from "lucide-react";
import Image from "next/image";

export default function CreateListingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rent, setRent] = useState("");
  const [areaName, setAreaName] = useState("");
  const [roomType, setRoomType] = useState("SINGLE_ROOM");
  const [bachelorFriendly, setBachelorFriendly] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!authLoading && (!user || user.role !== "LISTER")) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg text-gray-600">
          Only listers can create listings.
        </p>
        <button
          onClick={() => router.push("/signup?role=lister")}
          className="mt-4 text-primary hover:underline"
        >
          Sign up as a Lister
        </button>
      </div>
    );
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPhotos((prev) => [...prev, data.url]);
      }
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const area = DHAka_AREAS.find((a) => a.name === areaName);

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        rent: parseInt(rent),
        areaName,
        latitude: area?.lat ?? 23.8103,
        longitude: area?.lng ?? 90.4125,
        roomType,
        bachelorFriendly,
        photos,
        videoUrl: videoUrl || undefined,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (res.ok) {
      router.push(`/listings/${data.id}`);
    } else {
      setError(data.error || "Failed to create listing");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Post a New Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={5}
            placeholder="Spacious bachelor room near Mirpur 10"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={20}
            rows={5}
            placeholder="Describe the room, amenities, house rules..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Monthly Rent (BDT)</label>
            <input
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              required
              min={1000}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Area</label>
            <select
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Select area</option>
              {DHAka_AREAS.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Room Type</label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            {ROOM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={bachelorFriendly}
            onChange={(e) => setBachelorFriendly(e.target.checked)}
            className="h-4 w-4 rounded text-primary focus:ring-primary"
          />
          <span className="text-sm">Bachelor friendly</span>
        </label>

        <div>
          <label className="mb-2 block text-sm font-medium">Photos</label>
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg">
                <Image src={photo} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute right-0 top-0 rounded-bl bg-black/50 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary">
              <Upload className="h-5 w-5" />
              <span className="text-xs">{uploading ? "..." : "Add"}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Video URL (optional)
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {submitting ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
