import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Torrify - Decentralized Search",
  description: "Privacy-focused. DHT-powered. Verified integrity. The next generation of peer-to-peer discovery.",
  keywords: ["torrent", "search", "decentralized", "p2p", "magnet", "download", "DHT"],
  authors: [{ name: "Torrify" }],
  openGraph: {
    title: "Torrify - Search the Decentralized Web",
    description: "Privacy-focused. DHT-powered. Verified integrity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable}`}>
      <body>
        <div className="page-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
