import { CuratedTrackItem, MoodType, Track } from "./types";

/**
 * 1. 곡 창고에서 중복 곡(제목+아티스트 소문자 기준)을 제거하고 후보군 필터링
 */
export function prepareCandidateTracks(
  vault: Track[],
  preferredMood?: MoodType | "전체"
): Track[] {
  const seenKeys = new Set<string>();
  const deduplicated: Track[] = [];

  for (const track of vault) {
    const uniqueKey = `${track.title.trim().toLowerCase()}::${track.artist
      .trim()
      .toLowerCase()}`;
    if (!seenKeys.has(uniqueKey)) {
      seenKeys.add(uniqueKey);
      deduplicated.push(track);
    }
  }

  if (!preferredMood || preferredMood === "전체") {
    return deduplicated;
  }

  const moodMatched = deduplicated.filter((t) =>
    t.moodTags.includes(preferredMood)
  );
  // 무드 태그 일치 곡이 너무 적으면 전체 중복 제거 풀을 후보로 유지
  return moodMatched.length > 0 ? moodMatched : deduplicated;
}

/**
 * 2. AI가 반환한 선곡 ID 목록에서 환각 ID 차단, 중복 선택 제거, 요청 곡 수 엄격 일치
 */
export function validateAndBuildPlaylist(
  candidates: Track[],
  aiSelections: { trackId: string; comment: string }[],
  requestedCount: number
): {
  items: CuratedTrackItem[];
  filteredHallucinationCount: number;
} {
  const safeCount = Math.max(1, Math.min(requestedCount, candidates.length));
  const candidateMap = new Map<string, Track>(
    candidates.map((track) => [track.id, track])
  );

  const usedIds = new Set<string>();
  const validItems: CuratedTrackItem[] = [];
  let hallucinationCount = 0;

  for (const pick of aiSelections) {
    const foundTrack = candidateMap.get(pick.trackId);
    if (!foundTrack) {
      // 창고 후보에 없는 가짜(환각) ID 차단
      hallucinationCount += 1;
      continue;
    }
    if (usedIds.has(foundTrack.id)) {
      // 중복 선곡 차단
      continue;
    }
    usedIds.add(foundTrack.id);
    validItems.push({
      track: foundTrack,
      comment:
        pick.comment?.trim() ||
        `${foundTrack.artist}의 감성이 오늘 무드와 잘 어울립니다.`,
    });

    if (validItems.length === safeCount) {
      break;
    }
  }

  // AI가 유효한 곡을 요청 곡 수보다 적게 고른 경우 후보 창고에서 자동 보충
  if (validItems.length < safeCount) {
    for (const candidate of candidates) {
      if (!usedIds.has(candidate.id)) {
        usedIds.add(candidate.id);
        validItems.push({
          track: candidate,
          comment: "보관함의 결을 이어주는 추천 트랙입니다.",
        });
        if (validItems.length === safeCount) break;
      }
    }
  }

  return {
    items: validItems,
    filteredHallucinationCount: hallucinationCount,
  };
}