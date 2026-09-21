import { cn } from "@/lib/utils";
export function Switch({ checked, onCheckedChange, className }: { checked: boolean; onCheckedChange: (v: boolean) => void; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
