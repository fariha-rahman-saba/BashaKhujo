"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSocket, disconnectSocket } from "@/lib/socket-client";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string };
}

interface Conversation {
  id: string;
  listing: { id: string; title: string; photos: string[]; areaName: string };
  seeker: { id: string; name: string };
  lister: { id: string; name: string };
  messages: Message[];
}

export default function ChatRoomPage({ id }: { id: string }) {
  const router = useRouter();
  const { user, token } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetch(`/api/conversations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setConversation(data.conversation);
        setMessages(data.messages);
        setLoading(false);
      });
  }, [id, user, router]);

  useEffect(() => {
    if (!token || !conversation) return;

    const socket = getSocket(token);
    socket.connect();
    socket.emit("join_conversation", id);

    socket.on("new_message", (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      socket.off("new_message");
      disconnectSocket();
    };
  }, [token, conversation, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !conversation || !user || !token) return;

    const otherUser =
      conversation.seeker.id === user.id
        ? conversation.lister
        : conversation.seeker;

    const socket = getSocket(token);
    socket.emit("send_message", {
      conversationId: id,
      content: content.trim(),
      receiverId: otherUser.id,
      listingId: conversation.listing.id,
    });

    setContent("");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p>Conversation not found</p>
      </div>
    );
  }

  const otherUser =
    conversation.seeker.id === user?.id
      ? conversation.lister
      : conversation.seeker;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col px-4 py-4">
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
        <Link
          href={`/listings/${conversation.listing.id}`}
          className="text-sm text-primary hover:underline"
        >
          {conversation.listing.title}
        </Link>
        <p className="text-sm text-gray-500">
          Chat with {otherUser.name} · {conversation.listing.areaName}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`mb-3 flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {!isMine && (
                    <p className="mb-0.5 text-xs font-medium opacity-70">
                      {msg.sender.name}
                    </p>
                  )}
                  {msg.content}
                  <p
                    className={`mt-1 text-xs ${isMine ? "text-white/70" : "text-gray-400"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="rounded-xl bg-primary px-4 py-3 text-white hover:bg-primary-dark disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
