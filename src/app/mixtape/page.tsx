"use client";

import { useEffect, useRef, useState } from "react";
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

  // 오디오 미리듣기 상태
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // 선택된 트랙 변경 시 기존 오디오 정지 및 미리듣기 URL 조회
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPreviewUrl(null);

    if (!currentItem) return;

    let cancelled = false;
    setFetchingPreview(true);

    const params = new URLSearchParams({
      title: currentItem.track.title,
      artist: currentItem.track.artist,
    });

    fetch(`/api/cover?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { previewUrl: null }))
      .then((data: { previewUrl?: string | null }) => {
        if (!cancelled) {
          setPreviewUrl(data.previewUrl || null);
        }
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(null);
      })
      .finally(() => {
        if (!cancelled) setFetchingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentItem?.track.id, currentItem?.track.title, currentItem?.track.artist]);

  // 언마운트 시 오디오 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlay = async () => {
    if (!audioRef.current || !previewUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const youtubeSearchUrl = currentItem
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${currentItem.track.artist} ${currentItem.track.title}`
      )}`
    : "#";

  return (
    <div
      style={{ backgroundColor: "var(--bg-mixtape)" }}
      className="flex min-h-screen flex-col justify-between px-5 py-6 sm:px-10 sm:py-8"
    >
      <TopNav vaultCount={vault.length} subtitle="MIXTAPE ARCHIVE" />

      <audio
        ref={audioRef}
        src={previewUrl || undefined}
        onEnded={() => setIsPlaying(false)}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-6">
        {currentItem ? (
          <div className="space-y-8">
            {/* 상단 헤드라인 */}
            <div className="border-b border-[var(--border-subtle)] pb-4">
              <p className="font-mono-meta mb-1 text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
                SIDE A · {displayItems.length} TRACKS CURATED
              </p>
              <h1 className="font-editorial-serif text-2xl tracking-tight sm:text-4xl">
                {result ? result.headline : "CURATED ARCHIVE"}
              </h1>
            </div>

            {/* 좌측 커버 + 우측 트랙리스트 2단 구성 */}
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10">
              {/* 좌측 선택 트랙 커버, 텍스트 재생 컨트롤 & 코멘트 */}
              <div className="space-y-4 md:col-span-5">
                <div className="aspect-square w-full max-w-[340px] shadow-xl">
                  <AlbumArtwork
                    track={currentItem.track}
                    className="h-full w-full"
                  />
                </div>

                <div className="space-y-2 border-t border-[var(--border-subtle)] pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono-meta text-[10px] text-[var(--text-muted)] uppercase">
                      SELECTED · ID {currentItem.track.id}
                    </span>

                    {previewUrl ? (
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="font-mono-meta py-0.5 text-[11px] tracking-wider text-[var(--text-main)] uppercase transition hover:underline hover:underline-offset-4"
                      >
                        {isPlaying ? "PAUSE 30S" : "PLAY 30S"}
                      </button>
                    ) : (
                      <a
                        href={youtubeSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-meta py-0.5 text-[10px] tracking-wider text-[var(--text-muted)] uppercase transition hover:text-[var(--text-main)] hover:underline hover:underline-offset-4"
                      >
                        {fetchingPreview
                          ? "LOADING AUDIO..."
                          : "LISTEN ON YOUTUBE →"}
                      </a>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed sm:text-sm">
                    “{currentItem.comment}”
                  </p>
                </div>
              </div>

              {/* 우측 전체 트랙 번호 리스트 */}
              <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)] md:col-span-7">
                {displayItems.map((item, idx) => {
                  const isSelected = idx === currentIdx;
                  return (
                    <button
                      key={`${item.track.id}-${idx}`}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`flex w-full items-center justify-between gap-4 px-3 py-3.5 text-left transition ${
                        isSelected
                          ? "bg-[var(--text-main)] text-[var(--bg-mixtape)]"
                          : "hover:bg-[var(--bg-surface)]"
                      }`}
                    >
                      <div className="flex min-w-0 items-baseline gap-3">
                        <span
                          className={`font-mono-meta text-xs ${
                            isSelected
                              ? "opacity-80"
                              : "text-[var(--text-muted)]"
                          }`}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="truncate">
                          <p className="truncate text-sm font-semibold">
                            {item.track.title}
                          </p>
                          <p
                            className={`truncate text-xs ${
                              isSelected
                                ? "opacity-80"
                                : "text-[var(--text-muted)]"
                            }`}
                          >
                            {item.track.artist}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-mono-meta shrink-0 text-[10px] uppercase ${
                          isSelected ? "opacity-90" : "text-[var(--text-muted)]"
                        }`}
                      >
                        {item.track.genre}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-xs text-[var(--text-muted)]">
            보관함에 트랙이 없습니다. 03. VAULT에서 곡을 추가해 주세요.
          </p>
        )}
      </main>
    </div>
  );
}