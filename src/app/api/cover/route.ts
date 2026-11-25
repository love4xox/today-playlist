import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title")?.trim() || "";
  const artist = searchParams.get("artist")?.trim() || "";

  if (!title && !artist) {
    return NextResponse.json({ coverUrl: null, previewUrl: null }, { status: 400 });
  }

  try {
    const query = encodeURIComponent(`${title} ${artist}`.trim());
    const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=6`;
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      return NextResponse.json({ coverUrl: null, previewUrl: null }, { status: 502 });
    }

    const data = await res.json();
    const results: Array<{
      artworkUrl100?: string;
      previewUrl?: string;
      artistName?: string;
      trackName?: string;
    }> = Array.isArray(data.results) ? data.results : [];

    const normArtist = artist.toLowerCase().replace(/\s+/g, "");
    const normTitle = title.toLowerCase().replace(/\s+/g, "");

    const matched =
      results.find((item) => {
        if (!item.artworkUrl100) return false;
        const itemArtist = (item.artistName || "").toLowerCase().replace(/\s+/g, "");
        const itemTitle = (item.trackName || "").toLowerCase().replace(/\s+/g, "");
        return (
          (normArtist && itemArtist.includes(normArtist)) &&
          (normTitle && itemTitle.includes(normTitle))
        );
      }) ||
      results.find(
        (item) =>
          item.artworkUrl100 &&
          normArtist &&
          (item.artistName || "").toLowerCase().replace(/\s+/g, "").includes(normArtist)
      ) ||
      results.find((item) => item.artworkUrl100);

    const coverUrl = matched?.artworkUrl100
      ? matched.artworkUrl100.replace("100x100bb", "600x600bb")
      : null;
    const previewUrl = matched?.previewUrl || null;

    return NextResponse.json({ coverUrl, previewUrl });
  } catch {
    return NextResponse.json({ coverUrl: null, previewUrl: null }, { status: 500 });
  }
}