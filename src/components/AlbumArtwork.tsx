"use client";

import { MoodType, Track } from "@/lib/types";

interface AlbumArtworkProps {
  track: Track;
  grayscale?: boolean;
  className?: string;
}

const MOOD_PALETTES: Record<
  MoodType,
  { bg: string; primary: string; secondary: string; text: string }
> = {
  잔잔함: {
    bg: "#26332E",
    primary: "#94B49F",
    secondary: "#E5E0D8",
    text: "#F5F2EB",
  },
  집중: {
    bg: "#2B2927",
    primary: "#C89D7C",
    secondary: "#E6DFD5",
    text: "#FAF8F5",
  },
  신남: {
    bg: "#C84B31",
    primary: "#ECDBBA",
    secondary: "#2D4263",
    text: "#FAF7F2",
  },
  위로: {
    bg: "#4A3F35",
    primary: "#D6A276",
    secondary: "#F3E9DD",
    text: "#FFFBF5",
  },
  드라이브: {
    bg: "#1D3557",
    primary: "#E63946",
    secondary: "#F1FAEE",
    text: "#F8F9FA",
  },
};

export default function AlbumArtwork({
  track,
  grayscale = false,
  className = "",
}: AlbumArtworkProps) {
  const mainMood = track.moodTags[0] || "잔잔함";
  const palette = MOOD_PALETTES[mainMood] || MOOD_PALETTES["잔잔함"];

  const seed = track.id
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const variant = seed % 3;

  return (
    <div
      className={`relative overflow-hidden select-none transition-all duration-500 ${
        grayscale
          ? "grayscale opacity-65 hover:opacity-90"
          : "grayscale-0 opacity-100"
      } ${className}`}
    >
      {track.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.coverUrl}
          alt={`${track.title} - ${track.artist}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 400 400"
          className="h-full w-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="400" height="400" fill={palette.bg} />

          <defs>
            <radialGradient id={`glow-${track.id}`} cx="30%" cy="25%" r="75%">
              <stop offset="0%" stopColor={palette.primary} stopOpacity="0.55" />
              <stop offset="100%" stopColor={palette.bg} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="400" fill={`url(#glow-${track.id})`} />

          {variant === 0 && (
            <>
              <circle
                cx="200"
                cy="200"
                r="138"
                fill="none"
                stroke={palette.secondary}
                strokeOpacity="0.28"
                strokeWidth="1.5"
              />
              <circle
                cx="200"
                cy="200"
                r="74"
                fill={palette.primary}
                fillOpacity="0.88"
              />
              <circle cx="200" cy="200" r="14" fill={palette.bg} />
            </>
          )}

          {variant === 1 && (
            <>
              <rect
                x="56"
                y="56"
                width="288"
                height="288"
                fill="none"
                stroke={palette.secondary}
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />
              <path
                d="M56 290 Q 200 130 344 250 L 344 344 L 56 344 Z"
                fill={palette.primary}
                fillOpacity="0.82"
              />
              <circle
                cx="275"
                cy="128"
                r="26"
                fill={palette.secondary}
                fillOpacity="0.9"
              />
            </>
          )}

          {variant === 2 && (
            <>
              <line
                x1="0"
                y1="140"
                x2="400"
                y2="140"
                stroke={palette.secondary}
                strokeOpacity="0.25"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="260"
                x2="400"
                y2="260"
                stroke={palette.secondary}
                strokeOpacity="0.25"
                strokeWidth="1"
              />
              <rect
                x="110"
                y="95"
                width="180"
                height="210"
                rx="90"
                fill={palette.primary}
                fillOpacity="0.85"
              />
            </>
          )}

          <text
            x="28"
            y="38"
            fill={palette.text}
            fillOpacity="0.7"
            fontSize="11"
            fontFamily="monospace"
            letterSpacing="2"
          >
            {track.genre.toUpperCase()} · {mainMood}
          </text>
          <text
            x="28"
            y="366"
            fill={palette.text}
            fillOpacity="0.9"
            fontSize="15"
            fontWeight="700"
            fontFamily="serif"
          >
            {track.artist}
          </text>
        </svg>
      )}
    </div>
  );
}