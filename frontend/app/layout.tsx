import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Replace the application name here and in the header below.
export const metadata: Metadata = {
  title: { default: "Mon application", template: "%s · Mon application" },
  description: "Application construite à partir du template Next.js + .NET.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-sm"
        >
          Aller au contenu
        </a>
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex w-full max-w-3xl items-center px-4 py-3">
            <Link href="/" className="text-lg font-semibold">
              Test-M1
            </Link>
          </div>
        </header>
        <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-6 lg:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
