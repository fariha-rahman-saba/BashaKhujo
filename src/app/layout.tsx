import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BashaKhujo — Find Safe Bachelor Rooms in Dhaka",
  description:
    "A trusted rental platform helping bachelors find safe rooms and flats in Dhaka, Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-8">
            <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
              <p className="font-medium text-primary">BashaKhujo</p>
              <p className="mt-1">
                Safe, verified bachelor-friendly rentals in Dhaka
              </p>
              <p className="mt-2">&copy; {new Date().getFullYear()} BashaKhujo</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
