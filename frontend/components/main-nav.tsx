"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

// The menu of the header. The entry of the current page is highlighted and announced with aria-current.
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation principale">
      <ul className="flex flex-wrap gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const stateClasses = active ? "bg-primary-subtle text-primary" : "text-foreground hover:bg-background";

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold transition-colors ${stateClasses}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
