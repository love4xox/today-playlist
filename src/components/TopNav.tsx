"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "today_playlist_theme_v1";

interface TopNavProps {
  vaultCount: number;
  subtitle?: string;
}

export default function TopNav({ vaultCount, subtitle }: TopNavProps) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem(THEME_STORAGE_KEY, "light");
      }
      return next;
    });
  };

  const navItems = [
    { href: "/", label: "01. LOOKBOOK" },
    { href: "/mixtape", label: "02. MIXTAPE" },
    { href: "/vault", label: "03. VAULT" },
  ];

  return (
    <header className="font-mono-meta mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 text-[10px] leading-relaxed tracking-wider uppercase sm:grid-cols-4">
      <Link
        href="/"
        className="font-grotesk text-xs font-extrabold tracking-tight hover:opacity-75"
      >
        TP26 ®
        <span className="block">ARCHIVE</span>
      </Link>

      <div className="hidden text-[var(--text-muted)] sm:block">
        <span className="block text-[var(--text-main)]">
          TODAY&apos;S PLAYLIST
        </span>
        <span className="block">ZERO-HALLUCINATION ID ENGINE</span>
        <span className="block">VAULT POOL: {vaultCount} TRACKS</span>
      </div>

      <div className="hidden text-[var(--text-muted)] sm:block">
        <span className="block text-[var(--text-main)]">
          {subtitle || "CURATED SOUND EDITION"}
        </span>
        <span className="block">DEDUPLICATION / STRICT LIMIT</span>
      </div>

      <nav className="flex flex-wrap items-start justify-end gap-3 sm:gap-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`transition ${
                active
                  ? "font-bold underline decoration-1 underline-offset-4 text-[var(--text-main)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={toggleTheme}
          className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          {isDark ? "LIGHT" : "DARK"}
        </button>
      </nav>
    </header>
  );
}