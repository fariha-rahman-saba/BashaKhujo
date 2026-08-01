"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Flag, CheckCircle } from "lucide-react";

interface Report {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { name: string; email: string };
  listing: { title: string } | null;
  reportedUser: { name: string; email: string } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
      return;
    }

    if (user?.role === "ADMIN") {
      fetch("/api/reports")
        .then((r) => r.json())
        .then((data) => {
          setReports(data);
          setLoading(false);
        });
    }
  }, [user, authLoading, router]);

  async function updateStatus(reportId: string, status: string) {
    await fetch("/api/reports", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
  }

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Panel</h1>
      <p className="mb-6 text-sm text-gray-500">
        Review reported listings and users
      </p>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Flag className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-gray-600">No reports to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      report.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {report.status}
                  </span>
                  <p className="mt-2 text-sm">
                    <strong>Reporter:</strong> {report.reporter.name} (
                    {report.reporter.email})
                  </p>
                  {report.listing && (
                    <p className="text-sm">
                      <strong>Listing:</strong> {report.listing.title}
                    </p>
                  )}
                  {report.reportedUser && (
                    <p className="text-sm">
                      <strong>User:</strong> {report.reportedUser.name}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-600">{report.reason}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                {report.status === "pending" && (
                  <button
                    onClick={() => updateStatus(report.id, "resolved")}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
