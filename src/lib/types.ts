export type WeatherType = "맑음" | "비" | "흐림" | "눈" | "밤/새벽";
export type MoodType = "집중" | "잔잔함" | "신남" | "위로" | "드라이브";

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  moodTags: MoodType[];
  note?: string;
  coverUrl?: string;
  createdAt: string;
}

export interface CuratedTrackItem {
  track: Track;
  comment: string;
}

export interface CurationResult {
  headline: string;
  items: CuratedTrackItem[];
  filteredHallucinationCount: number;
}