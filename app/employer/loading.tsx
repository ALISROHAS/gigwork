import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
    </div>
  );
}