"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import AlbumArtwork from "@/components/AlbumArtwork";
import TopNav from "@/components/TopNav";
import { prepareCandidateTracks } from "@/lib/playlist";
import { CurationResult, MoodType, Track, WeatherType } from "@/lib/types";

const VAULT_STORAGE_KEY = "today_playlist_vault_v1";
const RESULT_STORAGE_KEY = "today_playlist_last_result_v1";

const WEATHER_OPTIONS: WeatherType[] = ["맑음", "비", "흐림", "눈", "밤/새벽"];
const MOOD_OPTIONS: MoodType[] = ["집중", "잔잔함", "신남", "위로", "드라이브"];

export default function LookbookPage() {
  const [vault, setVault] = useState<Track[]>([]);
  const [weather, setWeather] = useState<WeatherType>("비");
  const [mood, setMood] = useState<MoodType>("잔잔함");
  const [count, setCount] = useState<number>(3);

  const [result, setResult] = useState<CurationResult | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 오디오 미리듣기 상태
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vault,
          weather,
          mood,
          count,
          seed: Date.now(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "선곡 생성에 실패했습니다.");
      } else {
        setResult(data);
        setActiveIndex(0);
        localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      setErrorMsg("서버와 통신하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const displayItems =
    result && result.items.length > 0
      ? result.items
      : uniqueTracks
          .slice(0, Math.min(count, Math.max(1, uniqueTracks.length)))
          .map((track) => ({
            track,
            comment:
              track.note ||
              `${weather} 날씨와 #${mood} 무드에 맞춰 보관된 트랙입니다.`,
          }));

  const currentIdx = Math.min(activeIndex, Math.max(0, displayItems.length - 1));
  const currentItem = displayItems[currentIdx];
  const totalStr = String(displayItems.length).padStart(2, "0");
  const currentStr = String(currentIdx + 1).padStart(2, "0");

  // 현재 곡이 이미 보관함(03. VAULT)에 있는지 확인
  const isAlreadyInVault = currentItem
    ? vault.some(
        (t) =>
          t.title.trim().toLowerCase() ===
            currentItem.track.title.trim().toLowerCase() &&
          t.artist.trim().toLowerCase() ===
            currentItem.track.artist.trim().toLowerCase()
      )
    : false;

  // 추천받은 곡을 바로 03. VAULT에 저장
  const handleSaveToVault = () => {
    if (!currentItem || isAlreadyInVault) return;
    const newTrack: Track = {
      ...currentItem.track,
      id: `trk-${Date.now()}`,
      note: currentItem.comment,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updatedVault = [newTrack, ...vault];
    setVault(updatedVault);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updatedVault));
  };

  // 현재 표시 곡이 바뀔 때마다 기존 재생 정지 및 미리듣기 URL 조회
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
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
      style={{ backgroundColor: "var(--bg-lookbook)" }}
      className="flex min-h-screen flex-col justify-between px-5 py-6 sm:px-10 sm:py-8"
    >
      <TopNav
        vaultCount={vault.length}
        subtitle={`CONDITION: ${weather} / #${mood}`}
      />

      {/* 숨김 오디오 플레이어 */}
      <audio
        ref={audioRef}
        src={previewUrl || undefined}
        onTimeUpdate={() => {
          if (!audioRef.current || !audioRef.current.duration) return;
          setProgress(
            (audioRef.current.currentTime / audioRef.current.duration) * 100
          );
        }}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />

      {/* 중앙 대형 앨범 아트워크 + TR 인덱스 + 재생 & 보관 컨트롤 */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-8">
        {currentItem ? (
          <div className="relative flex w-full flex-col items-center">
            <div className="relative flex w-full max-w-[330px] flex-col sm:max-w-[600px] sm:flex-row sm:items-end sm:gap-6 md:max-w-[660px]">
              <div className="aspect-square w-full max-w-[330px] shrink-0 shadow-2xl sm:max-w-[430px]">
                <AlbumArtwork
                  track={currentItem.track}
                  className="h-full w-full"
                />
              </div>

              {/* 우측 바깥 영역 인덱스, 곡 정보, 재생 및 보관 버튼 */}
              <div className="mt-5 flex flex-col justify-end gap-3 sm:mt-0 sm:min-w-[180px]">
                <div className="flex items-end justify-between sm:block">
                  <div className="select-none sm:mb-3">
                    <div className="font-grotesk inline-block rounded-none border border-[#141414] bg-[#141414] px-3 py-1.5 text-5xl font-bold leading-[0.88] tracking-tighter text-[#F6F3EC] sm:text-6xl md:text-7xl">
                      TR.{currentStr}
                      <span className="block">/{totalStr}</span>
                    </div>
                  </div>

                  <div className="border-t border-[var(--border-subtle)] pt-2 text-right sm:w-full sm:text-left">
                    <p className="text-xs font-bold leading-tight">
                      {currentItem.track.title}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {currentItem.track.artist}
                    </p>
                  </div>
                </div>

                {/* 음악 재생 컨트롤 */}
                <div className="space-y-1.5 pt-1">
                  {previewUrl ? (
                    <>
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="font-mono-meta inline-flex items-center gap-1.5 py-0.5 text-[11px] tracking-wider text-[var(--text-main)] uppercase transition hover:underline hover:underline-offset-4"
                      >
                        <span>{isPlaying ? "PAUSE 30S" : "PLAY 30S"}</span>
                      </button>
                      <div className="h-[1px] w-24 overflow-hidden bg-[var(--border-subtle)]">
                        <div
                          style={{ width: `${progress}%` }}
                          className="h-full bg-[var(--text-main)] transition-all duration-150"
                        />
                      </div>
                    </>
                  ) : (
                    <a
                      href={youtubeSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono-meta inline-flex items-center gap-1 py-0.5 text-[10px] tracking-wider text-[var(--text-muted)] uppercase transition hover:text-[var(--text-main)] hover:underline hover:underline-offset-4"
                    >
                      <span>
                        {fetchingPreview
                          ? "LOADING AUDIO..."
                          : "LISTEN ON YOUTUBE →"}
                      </span>
                    </a>
                  )}
                </div>

                {/* 추천곡을 03. VAULT로 바로 저장하는 버튼 */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSaveToVault}
                    disabled={isAlreadyInVault}
                    className={`font-mono-meta w-full border px-3 py-1.5 text-left text-[10px] tracking-wider uppercase transition ${
                      isAlreadyInVault
                        ? "border-[var(--border-subtle)] text-[var(--text-muted)]"
                        : "border-[var(--text-main)] text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-lookbook)]"
                    }`}
                  >
                    {isAlreadyInVault ? "SAVED IN VAULT ✓" : "+ SAVE TO VAULT"}
                  </button>
                </div>
              </div>
            </div>

            {/* 코멘트 & 트랙 전환 화살표 */}
            <div className="mt-10 flex w-full max-w-xl items-center justify-between gap-4">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((p) =>
                    p <= 0 ? displayItems.length - 1 : p - 1
                  )
                }
                aria-label="이전 곡"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="space-y-1.5 text-center">
                <p className="text-xs leading-relaxed sm:text-sm">
                  “{currentItem.comment}”
                </p>
                <div className="font-mono-meta flex items-center justify-center gap-3 text-[10px] text-[var(--text-muted)] uppercase">
                  <span>{currentItem.track.genre}</span>
                  <span>·</span>
                  <Link
                    href="/mixtape"
                    className="underline underline-offset-4 hover:text-[var(--text-main)]"
                  >
                    VIEW MIXTAPE →
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveIndex((p) =>
                    p >= displayItems.length - 1 ? 0 : p + 1
                  )
                }
                aria-label="다음 곡"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              하단에서 날씨와 기분을 고른 뒤 <strong>CURATE ({count})</strong>를 눌러 새로운 곡을 추천받아 보세요.
            </p>
          </div>
        )}

        {errorMsg && (
          <p className="font-mono-meta mt-4 text-xs text-[#B91C1C]">
            {errorMsg}
          </p>
        )}
      </main>

      {/* 하단 미니멀 선곡 컨트롤 바 (보관함이 비어도 항상 활성) */}
      <footer className="mx-auto w-full max-w-6xl border-t border-[var(--border-subtle)] pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono-meta mr-1 text-[10px] text-[var(--text-muted)]">
              WEATHER:
            </span>
            {WEATHER_OPTIONS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeather(w)}
                className={`px-2 py-0.5 transition ${
                  weather === w
                    ? "bg-[var(--text-main)] font-semibold text-[var(--bg-lookbook)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono-meta mr-1 text-[10px] text-[var(--text-muted)]">
              MOOD:
            </span>
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={`px-2 py-0.5 transition ${
                  mood === m
                    ? "bg-[var(--text-main)] font-semibold text-[var(--bg-lookbook)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="font-mono-meta mr-1 text-[10px] text-[var(--text-muted)]">
                LIMIT:
              </span>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCount(num)}
                  title={`${num}곡 추천`}
                  className={`font-mono-meta px-1.5 py-0.5 text-[11px] transition ${
                    count === num
                      ? "font-bold underline underline-offset-4 text-[var(--text-main)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {String(num).padStart(2, "0")}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="font-mono-meta inline-flex items-center gap-1.5 border border-[var(--text-main)] bg-[var(--text-main)] px-4 py-1.5 text-[11px] font-medium tracking-wider text-[var(--bg-lookbook)] uppercase transition hover:bg-transparent hover:text-[var(--text-main)] disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>CURATING...</span>
                </>
              ) : (
                <span>CURATE ({count})</span>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}