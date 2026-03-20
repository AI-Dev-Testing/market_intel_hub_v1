// src/components/features/nav/main-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useData } from "@/contexts/data-context";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Report View" },
  { href: "/admin", label: "Admin" },
];

export function MainNav() {
  const pathname = usePathname();
  const { reportMeta } = useData();

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
                  pathname === link.href || (link.href === "/admin" && pathname.startsWith("/admin"))
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <span className="text-xs text-zinc-500">{reportMeta.period} Report</span>
      </div>
    </header>
  );
}
