"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";
import VaultPanel from "@/components/VaultPanel";
import { Track } from "@/lib/types";

const VAULT_STORAGE_KEY = "today_playlist_vault_v1";

export default function VaultGalleryPage() {
  const [vault, setVault] = useState<Track[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedVault = localStorage.getItem(VAULT_STORAGE_KEY);
      if (savedVault) {
        setVault(JSON.parse(savedVault));
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));
    } catch (e) {
      console.error("Failed to save vault:", e);
    }
  }, [vault, hydrated]);

  const handleAddTrack = (newTrack: Track) => {
    setVault((prev) => [newTrack, ...prev]);
  };

  const handleDeleteTrack = (id: string) => {
    setVault((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      style={{ backgroundColor: "var(--bg-vault)" }}
      className="min-h-screen px-5 py-6 sm:px-10 sm:py-8"
    >
      <TopNav
        vaultCount={vault.length}
        subtitle="ORDER & CHAOS · SOUND VAULT"
      />

      <main className="mx-auto mt-10 max-w-6xl pb-16">
        <VaultPanel
          vault={vault}
          onAddTrack={handleAddTrack}
          onDeleteTrack={handleDeleteTrack}
        />
      </main>
    </div>
  );
}