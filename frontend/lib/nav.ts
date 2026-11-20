export type NavItem = {
  href: string;
  label: string;
  // Whether the page being shown belongs to this entry of the menu.
  isActive: (pathname: string) => boolean;
};

// Texts shown to users stay in French; identifiers and comments stay in English.
export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/",
    label: "Saisie",
    // The entry form is reached from the room list, so both belong to "Saisie".
    isActive: (pathname) => pathname === "/" || pathname.startsWith("/consumptions/entry"),
  },
  { href: "/consumptions", label: "Liste", isActive: (pathname) => pathname === "/consumptions" },
  { href: "/results", label: "Résultat", isActive: (pathname) => pathname === "/results" },
];
