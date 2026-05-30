import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import SelectedWork from "@/components/sections/SelectedWork";
import AudienceRouter from "@/components/sections/AudienceRouter";
import Services from "@/components/sections/Services";
import YouTubeCredibility from "@/components/sections/YouTubeCredibility";
import About from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import FinalCTA from "@/components/sections/FinalCTA";
import { getServices, getTestimonials } from "@/lib/wp-queries";
import { getCaseStudies, pageMetadata } from "@/lib/content";

// ISR: re-fetch case studies periodically so the section lights up once the
// CMS has data (on-demand revalidation is wired in Prompt 15).
export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    path: "/",
    pageKey: "home",
    fallbackTitle: "Hammad Yousuf — AI Marketing Growth Strategist",
    fallbackDescription:
      "AI-driven growth for founders who want results, not reports. Performance marketing, paid media, and AI-powered creative for Dubai/UAE and global brands.",
  });
}

const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hammad Yousuf",
  jobTitle:
    "AI Marketing Growth Strategist & Performance Marketing Specialist",
  url: "https://withhammad.com",
  image: "https://withhammad.com/hammad-headshot.jpg",
  sameAs: [
    "https://www.youtube.com/@with.hammad",
    "https://www.linkedin.com/in/hammadyousuf",
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
};

export default async function Home() {
  const [caseStudies, services, testimonials] = await Promise.all([
    getCaseStudies(),
    getServices(),
    getTestimonials(),
  ]);

  // Homepage features real client work only; illustrative samples stay in the
  // CMS (and at their /work/[slug] pages) but aren't surfaced here.
  const realCaseStudies = caseStudies.filter(
    (cs) => cs.caseStudyFields?.isSample !== true,
  );

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
      <Hero />
      <SelectedWork caseStudies={realCaseStudies} />
      <AudienceRouter />
      <Services services={services} />
      <YouTubeCredibility />
      <About />
      <Testimonials testimonials={testimonials} />
      <FinalCTA />
    </>
  );
}
