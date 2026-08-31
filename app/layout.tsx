import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SpotWars — The Internet Attention Market",
    template: "%s | SpotWars",
  },
  description:
    "Put your product on the internet's live leaderboard and fight for the spotlight. SpotWars is the competitive marketplace where products battle for attention, position, and customers.",
  keywords: [
    "product promotion",
    "startup marketing",
    "competitive leaderboard",
    "internet billboard",
    "product launch",
    "attention market",
    "startup discovery",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://spotwars.in"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "SpotWars",
    title: "SpotWars — The Internet Attention Market",
    description:
      "Products compete. The internet decides what gets seen. Fight for the spotlight.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SpotWars — The Internet Attention Market",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpotWars — The Internet Attention Market",
    description: "Products battle for attention. Watch the leaderboard live.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-bg text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
