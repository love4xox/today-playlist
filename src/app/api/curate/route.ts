import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
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
      vault = [],
      weather,
      mood,
      count = 3,
      seed,
    }: {
      vault?: Track[];
      weather: WeatherType;
      mood: MoodType;
      count?: number;
      seed?: number;
    } = body;

    const requested = Math.max(1, Math.min(Number(count) || 3, 6));

    const existingSummary =
      Array.isArray(vault) && vault.length > 0
        ? vault.map((t) => `${t.title} - ${t.artist}`).join(", ")
        : "없음";

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `당신은 감각적인 음악 큐레이터입니다.
오늘의 날씨: "${weather}"
현재 기분: "${mood}"
추천 곡 수: 정확히 ${requested}곡
요청 시드: ${seed ?? Date.now()}

[규칙]
1. 실제로 존재하는 한국 또는 해외 대중음악/인디/R&B/록/팝 곡 중에서 오늘의 날씨("${weather}")와 기분("${mood}")에 가장 잘 어울리는 곡 ${requested}곡을 새롭게 추천하세요.
2. 아래 [이미 보관함에 있는 곡]은 최대한 중복 추천하지 말고 신선한 곡 위주로 고르세요.
3. 같은 아티스트의 곡이 중복되지 않게 다양하게 구성하세요.
4. 각 곡마다 곡명(title), 아티스트(artist), 장르(genre), 어울리는 무드 태그(moodTags: ["집중", "잔잔함", "신남", "위로", "드라이브"] 중 1~2개), 그리고 감성적인 한 줄 추천 코멘트(comment)를 한국어로 작성하세요.

[이미 보관함에 있는 곡]
${existingSummary}`;

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
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  moodTags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  comment: { type: Type.STRING },
                },
                required: ["title", "artist", "genre", "moodTags", "comment"],
              },
            },
          },
          required: ["headline", "recommendations"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const recs = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [];

    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    const items = recs.slice(0, requested).map(
      (
        rec: {
          title: string;
          artist: string;
          genre?: string;
          moodTags?: MoodType[];
          comment: string;
        },
        idx: number
      ) => ({
        track: {
          id: `rec-${now}-${idx + 1}`,
          title: rec.title,
          artist: rec.artist,
          genre: rec.genre || "Pop",
          moodTags:
            Array.isArray(rec.moodTags) && rec.moodTags.length > 0
              ? rec.moodTags
              : [mood],
          note: rec.comment,
          createdAt: today,
        } satisfies Track,
        comment: rec.comment,
      })
    );

    return NextResponse.json(
      {
        headline:
          parsed.headline || `${weather}의 공기, ${mood}을 위한 ${requested}트랙`,
        items,
        filteredHallucinationCount: 0,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Curate API error:", error);
    return NextResponse.json(
      { error: "새로운 곡을 추천받는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}