"use client";

import { useState } from "react";
import { Loader2, Plus, Search, Trash2, X } from "lucide-react";
import AlbumArtwork from "@/components/AlbumArtwork";
import { MoodType, Track } from "@/lib/types";

interface VaultPanelProps {
  vault: Track[];
  onAddTrack: (track: Track) => void;
  onDeleteTrack: (id: string) => void;
}

const ALL_MOODS: MoodType[] = ["집중", "잔잔함", "신남", "위로", "드라이브"];

const SCATTER_OFFSETS = [
  "md:translate-y-0",
  "md:translate-y-12",
  "md:-translate-y-4",
  "md:translate-y-8",
  "md:translate-y-2",
  "md:translate-y-14",
];

export default function VaultPanel({
  vault,
  onAddTrack,
  onDeleteTrack,
}: VaultPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Indie");
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>(["잔잔함"]);
  const [coverUrl, setCoverUrl] = useState("");
  const [note, setNote] = useState("");
  const [searchingCover, setSearchingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleMood = (mood: MoodType) => {
    setSelectedMoods((prev) =>
      prev.includes(mood)
        ? prev.length > 1
          ? prev.filter((m) => m !== mood)
          : prev
        : [...prev, mood]
    );
  };

  const fetchCoverByMeta = async (
    targetTitle: string,
    targetArtist: string
  ): Promise<string | undefined> => {
    try {
      const params = new URLSearchParams({
        title: targetTitle,
        artist: targetArtist,
      });
      const res = await fetch(`/api/cover?${params.toString()}`);
      if (!res.ok) return undefined;
      const data: { coverUrl?: string | null } = await res.json();
      return data.coverUrl || undefined;
    } catch {
      return undefined;
    }
  };

  const handlePreviewCover = async () => {
    if (!title.trim() && !artist.trim()) return;
    setSearchingCover(true);
    const found = await fetchCoverByMeta(title.trim(), artist.trim());
    if (found) {
      setCoverUrl(found);
    }
    setSearchingCover(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || submitting) return;

    setSubmitting(true);
    let finalCoverUrl = coverUrl.trim() || undefined;
    if (!finalCoverUrl) {
      finalCoverUrl = await fetchCoverByMeta(title.trim(), artist.trim());
    }

    const newTrack: Track = {
      id: `trk-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      artist: artist.trim(),
      genre: genre.trim() || "Pop",
      moodTags: selectedMoods,
      coverUrl: finalCoverUrl,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onAddTrack(newTrack);
    setTitle("");
    setArtist("");
    setCoverUrl("");
    setNote("");
    setSubmitting(false);
    setIsOpen(false);
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h2 className="font-grotesk text-2xl font-bold tracking-tight sm:text-3xl">
            Order &amp; Chaos
          </h2>
          <p className="font-mono-meta mt-1 text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
            SOUND VAULT ARCHIVE · {vault.length} ALBUMS STORED
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="font-mono-meta inline-flex items-center gap-1.5 border border-[var(--text-main)] px-3.5 py-1.5 text-[11px] font-medium tracking-wider uppercase transition hover:bg-[var(--text-main)] hover:text-[var(--bg-vault)]"
        >
          {isOpen ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>CLOSE FORM</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              <span>ADD ALBUM</span>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:grid-cols-2"
        >
          <div className="space-y-1">
            <label className="font-mono-meta text-[10px] text-[var(--text-muted)] uppercase">
              TRACK TITLE *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 밤편지"
              className="w-full border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono-meta text-[10px] text-[var(--text-muted)] uppercase">
              ARTIST *
            </label>
            <input
              type="text"
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="예: 아이유"
              className="w-full border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono-meta text-[10px] text-[var(--text-muted)] uppercase">
              GENRE
            </label>
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="예: Ballad, K-Pop, R&B"
              className="w-full border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono-meta text-[10px] text-[var(--text-muted)] uppercase">
              COVER IMAGE URL (비워두면 자동 검색)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="비워두면 제목·아티스트로 자동 검색"
                className="w-full border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
              />
              <button
                type="button"
                onClick={handlePreviewCover}
                disabled={searchingCover || (!title.trim() && !artist.trim())}
                className="font-mono-meta inline-flex shrink-0 items-center gap-1 border border-[var(--border-subtle)] px-2.5 py-2 text-[10px] uppercase hover:border-[var(--text-main)] disabled:opacity-40"
              >
                {searchingCover ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="h-3.5 w-3.5" />
                )}
                <span>FIND</span>
              </button>
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-mono-meta text-[10px] text-[var(--text-muted)] uppercase">
              MOOD TAGS
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ALL_MOODS.map((mood) => {
                const active = selectedMoods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-2.5 py-1 text-[11px] transition ${
                      active
                        ? "bg-[var(--text-main)] font-semibold text-[var(--bg-vault)]"
                        : "border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    }`}
                  >
                    #{mood}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-mono-meta text-[10px] text-[var(--text-muted)] uppercase">
              MEMO / LINER NOTE
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="이 곡을 듣고 싶은 순간이나 짧은 메모"
              className="w-full border border-[var(--border-subtle)] bg-transparent px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
            />
          </div>

          <div className="flex justify-end sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="font-mono-meta inline-flex items-center gap-1.5 bg-[var(--text-main)] px-5 py-2 text-[11px] font-medium tracking-wider text-[var(--bg-vault)] uppercase hover:opacity-85 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>FETCHING COVER...</span>
                </>
              ) : (
                <span>SAVE TO VAULT</span>
              )}
            </button>
          </div>
        </form>
      )}

      {vault.length === 0 ? (
        <p className="py-16 text-center text-xs text-[var(--text-muted)]">
          창고가 비어 있습니다. 우측 상단 + ADD ALBUM 버튼으로 첫 곡을 담아보세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-8 gap-y-14 pt-4 sm:grid-cols-3 md:gap-x-14 md:gap-y-20">
          {vault.map((track, idx) => {
            const offsetClass = SCATTER_OFFSETS[idx % SCATTER_OFFSETS.length];
            const indexLabel = String(idx + 1).padStart(2, "0");
            return (
              <article
                key={track.id}
                className={`group relative flex flex-col ${offsetClass}`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                  <AlbumArtwork track={track} className="h-full w-full" />
                  <button
                    type="button"
                    onClick={() => onDeleteTrack(track.id)}
                    aria-label={`${track.title} 삭제`}
                    className="absolute top-2.5 right-2.5 rounded-full bg-black/65 p-1.5 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-bold leading-snug">
                      {track.title}
                    </h3>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">
                      {track.artist}
                    </p>
                  </div>
                  <span className="font-mono-meta shrink-0 text-[10px] text-[var(--text-muted)]">
                    {indexLabel}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}