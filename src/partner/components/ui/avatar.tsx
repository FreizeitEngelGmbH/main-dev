import { cn } from "@/lib/utils";
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary", className)}>
      {initials}
    </div>
  );
}
