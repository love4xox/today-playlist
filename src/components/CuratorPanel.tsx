"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import AlbumArtwork from "@/components/AlbumArtwork";
import { prepareCandidateTracks } from "@/lib/playlist";
import { CurationResult, MoodType, Track, WeatherType } from "@/lib/types";

const WEATHER_OPTIONS: WeatherType[] = ["맑음", "비", "흐림", "눈", "밤/새벽"];
const MOOD_OPTIONS: MoodType[] = ["집중", "잔잔함", "신남", "위로", "드라이브"];

interface CuratorPanelProps {
  vault: Track[];
  weather: WeatherType;
  mood: MoodType;
  count: number;
  onChangeWeather: (w: WeatherType) => void;
  onChangeMood: (m: MoodType) => void;
  onChangeCount: (c: number) => void;
}

export default function CuratorPanel({
  vault,
  weather,
  mood,
  count,
  onChangeWeather,
  onChangeMood,
  onChangeCount,
}: CuratorPanelProps) {
  const [result, setResult] = useState<CurationResult | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const uniqueTracks = prepareCandidateTracks(vault, "전체");
  const safeCount = Math.min(count, Math.max(1, uniqueTracks.length));

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
          count: safeCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "선곡 생성에 실패했습니다.");
      } else {
        setResult(data);
        setActiveIndex(0);
      }
    } catch {
      setErrorMsg("서버와 통신하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 초기 진입 시에도 룩북 뷰가 살아 있도록 샘플/보유 첫 트랙 미리보기 제공
  const displayItems =
    result && result.items.length > 0
      ? result.items
      : uniqueTracks.slice(0, safeCount).map((track) => ({
          track,
          comment:
            track.note ||
            `${weather} 날씨와 #${mood} 무드에 맞춰 선곡을 기다리는 보관 트랙입니다.`,
        }));

  const currentIdx = Math.min(activeIndex, Math.max(0, displayItems.length - 1));
  const currentItem = displayItems[currentIdx];
  const totalStr = String(displayItems.length).padStart(2, "0");
  const currentStr = String(currentIdx + 1).padStart(2, "0");

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
    <section className="space-y-14">
      {/* 미니멀 에디토리얼 컨트롤 바 */}
      <div className="border-y border-[var(--border-subtle)] py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px]">
          {/* 날씨 선택 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono-meta mr-1.5 text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
              WEATHER:
            </span>
            {WEATHER_OPTIONS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onChangeWeather(w)}
                className={`px-2 py-0.5 transition ${
                  weather === w
                    ? "bg-[var(--text-main)] font-semibold text-[var(--bg-page)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          {/* 기분 선택 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono-meta mr-1.5 text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
              MOOD:
            </span>
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeMood(m)}
                className={`px-2 py-0.5 transition ${
                  mood === m
                    ? "bg-[var(--text-main)] font-semibold text-[var(--bg-page)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* 요청 곡 수 & 실행 버튼 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="font-mono-meta mr-1 text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
                TRACKS:
              </span>
              {[1, 2, 3, 5].map((num) => {
                const disabled =
                  uniqueTracks.length > 0 && num > uniqueTracks.length;
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChangeCount(num)}
                    className={`font-mono-meta px-1.5 py-0.5 text-[11px] transition ${
                      safeCount === num
                        ? "underline decoration-2 underline-offset-4 font-bold text-[var(--text-main)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    } disabled:opacity-30`}
                  >
                    0{num}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || uniqueTracks.length === 0}
              className="font-mono-meta inline-flex items-center gap-1.5 border border-[var(--text-main)] bg-[var(--text-main)] px-3.5 py-1.5 text-[11px] font-medium tracking-wider text-[var(--bg-page)] uppercase transition hover:bg-transparent hover:text-[var(--text-main)] disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>CURATING...</span>
                </>
              ) : (
                <span>→ CURATE ({safeCount})</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <p className="font-mono-meta text-center text-xs text-[#B91C1C]">
          {errorMsg}
        </p>
      )}

      {/* 1) 첫 번째 레퍼런스 무드: 중앙 대형 앨범 아트워크 + 우측 하단 TR.01/05 오버레이 인덱스 */}
      {currentItem && (
        <div className="relative mx-auto flex max-w-4xl flex-col items-center py-4 sm:py-8">
          <div className="relative w-full max-w-[360px] sm:max-w-[440px]">
            {/* 정사각형 앨범 아트워크 */}
            <div className="aspect-square w-full shadow-2xl">
              <AlbumArtwork
                track={currentItem.track}
                className="h-full w-full"
              />
            </div>

            {/* 우측 하단 거대 인덱스 오버레이 (TR.01 / 05) */}
            <div className="mt-5 flex items-end justify-between sm:mt-0 sm:block">
              <div className="sm:absolute sm:-right-28 sm:bottom-12 md:-right-36 select-none">
                <div className="font-grotesk text-6xl font-bold leading-[0.86] tracking-tighter sm:text-7xl md:text-8xl">
                  TR.{currentStr}
                  <span className="block">/{totalStr}</span>
                </div>
              </div>

              {/* 인덱스 아래 아티스트 & 곡명 캡션 */}
              <div className="text-right sm:absolute sm:-right-28 sm:-bottom-6 md:-right-36 sm:text-left">
                <p className="text-xs font-bold leading-tight">
                  {currentItem.track.title}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {currentItem.track.artist}
                </p>
              </div>
            </div>
          </div>

          {/* 큐레이터 코멘트 & 무환각 ID 배지 */}
          <div className="mt-10 max-w-lg text-center space-y-2">
            <p className="text-xs leading-relaxed text-[var(--text-main)] sm:text-sm">
              “{currentItem.comment}”
            </p>
            <div className="font-mono-meta flex items-center justify-center gap-3 text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
              <span>ID: {currentItem.track.id}</span>
              <span>·</span>
              <span>
                {result
                  ? `VERIFIED ${result.items.length}/${safeCount} TRACKS`
                  : "PREVIEW ARCHIVE"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2) 두 번째 레퍼런스 무드: 가로 앨범 필름스트립 & 세리프 헤드라인 */}
      {displayItems.length > 0 && (
        <div className="space-y-6 pt-4">
          {/* 가로 앨범 스트립 */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 sm:gap-5">
            {displayItems.map((item, idx) => {
              const isSelected = idx === currentIdx;
              return (
                <button
                  key={item.track.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative shrink-0 overflow-hidden rounded-md transition-all duration-300 ${
                    isSelected
                      ? "h-28 w-44 sm:h-36 sm:w-64 ring-1 ring-[var(--text-main)]"
                      : "h-28 w-24 sm:h-36 sm:w-36"
                  }`}
                >
                  <AlbumArtwork
                    track={item.track}
                    grayscale={!isSelected}
                    className="h-full w-full"
                  />
                  <span className="font-mono-meta absolute bottom-2 left-2 bg-black/65 px-1.5 py-0.5 text-[9px] text-white">
                    0{idx + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 하단 세리프 타이틀 + 좌우 화살표 네비게이션 */}
          <div className="flex items-center justify-between px-2 pt-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="이전 트랙"
              className="p-2 text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="text-center">
              <h2 className="font-editorial-serif text-3xl tracking-wide uppercase sm:text-5xl">
                {result ? result.headline : `${weather} — ${mood}`}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label="다음 트랙"
              className="p-2 text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}