import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getSiteSettings } from "@/lib/content";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import HudFrame from "@/components/hud/HudFrame";
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

// Display face for game-menu-scale headlines. Self-hosted (ITF free license) —
// subset woff2s, ~15KB per weight.
const clash = localFont({
  src: [
    { path: "../../public/fonts/ClashDisplay-500.woff2", weight: "500" },
    { path: "../../public/fonts/ClashDisplay-600.woff2", weight: "600" },
    { path: "../../public/fonts/ClashDisplay-700.woff2", weight: "700" },
  ],
  variable: "--font-clash",
  display: "swap",
});

const SITE_DESCRIPTION =
  "I build production AI agents and multi-agent systems that run marketing operations — Claude Code, n8n + MCP and RAG, backed by 6+ years of performance marketing across the GCC.";

const SITE_TITLE = "Hammad Yousuf — AI Marketing Automation Engineer";

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

// Analytics env vars (all NEXT_PUBLIC_ so they ship to the client at build
// time, all optional — each tag is skipped when its env var is absent):
//   NEXT_PUBLIC_GA_MEASUREMENT_ID    → GA4 "G-XXXXXXXXXX" id from Admin → Data Streams
//   NEXT_PUBLIC_LINKEDIN_PARTNER_ID  → LinkedIn Insight Tag partner id (8-digit) from Campaign Manager
// Vercel Analytics + Speed Insights need no env vars and auto-activate on Vercel.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const LINKEDIN_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${clash.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <SmoothScrollProvider>
          <IntroLoader />
          <CustomCursor />
          <HudFrame />
          <NavBar />
          {children}
          <Footer />
          <ChatWidget />
        </SmoothScrollProvider>
        <div className="film-grain" aria-hidden />
        <Analytics />
        <SpeedInsights />
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
        {LINKEDIN_ID ? (
          <>
            <Script id="linkedin-insight" strategy="afterInteractive">{`
              _linkedin_partner_id = "${LINKEDIN_ID}";
              window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);
              (function(l) {
                if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}
                var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript"; b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);
              })(window.lintrk);
            `}</Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element -- LinkedIn requires a raw 1x1 pixel; <noscript> precludes next/image */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                alt=""
                src={`https://px.ads.linkedin.com/collect/?pid=${LINKEDIN_ID}&fmt=gif`}
              />
            </noscript>
          </>
        ) : null}
      </body>
    </html>
  );
}
