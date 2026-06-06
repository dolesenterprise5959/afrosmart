import { Logo } from "@/components/ui/Logo";

// Branded splash / loading screen shown while a route resolves.
export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4">
      <div className="animate-pulse">
        <Logo href={null} size="lg" />
      </div>
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/3 animate-[loading_1.1s_ease-in-out_infinite] rounded-full bg-brand" />
      </div>
      <p className="text-sm text-muted">Buy. Sell. Connect Across Africa.</p>
    </div>
  );
}
