import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import AISystemsTeaser from "@/components/sections/AISystemsTeaser";
import SelectedWork from "@/components/sections/SelectedWork";
import AudienceRouter from "@/components/sections/AudienceRouter";
import Services from "@/components/sections/Services";
import YouTubeCredibility from "@/components/sections/YouTubeCredibility";
import About from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import FinalCTA from "@/components/sections/FinalCTA";
import { getServices, getTestimonials } from "@/lib/wp-queries";
import { getCaseStudies, pageMetadata } from "@/lib/content";
import { PERSON_SAME_AS } from "@/lib/person";

// ISR: re-fetch case studies periodically so the section lights up once the
// CMS has data (on-demand revalidation is wired in Prompt 15).
export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: "/",
    pageKey: "home",
    fallbackTitle:
      "Hammad Yousuf — AI Marketing Automation Engineer | Dubai",
    fallbackDescription:
      "I build production AI agents and multi-agent systems that run marketing operations — Claude Code, n8n + MCP and RAG, backed by 6+ years of performance marketing across the GCC.",
  });
}

const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hammad Yousuf",
  jobTitle: "AI Marketing Automation Engineer",
  url: "https://withhammad.com",
  image: "https://withhammad.com/hammad-headshot.jpg",
  sameAs: [...PERSON_SAME_AS],
  knowsAbout: [
    "AI agents",
    "Multi-agent systems",
    "Model Context Protocol (MCP)",
    "Retrieval-augmented generation (RAG)",
    "Google Ads",
    "Meta Ads",
    "SEO",
    "Answer Engine Optimization (AEO)",
    "Conversion Rate Optimization (CRO)",
    "Google Analytics 4 (GA4)",
    "Marketing automation",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
};

const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "With Hammad",
  url: "https://withhammad.com",
  // No site search → SearchAction intentionally omitted.
};

const PROFESSIONAL_SERVICE_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "With Hammad — AI Marketing & Performance Growth",
  url: "https://withhammad.com",
  image: "https://withhammad.com/hammad-headshot.jpg",
  founder: { "@type": "Person", name: "Hammad Yousuf" },
  email: "marketing@withhammad.com",
  areaServed: [
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Place", name: "GCC" },
    { "@type": "Place", name: "Worldwide (remote)" },
  ],
  serviceType: [
    "Google Ads management",
    "Meta Ads management",
    "Performance marketing",
    "SEO",
    "Answer Engine Optimization",
    "Conversion rate optimization",
    "Marketing automation",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
};

export default async function Home() {
  const [caseStudies, services, testimonials] = await Promise.all([
    getCaseStudies(),
    getServices(),
    getTestimonials(),
  ]);

  // SelectedWork splits real client work (marquee) from clearly-labeled
  // illustrative samples (a separate "Sample Projects" row), so pass the full set.
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(PROFESSIONAL_SERVICE_LD),
        }}
      />
      <Hero />
      <AISystemsTeaser />
      <SelectedWork caseStudies={caseStudies} />
      <AudienceRouter />
      <Services services={services} />
      <YouTubeCredibility />
      <About />
      <Testimonials testimonials={testimonials} />
      <FinalCTA />
    </>
  );
}
