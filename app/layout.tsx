import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InternetBillboard.space — The Internet Attention Market",
    template: "%s | InternetBillboard.space",
  },
  description:
    "Put your product on the internet's live billboard and fight for the spotlight. InternetBillboard.space is the competitive marketplace where products battle for attention, position, and customers.",
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
    process.env.NEXT_PUBLIC_APP_URL || "https://internetbillboard.space"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "InternetBillboard.space",
    title: "InternetBillboard.space — The Internet Attention Market",
    description:
      "Products compete. The internet decides what gets seen. Fight for the spotlight.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "InternetBillboard.space — The Internet Attention Market",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InternetBillboard.space — The Internet Attention Market",
    description: "Products battle for attention. Watch the billboard live.",
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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "url": "https://internetbillboard.space/",
                  "name": "InternetBillboard.space",
                  "description":
                    "The live internet billboard where products compete for attention and visibility.",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://internetbillboard.space/search?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Organization",
                  "url": "https://internetbillboard.space",
                  "name": "InternetBillboard.space",
                  "logo": "https://internetbillboard.space/logo.jpg",
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} bg-bg text-ink antialiased pt-10`}>
        {children}
      </body>
    </html>
  );
}
