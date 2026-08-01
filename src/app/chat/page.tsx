"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ConversationPreview {
  id: string;
  listing: { id: string; title: string; areaName: string };
  seeker: { id: string; name: string };
  lister: { id: string; name: string };
  messages: Array<{ content: string; createdAt: string }>;
}

export default function ChatListPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetch("/api/conversations")
        .then((r) => r.json())
        .then((data) => {
          setConversations(data);
          setLoading(false);
        });
    }
  }, [user, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <MessageCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-600">No conversations yet</p>
          <Link href="/search" className="mt-2 inline-block text-sm text-primary hover:underline">
            Browse listings to start chatting
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other =
              conv.seeker.id === user?.id ? conv.lister : conv.seeker;
            const lastMsg = conv.messages[0];

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 transition hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{other.name}</p>
                  {lastMsg && (
                    <span className="text-xs text-gray-400">
                      {new Date(lastMsg.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-primary">{conv.listing.title}</p>
                {lastMsg && (
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {lastMsg.content}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
