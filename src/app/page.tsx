"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import AlbumArtwork from "@/components/AlbumArtwork";
import TopNav from "@/components/TopNav";
import { prepareCandidateTracks } from "@/lib/playlist";
import { CurationResult, MoodType, Track, WeatherType } from "@/lib/types";

const VAULT_STORAGE_KEY = "today_playlist_vault_v1";
const RESULT_STORAGE_KEY = "today_playlist_last_result_v1";

const WEATHER_OPTIONS: WeatherType[] = ["맑음", "비", "흐림", "눈", "밤/새벽"];
const MOOD_OPTIONS: MoodType[] = ["집중", "잔잔함", "신남", "위로", "드라이브"];

const INITIAL_SAMPLE_VAULT: Track[] = [
  {
    id: "trk-001",
    title: "밤편지",
    artist: "아이유",
    genre: "Ballad",
    moodTags: ["잔잔함", "위로"],
    note: "조용한 새벽 공기와 가장 잘 어울리는 어쿠스틱 선율",
    createdAt: "2026-11-23",
  },
  {
    id: "trk-002",
    title: "Hype Boy",
    artist: "NewJeans",
    genre: "K-Pop",
    moodTags: ["신남", "드라이브"],
    note: "발걸음을 가볍게 만들어 주는 경쾌한 신스 리듬",
    createdAt: "2026-11-23",
  },
  {
    id: "trk-003",
    title: "Rainy Day",
    artist: "PATEKO",
    genre: "R&B",
    moodTags: ["잔잔함", "집중"],
    note: "빗방울 떨어지는 창가에서 작업할 때 틀어두는 트랙",
    createdAt: "2026-11-23",
  },
  {
    id: "trk-004",
    title: "한 페이지가 될 수 있게",
    artist: "DAY6",
    genre: "Rock",
    moodTags: ["신남", "드라이브", "위로"],
    note: "맑은 하늘 아래 시야가 탁 트이는 청량한 밴드 사운드",
    createdAt: "2026-11-23",
  },
  {
    id: "trk-005",
    title: "Instagram",
    artist: "DEAN",
    genre: "Alt R&B",
    moodTags: ["위로", "잔잔함"],
    note: "늦은 밤 혼자 방 안에서 듣기 좋은 몽환적인 보컬",
    createdAt: "2026-11-23",
  },
  {
    id: "trk-006",
    title: "Square (2017)",
    artist: "백예린",
    genre: "Indie Pop",
    moodTags: ["신남", "드라이브", "위로"],
    note: "초록빛 잔디와 바람이 떠오르는 라이브 감성",
    createdAt: "2026-11-23",
  },
];

export default function LookbookPage() {
  const [vault, setVault] = useState<Track[]>([]);
  const [weather, setWeather] = useState<WeatherType>("비");
  const [mood, setMood] = useState<MoodType>("잔잔함");
  const [count, setCount] = useState<number>(3);

  const [result, setResult] = useState<CurationResult | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    try {
      const savedVault = localStorage.getItem(VAULT_STORAGE_KEY);
      if (savedVault) {
        setVault(JSON.parse(savedVault));
      } else {
        setVault(INITIAL_SAMPLE_VAULT);
        localStorage.setItem(
          VAULT_STORAGE_KEY,
          JSON.stringify(INITIAL_SAMPLE_VAULT)
        );
      }

      const savedResult = localStorage.getItem(RESULT_STORAGE_KEY);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }
    } catch {
      setVault(INITIAL_SAMPLE_VAULT);
    }
  }, []);

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

  return (
    <div
      style={{ backgroundColor: "var(--bg-lookbook)" }}
      className="flex min-h-screen flex-col justify-between px-5 py-6 sm:px-10 sm:py-8"
    >
      <TopNav
        vaultCount={vault.length}
        subtitle={`CONDITION: ${weather} / #${mood}`}
      />

      {/* 중앙 대형 앨범 아트워크 + TR.01/03 오버레이 */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-8">
        {currentItem && (
          <div className="relative flex w-full flex-col items-center">
            <div className="relative w-full max-w-[330px] sm:max-w-[430px]">
              <div className="aspect-square w-full shadow-2xl">
                <AlbumArtwork
                  track={currentItem.track}
                  className="h-full w-full"
                />
              </div>

              {/* 우측 하단 거대 인덱스 오버레이 */}
              <div className="mt-5 flex items-end justify-between sm:mt-0 sm:block">
                <div className="sm:absolute sm:-right-28 sm:bottom-10 md:-right-36 select-none">
                  <div className="font-grotesk text-6xl font-bold leading-[0.86] tracking-tighter sm:text-7xl md:text-8xl">
                    TR.{currentStr}
                    <span className="block">/{totalStr}</span>
                  </div>
                </div>

                <div className="text-right sm:absolute sm:-right-28 sm:-bottom-7 md:-right-36 sm:text-left">
                  <p className="text-xs font-bold leading-tight">
                    {currentItem.track.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {currentItem.track.artist}
                  </p>
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

              <div className="text-center space-y-1.5">
                <p className="text-xs leading-relaxed sm:text-sm">
                  “{currentItem.comment}”
                </p>
                <div className="font-mono-meta flex items-center justify-center gap-3 text-[10px] text-[var(--text-muted)] uppercase">
                  <span>ID: {currentItem.track.id}</span>
                  <span>·</span>
                  <Link
                    href="/mixtape"
                    className="underline underline-offset-4 hover:text-[var(--text-main)]"
                  >
                    VIEW FILMSTRIP →
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
        )}

        {errorMsg && (
          <p className="font-mono-meta mt-4 text-xs text-[#B91C1C]">
            {errorMsg}
          </p>
        )}
      </main>

      {/* 하단 미니멀 선곡 컨트롤 바 */}
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
              {[1, 2, 3, 5, 7, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={uniqueTracks.length > 0 && num > uniqueTracks.length}
                  onClick={() => setCount(num)}
                  title={
                    uniqueTracks.length > 0 && num > uniqueTracks.length
                      ? `보유 곡(${uniqueTracks.length}곡) 부족`
                      : `${num}곡 선곡`
                  }
                  className={`font-mono-meta px-1.5 py-0.5 text-[11px] ${
                    safeCount === num
                      ? "font-bold underline underline-offset-4"
                      : "text-[var(--text-muted)]"
                  } disabled:cursor-not-allowed disabled:opacity-30`}
                >
                  {String(num).padStart(2, "0")}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || uniqueTracks.length === 0}
              className="font-mono-meta inline-flex items-center gap-1.5 border border-[var(--text-main)] bg-[var(--text-main)] px-4 py-1.5 text-[11px] font-medium tracking-wider text-[var(--bg-lookbook)] uppercase transition hover:bg-transparent hover:text-[var(--text-main)] disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>CURATING...</span>
                </>
              ) : (
                <span>CURATE ({safeCount})</span>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}