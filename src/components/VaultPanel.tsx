"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AlbumArtwork from "@/components/AlbumArtwork";
import { MoodType, Track } from "@/lib/types";

const MOOD_OPTIONS: MoodType[] = ["집중", "잔잔함", "신남", "위로", "드라이브"];

// 세 번째 레퍼런스(Order & Chaos)의 리듬감 있는 비정형 오프셋 패턴
const SCATTER_OFFSETS = [
  "md:translate-y-0 md:ml-4",
  "md:-translate-y-8 md:ml-12",
  "md:translate-y-10 md:mr-4",
  "md:translate-y-2 md:ml-2",
  "md:translate-y-12 md:ml-10",
  "md:-translate-y-4 md:mr-6",
];

interface VaultPanelProps {
  vault: Track[];
  onAddTrack: (track: Track) => void;
  onDeleteTrack: (id: string) => void;
}

export default function VaultPanel({
  vault,
  onAddTrack,
  onDeleteTrack,
}: VaultPanelProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("R&B / Soul");
  const [coverUrl, setCoverUrl] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>(["잔잔함"]);
  const [note, setNote] = useState("");

  const toggleMood = (mood: MoodType) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const newTrack: Track = {
      id: `trk-${Date.now().toString(36)}`,
      title: title.trim(),
      artist: artist.trim(),
      genre: genre.trim() || "Indie",
      moodTags: selectedMoods.length > 0 ? selectedMoods : ["잔잔함"],
      coverUrl: coverUrl.trim() || undefined,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onAddTrack(newTrack);
    setTitle("");
    setArtist("");
    setCoverUrl("");
    setNote("");
    setIsFormOpen(false);
  };

  return (
    <section className="space-y-10">
      {/* 상단 Order & Chaos 스타일 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-grotesk text-2xl font-medium tracking-tight sm:text-3xl">
            Order &amp; Chaos
          </h2>
          <p className="font-mono-meta mt-1 text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
            SOUND VAULT ARCHIVE · {vault.length} ALBUMS STORED
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="font-mono-meta inline-flex items-center gap-1.5 border border-[var(--border-main)] px-3 py-1.5 text-[11px] tracking-wider uppercase transition hover:bg-[var(--text-main)] hover:text-[var(--bg-page)]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{isFormOpen ? "CLOSE FORM" : "ADD ALBUM"}</span>
        </button>
      </div>

      {/* 새 앨범 입고 폼 (토글) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="border border-[var(--border-main)] bg-[var(--bg-surface)] p-6 space-y-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="곡 제목 *"
              className="border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
            />
            <input
              type="text"
              required
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="아티스트 *"
              className="border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
            />
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="장르 (예: R&B, Indie)"
              className="border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="앨범 커버 이미지 URL (선택 — 비워두면 자동 아트워크 생성)"
              className="border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="한 줄 감상 메모 (선택)"
              className="border border-[var(--border-subtle)] bg-[var(--bg-page)] px-3 py-2 text-xs outline-none focus:border-[var(--text-main)]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono-meta mr-1 text-[10px] text-[var(--text-muted)] uppercase">
                MOOD TAGS:
              </span>
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMood(m)}
                  className={`px-2.5 py-1 text-[11px] transition ${
                    selectedMoods.includes(m)
                      ? "bg-[var(--text-main)] font-semibold text-[var(--bg-page)]"
                      : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"
                  }`}
                >
                  #{m}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="font-mono-meta bg-[var(--text-main)] px-5 py-2 text-[11px] font-medium tracking-wider text-[var(--bg-page)] uppercase transition hover:opacity-85"
            >
              SAVE TO VAULT
            </button>
          </div>
        </form>
      )}

      {/* 3) 세 번째 레퍼런스 무드: 여백 속 비정형 앨범 재킷 갤러리 캔버스 */}
      {vault.length === 0 ? (
        <p className="py-16 text-center text-xs text-[var(--text-muted)]">
          보유한 앨범이 없습니다. 우측 상단 ADD ALBUM 버튼으로 첫 트랙을 추가해 주세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-8 py-6 sm:grid-cols-3 md:gap-14 md:py-12">
          {vault.map((track, idx) => {
            const offsetClass = SCATTER_OFFSETS[idx % SCATTER_OFFSETS.length];
            return (
              <div
                key={track.id}
                className={`group relative mx-auto w-full max-w-[200px] transition-transform duration-300 hover:-translate-y-1 ${offsetClass}`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-md">
                  <AlbumArtwork track={track} className="h-full w-full" />

                  {/* 호버 시 나타나는 메타 오버레이 & 삭제 버튼 */}
                  <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-3.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="flex items-start justify-between">
                      <span className="font-mono-meta text-[9px] text-white/75">
                        {track.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteTrack(track.id)}
                        aria-label="앨범 삭제"
                        className="rounded-full bg-white/15 p-1.5 text-white transition hover:bg-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-white">
                      <p className="truncate text-xs font-bold">{track.title}</p>
                      <p className="truncate text-[10px] text-white/80">
                        {track.artist}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {track.moodTags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-white/20 px-1.5 py-0.5 text-[9px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 앨범 하단 미니멀 캡션 */}
                <div className="mt-2.5 flex items-baseline justify-between px-0.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">
                      {track.title}
                    </p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">
                      {track.artist}
                    </p>
                  </div>
                  <span className="font-mono-meta shrink-0 text-[9px] text-[var(--text-muted)]">
                    0{idx + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}