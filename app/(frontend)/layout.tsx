import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteSettings } from "@/lib/content";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import IntroLoader from "@/components/ui/IntroLoader";
import ChatWidget from "@/components/chat/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "AI-driven growth for founders who want results, not reports. Performance marketing, paid media, and AI-powered creative for Dubai/UAE and global brands.";

const SITE_TITLE = "Hammad Yousuf — AI Marketing Growth Strategist";

export async function generateMetadata(): Promise<Metadata> {
  // Site-wide SEO defaults are editable in /admin → Site Settings. Relative OG
  // image URLs resolve against metadataBase automatically.
  const settings = await getSiteSettings();
  const description = settings?.defaultDescription?.trim() || SITE_DESCRIPTION;
  // Falls back to the AI brand card so index/home pages always have a social
  // image; detail pages (case studies, posts, products) override via their own
  // opengraph-image route.
  const ogImage = settings?.defaultOgImage?.url ?? "/ai/og-default.jpg";
  const creator = settings?.twitterHandle?.trim();

  return {
    metadataBase: new URL("https://withhammad.com"),
    title: SITE_TITLE,
    description,
    openGraph: {
      type: "website",
      siteName: "With Hammad",
      locale: "en_US",
      url: "/",
      title: SITE_TITLE,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
      ...(creator ? { creator } : {}),
    },
    // Search-engine site verification. Set these in Vercel → Project → Settings →
    // Environment Variables (both must be NEXT_PUBLIC_ so they're available at
    // metadata build time):
    //   NEXT_PUBLIC_GSC_VERIFICATION  → Google Search Console "HTML tag" token
    //   NEXT_PUBLIC_BING_VERIFICATION → Bing Webmaster Tools meta token (msvalidate.01)
    // When unset, the field is omitted entirely (no empty/invalid meta tags).
    verification: {
      ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
        ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
        : {}),
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
        ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } }
        : {}),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <SmoothScrollProvider>
          <IntroLoader />
          <CustomCursor />
          <NavBar />
          {children}
          <Footer />
          <ChatWidget />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
