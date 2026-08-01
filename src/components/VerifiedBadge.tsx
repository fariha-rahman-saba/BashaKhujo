import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary",
        className
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      Verified Lister
    </span>
  );
}
