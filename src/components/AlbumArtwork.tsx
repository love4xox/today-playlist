"use client";

import { useEffect, useState } from "react";
import { MoodType, Track } from "@/lib/types";

interface AlbumArtworkProps {
  track: Track;
  grayscale?: boolean;
  className?: string;
}

interface Palette {
  bg: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

const MOOD_PALETTE_SETS: Record<MoodType, Palette[]> = {
  잔잔함: [
    {
      bg: "#1F2D29",
      surface: "#2C3E38",
      primary: "#98B8A3",
      secondary: "#E7E2D8",
      accent: "#D9A773",
      text: "#F6F3EC",
    },
    {
      bg: "#262B34",
      surface: "#343B47",
      primary: "#8FA8C8",
      secondary: "#E2E6EC",
      accent: "#E09F7D",
      text: "#F5F7FA",
    },
  ],
  집중: [
    {
      bg: "#242220",
      surface: "#322F2C",
      primary: "#C99E78",
      secondary: "#E6DFD5",
      accent: "#7E9A8B",
      text: "#FAF8F5",
    },
    {
      bg: "#1B2428",
      surface: "#273339",
      primary: "#74A5A8",
      secondary: "#DCE5E6",
      accent: "#E2B07E",
      text: "#F3F7F7",
    },
  ],
  신남: [
    {
      bg: "#C4452B",
      surface: "#A8361F",
      primary: "#F3DFBA",
      secondary: "#233656",
      accent: "#F4A259",
      text: "#FFF9F0",
    },
    {
      bg: "#233154",
      surface: "#19233D",
      primary: "#F26A4B",
      secondary: "#F7EDE2",
      accent: "#F6BD60",
      text: "#FFFDF9",
    },
  ],
  위로: [
    {
      bg: "#43362C",
      surface: "#544438",
      primary: "#DDA77B",
      secondary: "#F4EAE0",
      accent: "#9BB0A5",
      text: "#FFFBF5",
    },
    {
      bg: "#362C3D",
      surface: "#46394F",
      primary: "#D4A5C9",
      secondary: "#F2E9F0",
      accent: "#F0C38E",
      text: "#FCF8FB",
    },
  ],
  드라이브: [
    {
      bg: "#192F4D",
      surface: "#233F66",
      primary: "#E84A5F",
      secondary: "#F1FAEE",
      accent: "#FF9F1C",
      text: "#F8FAFC",
    },
    {
      bg: "#2B1E38",
      surface: "#3B294D",
      primary: "#FF7B54",
      secondary: "#FFD56B",
      accent: "#939B62",
      text: "#FFFDF7",
    },
  ],
};

// 메모리 캐시로 동일 곡 중복 API 호출 방지
const coverMemoryCache = new Map<string, string | null>();

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export default function AlbumArtwork({
  track,
  grayscale = false,
  className = "",
}: AlbumArtworkProps) {
  const [fetchedUrl, setFetchedUrl] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const cacheKey = `${track.title.trim()}::${track.artist.trim()}`;

  useEffect(() => {
    setImgFailed(false);

    if (track.coverUrl) {
      setFetchedUrl(null);
      return;
    }

    if (coverMemoryCache.has(cacheKey)) {
      setFetchedUrl(coverMemoryCache.get(cacheKey) || null);
      return;
    }

    let cancelled = false;
    const params = new URLSearchParams({
      title: track.title,
      artist: track.artist,
    });

    fetch(`/api/cover?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { coverUrl: null }))
      .then((data: { coverUrl?: string | null }) => {
        const url = data.coverUrl || null;
        coverMemoryCache.set(cacheKey, url);
        if (!cancelled) {
          setFetchedUrl(url);
        }
      })
      .catch(() => {
        coverMemoryCache.set(cacheKey, null);
      });

    return () => {
      cancelled = true;
    };
  }, [track.coverUrl, track.title, track.artist, cacheKey]);

  const activeImageUrl = !imgFailed ? track.coverUrl || fetchedUrl : null;

  const mainMood = track.moodTags[0] || "잔잔함";
  const seed = hashString(
    `${track.id}-${track.title}-${track.artist}-${track.genre}`
  );
  const paletteGroup =
    MOOD_PALETTE_SETS[mainMood] || MOOD_PALETTE_SETS["잔잔함"];
  const palette = paletteGroup[seed % paletteGroup.length];
  const layoutVariant = seed % 8;
  const catalogCode = `TP-${String((seed % 899) + 100)}`;
  const titleFontSize =
    track.title.length > 14 ? 20 : track.title.length > 9 ? 24 : 28;

  return (
    <div
      className={`relative overflow-hidden select-none transition-all duration-500 ${
        grayscale
          ? "grayscale opacity-65 hover:opacity-90"
          : "grayscale-0 opacity-100"
      } ${className}`}
    >
      {activeImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeImageUrl}
          alt={`${track.title} - ${track.artist}`}
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 400 400"
          className="h-full w-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id={`rad-${track.id}`} cx="28%" cy="22%" r="80%">
              <stop offset="0%" stopColor={palette.primary} stopOpacity="0.45" />
              <stop offset="100%" stopColor={palette.bg} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`lin-${track.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={palette.primary} stopOpacity="0.9" />
              <stop offset="100%" stopColor={palette.accent} stopOpacity="0.85" />
            </linearGradient>
            <pattern
              id={`dots-${track.id}`}
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="3"
                cy="3"
                r="1.2"
                fill={palette.secondary}
                fillOpacity="0.24"
              />
            </pattern>
          </defs>

          <rect width="400" height="400" fill={palette.bg} />
          <rect width="400" height="400" fill={`url(#rad-${track.id})`} />

          {layoutVariant === 0 && (
            <>
              <rect
                x="24"
                y="62"
                width="352"
                height="210"
                fill={`url(#dots-${track.id})`}
              />
              <circle
                cx="245"
                cy="168"
                r="92"
                fill={palette.surface}
                stroke={palette.secondary}
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
              <circle
                cx="165"
                cy="168"
                r="92"
                fill={palette.primary}
                fillOpacity="0.88"
              />
              <circle cx="165" cy="168" r="24" fill={palette.bg} />
              <circle cx="165" cy="168" r="6" fill={palette.accent} />
            </>
          )}

          {layoutVariant === 1 && (
            <>
              <polygon
                points="40,70 230,70 150,260 40,260"
                fill={palette.primary}
                fillOpacity="0.9"
              />
              <circle
                cx="265"
                cy="145"
                r="76"
                fill={palette.accent}
                fillOpacity="0.92"
              />
              <rect
                x="185"
                y="185"
                width="175"
                height="82"
                fill={palette.secondary}
                fillOpacity="0.2"
              />
            </>
          )}

          {layoutVariant === 2 && (
            <>
              <circle
                cx="295"
                cy="112"
                r="34"
                fill={palette.secondary}
                fillOpacity="0.92"
              />
              <path
                d="M0 195 Q 110 145 215 190 T 400 175 L 400 285 L 0 285 Z"
                fill={palette.surface}
              />
              <path
                d="M0 225 Q 130 185 255 230 T 400 215 L 400 285 L 0 285 Z"
                fill={palette.primary}
                fillOpacity="0.85"
              />
            </>
          )}

          {layoutVariant === 3 && (
            <>
              {[124, 102, 80, 58, 36].map((r, i) => (
                <circle
                  key={r}
                  cx="200"
                  cy="172"
                  r={r}
                  fill="none"
                  stroke={i % 2 === 0 ? palette.primary : palette.secondary}
                  strokeOpacity={0.35 + i * 0.12}
                  strokeWidth={i === 2 ? "6" : "2"}
                />
              ))}
              <circle cx="200" cy="172" r="16" fill={palette.accent} />
            </>
          )}

          {layoutVariant === 4 && (
            <>
              {[0, 1, 2, 3, 4].map((idx) => (
                <rect
                  key={idx}
                  x={42 + idx * 66}
                  y={68 + (idx % 2) * 18}
                  width="46"
                  height="185"
                  rx="23"
                  fill={idx % 2 === 0 ? palette.primary : palette.accent}
                  fillOpacity={0.85 - idx * 0.08}
                />
              ))}
            </>
          )}

          {layoutVariant === 5 && (
            <>
              <path
                d="M95 270 L95 160 A105 105 0 0 1 305 160 L305 270 Z"
                fill={`url(#lin-${track.id})`}
              />
              <path
                d="M135 270 L135 172 A65 65 0 0 1 265 172 L265 270 Z"
                fill={palette.bg}
                fillOpacity="0.65"
              />
              <line
                x1="200"
                y1="55"
                x2="200"
                y2="270"
                stroke={palette.secondary}
                strokeOpacity="0.35"
                strokeWidth="1.5"
              />
            </>
          )}

          {layoutVariant === 6 && (
            <>
              <rect
                x="32"
                y="64"
                width="336"
                height="205"
                rx="12"
                fill={palette.surface}
                stroke={palette.secondary}
                strokeOpacity="0.22"
              />
              <rect
                x="56"
                y="88"
                width="140"
                height="156"
                fill={palette.primary}
              />
              <circle cx="282" cy="166" r="54" fill={palette.accent} />
              <text
                x="282"
                y="170"
                textAnchor="middle"
                fill={palette.bg}
                fontSize="11"
                fontWeight="700"
                fontFamily="monospace"
              >
                33⅓ RPM
              </text>
            </>
          )}

          {layoutVariant === 7 && (
            <>
              <circle
                cx="200"
                cy="168"
                r="86"
                fill={`url(#lin-${track.id})`}
              />
              {[178, 194, 210, 226, 242].map((yPos, i) => (
                <rect
                  key={yPos}
                  x="80"
                  y={yPos}
                  width="240"
                  height={2 + i * 1.4}
                  fill={palette.bg}
                />
              ))}
            </>
          )}

          <text
            x="28"
            y="40"
            fill={palette.text}
            fillOpacity="0.72"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="2"
          >
            {catalogCode} · {track.genre.toUpperCase()}
          </text>
          <text
            x="372"
            y="40"
            textAnchor="end"
            fill={palette.text}
            fillOpacity="0.72"
            fontSize="10"
            fontFamily="monospace"
            letterSpacing="1.5"
          >
            #{mainMood}
          </text>

          <line
            x1="28"
            y1="292"
            x2="372"
            y2="292"
            stroke={palette.secondary}
            strokeOpacity="0.28"
            strokeWidth="1"
          />

          <text
            x="28"
            y="328"
            fill={palette.text}
            fontSize={titleFontSize}
            fontWeight="700"
            fontFamily="Georgia, serif"
          >
            {track.title}
          </text>

          <text
            x="28"
            y="358"
            fill={palette.text}
            fillOpacity="0.78"
            fontSize="13"
            fontFamily="sans-serif"
            letterSpacing="0.5"
          >
            {track.artist}
          </text>

          <g transform="translate(314, 336)" opacity="0.65">
            {[0, 5, 8, 14, 18, 24, 27, 33, 38, 42, 48].map((xPos, idx) => (
              <rect
                key={xPos}
                x={xPos}
                y="0"
                width={idx % 3 === 0 ? "3" : "1.5"}
                height="24"
                fill={palette.text}
              />
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}