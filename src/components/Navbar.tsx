"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  MessageCircle,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Shield,
  Map,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/map", label: "Map", icon: Map },
    { href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold">
            BK
          </div>
          <span className="text-lg font-semibold text-primary">BashaKhujo</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/admin"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!loading && user && user.role === "LISTER" && (
            <Link
              href="/listings/create"
              className="hidden items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark sm:flex"
            >
              <PlusCircle className="h-4 w-4" />
              Post Listing
            </Link>
          )}

          {!loading && user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-gray-600 sm:inline">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Sign Up
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
