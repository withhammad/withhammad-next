import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://withhammad.com"),
  title: "Hammad Yousuf — AI Marketing Growth Strategist",
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "With Hammad",
    locale: "en_US",
    url: "/",
    title: "Hammad Yousuf — AI Marketing Growth Strategist",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Hammad Yousuf — AI Marketing Growth Strategist",
    description: SITE_DESCRIPTION,
  },
};

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
