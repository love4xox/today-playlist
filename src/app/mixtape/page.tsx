"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AlbumArtwork from "@/components/AlbumArtwork";
import TopNav from "@/components/TopNav";
import { CurationResult, Track } from "@/lib/types";

const VAULT_STORAGE_KEY = "today_playlist_vault_v1";
const RESULT_STORAGE_KEY = "today_playlist_last_result_v1";

export default function MixtapeFilmstripPage() {
  const [vault, setVault] = useState<Track[]>([]);
  const [result, setResult] = useState<CurationResult | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    try {
      const savedVault = localStorage.getItem(VAULT_STORAGE_KEY);
      if (savedVault) setVault(JSON.parse(savedVault));

      const savedResult = localStorage.getItem(RESULT_STORAGE_KEY);
      if (savedResult) setResult(JSON.parse(savedResult));
    } catch {
      // ignore
    }
  }, []);

  const items =
    result && result.items.length > 0
      ? result.items
      : vault.slice(0, 5).map((track) => ({
          track,
          comment:
            track.note || "오늘의 무드에 맞춰 선곡된 아카이브 트랙입니다.",
        }));

  const currentIdx = Math.min(activeIndex, Math.max(0, items.length - 1));
  const activeItem = items[currentIdx];

  return (
    <div
      style={{ backgroundColor: "var(--bg-mixtape)" }}
      className="flex min-h-screen flex-col justify-between px-5 py-6 sm:px-10 sm:py-8"
    >
      <TopNav
        vaultCount={vault.length}
        subtitle={`MIXTAPE FILMSTRIP · ${items.length} TRACKS`}
      />

      {/* 중앙 넓은 갤러리 여백 + 선택된 트랙의 코멘트 및 번호 프레임 */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end pb-4">
        {activeItem ? (
          <div className="space-y-12">
            {/* 상단 여백 중앙에 떠 있는 트랙 메타 & 코멘트 */}
            <div className="mx-auto max-w-lg text-center space-y-3 py-10">
              <span className="font-mono-meta inline-block border border-[var(--border-subtle)] px-2.5 py-0.5 text-[10px] tracking-widest text-[var(--text-muted)]">
                0{currentIdx + 1} — 0{items.length} · ID {activeItem.track.id}
              </span>
              <p className="text-sm font-medium leading-relaxed sm:text-base">
                “{activeItem.comment}”
              </p>
              <p className="font-mono-meta text-[11px] text-[var(--text-muted)]">
                {activeItem.track.title} — {activeItem.track.artist}
              </p>
            </div>

            {/* 두 번째 레퍼런스 핵심: 가로 앨범 필름스트립 (선택된 트랙만 컬러, 나머지 흑백) */}
            <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 sm:gap-5">
              {items.map((item, idx) => {
                const isSelected = idx === currentIdx;
                return (
                  <button
                    key={item.track.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative shrink-0 overflow-hidden rounded-md transition-all duration-500 ${
                      isSelected
                        ? "h-44 w-72 sm:h-56 sm:w-96 shadow-lg"
                        : "h-44 w-36 sm:h-56 sm:w-52"
                    }`}
                  >
                    <AlbumArtwork
                      track={item.track}
                      grayscale={!isSelected}
                      className="h-full w-full"
                    />
                  </button>
                );
              })}
            </div>

            {/* 하단 세리프 대형 타이틀 & 좌우 화살표 */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((p) => (p <= 0 ? items.length - 1 : p - 1))
                }
                aria-label="이전 트랙"
                className="p-2 text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <h1 className="font-editorial-serif text-center text-3xl tracking-wide uppercase sm:text-5xl">
                {result ? result.headline : "CURATED ARCHIVE"}
              </h1>

              <button
                type="button"
                onClick={() =>
                  setActiveIndex((p) => (p >= items.length - 1 ? 0 : p + 1))
                }
                aria-label="다음 트랙"
                className="p-2 text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <p className="py-20 text-center text-xs text-[var(--text-muted)]">
            표시할 트랙이 없습니다. 01. LOOKBOOK 또는 03. VAULT에서 곡을 추가해 주세요.
          </p>
        )}
      </main>
    </div>
  );
}