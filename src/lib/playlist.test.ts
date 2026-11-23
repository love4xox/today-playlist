import { describe, expect, it } from "vitest";
import { prepareCandidateTracks, validateAndBuildPlaylist } from "./playlist";
import { Track } from "./types";

const sampleVault: Track[] = [
  {
    id: "trk-1",
    title: "밤편지",
    artist: "아이유",
    genre: "발라드",
    moodTags: ["잔잔함", "위로"],
    createdAt: "2026-11-20",
  },
  {
    id: "trk-1-dup",
    title: "밤편지 ",
    artist: "아이유",
    genre: "발라드",
    moodTags: ["잔잔함"],
    createdAt: "2026-11-21",
  },
  {
    id: "trk-2",
    title: "Hype Boy",
    artist: "NewJeans",
    genre: "K-Pop",
    moodTags: ["신남", "드라이브"],
    createdAt: "2026-11-22",
  },
  {
    id: "trk-3",
    title: "Rainy Day",
    artist: "PATEKO",
    genre: "R&B",
    moodTags: ["잔잔함", "집중"],
    createdAt: "2026-11-23",
  },
];

describe("today-playlist 규칙 엔진 검증", () => {
  it("중복 곡(제목+아티스트 동일)을 제거하고 후보군을 추린다", () => {
    const candidates = prepareCandidateTracks(sampleVault, "전체");
    expect(candidates).toHaveLength(3);
    expect(candidates.map((c) => c.id)).toEqual(["trk-1", "trk-2", "trk-3"]);
  });

  it("AI가 존재하지 않는 환각 ID를 추천하면 차단하고 요청 곡 수만큼만 정확히 맞춘다", () => {
    const candidates = prepareCandidateTracks(sampleVault, "전체");
    const aiRawOutput = [
      { trackId: "fake-hallucinated-999", comment: "없는 곡 추천" },
      { trackId: "trk-3", comment: "비 오는 날 추천" },
      { trackId: "trk-3", comment: "중복 선택 시도" },
      { trackId: "trk-1", comment: "잔잔한 마무리" },
    ];

    const result = validateAndBuildPlaylist(candidates, aiRawOutput, 2);
    expect(result.filteredHallucinationCount).toBe(1);
    expect(result.items).toHaveLength(2);
    expect(result.items.map((i) => i.track.id)).toEqual(["trk-3", "trk-1"]);
  });
});