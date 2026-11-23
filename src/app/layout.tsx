import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  IBM_Plex_Mono,
  Inter,
  Noto_Sans_KR,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-editorial-serif",
});

const ibmMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans-kr",
});

export const metadata: Metadata = {
  title: "TODAY PLAYLIST | 에디토리얼 사운드 아카이브",
  description: "보유한 곡 창고 안에서 날씨와 기분에 맞춰 환각 없이 선곡하는 AI 큐레이션 룩북",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${cormorant.variable} ${ibmMono.variable} ${notoSansKr.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}