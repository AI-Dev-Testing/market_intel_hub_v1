// src/components/features/nav/main-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Report View" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <span className="text-sm font-semibold text-zinc-100 tracking-wide">
            GPSC Market Intelligence
          </span>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === link.href
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <span className="text-xs text-zinc-500">Q2 2026 Report</span>
      </div>
    </header>
  );
}
