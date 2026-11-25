"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AlbumArtwork from "@/components/AlbumArtwork";
import TopNav from "@/components/TopNav";
import { prepareCandidateTracks } from "@/lib/playlist";
import { CurationResult, Track } from "@/lib/types";

const VAULT_STORAGE_KEY = "today_playlist_vault_v1";
const RESULT_STORAGE_KEY = "today_playlist_last_result_v1";

export default function MixtapePage() {
  const [vault, setVault] = useState<Track[]>([]);
  const [result, setResult] = useState<CurationResult | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const stripRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    try {
      const savedVault = localStorage.getItem(VAULT_STORAGE_KEY);
      if (savedVault) {
        setVault(JSON.parse(savedVault));
      }
      const savedResult = localStorage.getItem(RESULT_STORAGE_KEY);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const uniqueTracks = prepareCandidateTracks(vault, "전체");

  const displayItems =
    result && result.items.length > 0
      ? result.items
      : uniqueTracks.map((track) => ({
          track,
          comment:
            track.note || "보관함에서 불러온 큐레이션 대기 트랙입니다.",
        }));

  const currentIdx = Math.min(activeIndex, Math.max(0, displayItems.length - 1));
  const currentItem = displayItems[currentIdx];

  useEffect(() => {
    const target = itemRefs.current[currentIdx];
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIdx, displayItems.length]);

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev <= 0 ? displayItems.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev >= displayItems.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      style={{ backgroundColor: "var(--bg-mixtape)" }}
      className="flex min-h-screen flex-col justify-between px-5 py-6 sm:px-10 sm:py-8"
    >
      <TopNav vaultCount={vault.length} subtitle="MIXTAPE ARCHIVE" />

      {/* 중앙 정렬된 필름스트립 메인 영역 */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 py-6">
        {currentItem ? (
          <>
            {/* 상단 선택 트랙 메타 & 코멘트 */}
            <div className="mx-auto max-w-xl space-y-2.5 text-center">
              <div className="font-mono-meta inline-block border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
                {String(currentIdx + 1).padStart(2, "0")} —{" "}
                {String(displayItems.length).padStart(2, "0")} · ID{" "}
                {currentItem.track.id}
              </div>

              <p className="text-sm font-medium leading-relaxed sm:text-base">
                “{currentItem.comment}”
              </p>

              <p className="text-xs text-[var(--text-muted)]">
                {currentItem.track.title} — {currentItem.track.artist}
              </p>
            </div>

            {/* 가로 필름스트립 (모든 프레임 동일 정사각형 + 스크롤바 완전 숨김) */}
            <div
              ref={stripRef}
              className="no-scrollbar flex w-full items-center justify-start gap-4 overflow-x-auto px-4 py-4 sm:justify-center sm:gap-6"
            >
              {displayItems.map((item, idx) => {
                const isSelected = idx === currentIdx;
                return (
                  <button
                    key={`${item.track.id}-${idx}`}
                    ref={(el) => {
                      itemRefs.current[idx] = el;
                    }}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative aspect-square w-40 shrink-0 overflow-hidden transition-all duration-300 sm:w-48 md:w-52 ${
                      isSelected
                        ? "-translate-y-1.5 opacity-100 ring-2 ring-[var(--text-main)] shadow-xl"
                        : "opacity-65 hover:opacity-100"
                    }`}
                  >
                    <AlbumArtwork
                      track={item.track}
                      grayscale={!isSelected}
                      className="h-full w-full"
                    />
                    <span className="font-mono-meta absolute bottom-2 left-2 bg-black/65 px-1.5 py-0.5 text-[9px] text-white">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 하단 세리프 타이틀 & 좌우 화살표 */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-6">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="이전 트랙"
                className="p-2 text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <h1 className="font-editorial-serif text-center text-2xl tracking-wide uppercase sm:text-4xl md:text-5xl">
                {result ? result.headline : "CURATED ARCHIVE"}
              </h1>

              <button
                type="button"
                onClick={handleNext}
                aria-label="다음 트랙"
                className="p-2 text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-xs text-[var(--text-muted)]">
            보관함에 트랙이 없습니다. 03. VAULT에서 곡을 추가해 주세요.
          </p>
        )}
      </main>
    </div>
  );
}