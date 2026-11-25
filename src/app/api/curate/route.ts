import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { prepareCandidateTracks, validateAndBuildPlaylist } from "@/lib/playlist";
import { MoodType, Track, WeatherType } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      vault,
      weather,
      mood,
      count,
    }: {
      vault: Track[];
      weather: WeatherType;
      mood: MoodType;
      count: number;
    } = body;

    if (!Array.isArray(vault) || vault.length === 0) {
      return NextResponse.json(
        { error: "곡 창고가 비어 있습니다. 먼저 좋아하는 곡을 저장해 주세요." },
        { status: 400 }
      );
    }

    // 1단계: 규칙 엔진으로 중복 곡 제거 및 후보 필터링
    const allUniqueTracks = prepareCandidateTracks(vault, "전체");
    const moodFilteredTracks = prepareCandidateTracks(vault, mood);
    const requested = Math.max(1, Math.min(Number(count) || 3, allUniqueTracks.length));

    // 무드 일치 곡이 요청 곡 수보다 적으면 전체 중복 제거 곡 풀을 후보로 사용하여 요청 곡 수 보장
    const candidates =
      moodFilteredTracks.length >= requested ? moodFilteredTracks : allUniqueTracks;

    const candidateSummary = candidates
      .map(
        (t) =>
          `- ID: "${t.id}" | 곡명: "${t.title}" | 아티스트: "${t.artist}" | 장르: ${t.genre} | 태그: [${t.moodTags.join(", ")}]${t.note ? ` | 메모: ${t.note}` : ""}`
      )
      .join("\n");

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `당신은 감각적인 음악 큐레이터입니다.
오늘의 날씨: "${weather}"
현재 기분: "${mood}"
요청 곡 수: 정확히 ${requested}곡

[규칙]
1. 반드시 아래 [후보 곡 목록]에 있는 ID 중에서만 정확히 ${requested}곡을 고르세요.
2. 목록에 없는 곡이나 ID를 절대 지어내지 마세요.
3. 같은 ID를 중복 선택하지 마세요.
4. 각 곡마다 오늘의 날씨·기분과 연결되는 짧고 감성적인 한 줄 선곡 코멘트를 한국어로 작성하세요.

[후보 곡 목록]
${candidateSummary}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: {
              type: Type.STRING,
              description: "오늘의 플레이리스트를 한 줄로 표현하는 매거진 제목",
            },
            selections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trackId: { type: Type.STRING },
                  comment: { type: Type.STRING },
                },
                required: ["trackId", "comment"],
              },
            },
          },
          required: ["headline", "selections"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const aiSelections = Array.isArray(parsed.selections) ? parsed.selections : [];

    // 2단계: 환각 ID 차단 + 중복 제거 + 요청 곡 수 일치 최종 검증
    const validated = validateAndBuildPlaylist(
      candidates,
      aiSelections,
      requested
    );

    return NextResponse.json({
      headline:
        parsed.headline || `${weather}의 공기, ${mood}을 위한 ${requested}트랙`,
      items: validated.items,
      filteredHallucinationCount: validated.filteredHallucinationCount,
    });
  } catch (error) {
    console.error("Curate API error:", error);
    return NextResponse.json(
      { error: "플레이리스트 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}