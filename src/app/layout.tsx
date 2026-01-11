import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Torrify - Decentralized Torrent Search Engine",
  description: "The next-generation decentralized torrent search engine. Search millions of torrents across multiple sources instantly.",
  keywords: ["torrent", "search", "decentralized", "p2p", "magnet", "download"],
  authors: [{ name: "Torrify" }],
  openGraph: {
    title: "Torrify - Decentralized Torrent Search",
    description: "Search millions of torrents across multiple sources instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="page-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
