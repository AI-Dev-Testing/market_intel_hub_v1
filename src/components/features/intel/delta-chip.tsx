// src/components/features/intel/delta-chip.tsx
import { cn } from "@/lib/utils";
import { DeltaDirection } from "@/lib/data/intel-seed";

const ARROW: Record<DeltaDirection, string> = {
  up:   "↑",
  down: "↓",
  flat: "→",
};

const STYLES: Record<DeltaDirection, string> = {
  up:   "text-red-400",
  down: "text-green-400",
  flat: "text-zinc-400",
};

interface DeltaChipProps {
  direction: DeltaDirection;
  value: number;
  label?: string; // e.g. "QoQ"
}

export function DeltaChip({ direction, value, label = "QoQ" }: DeltaChipProps) {
  const sign = value > 0 ? "+" : value < 0 ? "" : "±";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", STYLES[direction])}>
      <span>{ARROW[direction]}</span>
      <span>{sign}{value}</span>
      {label && <span className="text-zinc-500 font-normal">{label}</span>}
    </span>
  );
}
