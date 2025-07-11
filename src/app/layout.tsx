import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const neueMontreal = localFont({
  src: [
    {
      path: "../../public/fonts/NeueMontreal-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/NeueMontreal-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

const suisseIntl = localFont({
  src: [
    {
      path: "../../public/fonts/SuisseIntl-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/SuisseIntl-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/SuisseIntl-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/SuisseIntl-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-suisse-intl",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Torrify — Universal Torrent Search",
  description: "Search torrents across all major trackers in one place. Clean, fast, and reliable.",
  keywords: ["torrent", "search", "download", "movies", "tv shows", "music", "games"],
  authors: [{ name: "Torrify" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${neueMontreal.variable} ${suisseIntl.variable}`}>
      <body className="font-suisse antialiased">
        {children}
      </body>
    </html>
  );
}
