import type { CaseStudyDetail } from "@/lib/wp-queries";

// ---------------------------------------------------------------------------
// Local, self-contained case-study content (no headless CMS dependency).
// Source of truth: case-studies-content.md. Edit here to update the site.
// Testimonials are intentionally null — the drafted quotes must NOT ship as
// real client words; add them here only once approved.
// ---------------------------------------------------------------------------

const st = (name: string, slug: string) => ({ name, slug });

export const LOCAL_CASE_STUDIES: CaseStudyDetail[] = [
  {
    id: "cs-printo",
    title: "Printo — 3,750 conversions on a single Google Ads rebuild",
    slug: "printo",
    serviceTypes: { nodes: [st("PPC", "ppc"), st("CRO", "cro")] },
    caseStudyFields: {
      clientName: "Printo",
      industry: "Printing / E-commerce",
      servicesUsed: "Google Ads, Performance Max, CRO",
      isHero: true,
      isSample: false,
      showLogo: true,
      clientLogo: null,
      heroMetric: "3,750",
      heroMetricLabel: "Conversions tracked",
      theChallenge:
        "Printo was running one catch-all Google Ads campaign across every product line — box printing, business cards, paper bags, stickers, book printing. Budget was spread thin, impression share was critically low on the highest-intent terms, broad match was draining spend on irrelevant searches, and conversion tracking blurred WhatsApp taps with actual purchases. The result: spend without a clear line to revenue.",
      theStrategy:
        "Restructure for intent and clarity. Split the single campaign into product-specific Search campaigns so budget and messaging matched each buyer's intent. Establish clean conversion tracking that separated genuine purchase/lead actions from low-value taps. Set a defensible Target CPA and let the data — not guesswork — drive bids. Cut waste aggressively with negatives and match-type discipline.",
      theExecution:
        "Broke the catch-all account into tightly themed campaigns and ad groups per product.\nRebuilt responsive search ads with distinct, un-over-pinned headlines per product line.\nLayered in a negative-keyword framework to stop broad-match waste.\nFixed sitelink and tracking issues and set a Target CPA aligned to unit economics.\nIdentified that Arabic search terms converted at a dramatically lower CPA than English — and shifted weight accordingly.",
      videoEmbedUrl:
        "https://www.youtube-nocookie.com/embed/3WRK9XhQ4as?si=1FhqnwxBTk0vX6yu",
      metric1: "24,600",
      label1: "Clicks driven",
      metric2: "3,750",
      label2: "Conversions tracked",
      metric3: "AED 42,100",
      label3: "Managed spend",
      metric4: null,
      label4: null,
      metric5: null,
      label5: null,
      testimonialQuote: null,
      testimonialName: null,
      testimonialTitle: null,
      testimonialLinkedin: null,
      galleryNote: null,
    },
  },
  {
    id: "cs-deewan",
    title: "Deewan — +30% leads, −28% CPA across 4 GCC markets",
    slug: "deewan-equipment-trading",
    serviceTypes: {
      nodes: [st("PPC", "ppc"), st("Multi-Market", "multi-market")],
    },
    caseStudyFields: {
      clientName: "Deewan Equipment Trading",
      industry: "B2B / Equipment Trading",
      servicesUsed: "Google Ads, Paid Social, Multi-Market Strategy",
      isHero: false,
      isSample: false,
      showLogo: true,
      clientLogo: null,
      heroMetric: "−28%",
      heroMetricLabel: "Lower cost per acquisition",
      theChallenge:
        "Deewan needed qualified B2B leads across four GCC markets — UAE, Saudi Arabia, Qatar and Bahrain — each with different buyer behavior, language mix, and competition. A single blanket approach was producing inconsistent lead quality and rising costs as spend scaled.",
      theStrategy:
        "Treat each market as its own campaign with localized intent, then concentrate budget where cost-per-lead was lowest and quality highest. Tighten targeting around genuine commercial-intent searches and reduce spend on tyre-kicker traffic.",
      theExecution:
        "Built market-specific campaigns with localized keywords and ad copy across the four countries.\nImplemented conversion tracking to compare lead quality and CPA by market.\nReallocated budget continuously toward the best-performing geos and search themes.\nPruned low-intent terms and refined audience signals to lift lead quality.",
      videoEmbedUrl: null,
      metric1: "+30%",
      label1: "Increase in leads",
      metric2: "−28%",
      label2: "Lower CPA",
      metric3: "4",
      label3: "GCC markets",
      metric4: null,
      label4: null,
      metric5: null,
      label5: null,
      testimonialQuote: null,
      testimonialName: null,
      testimonialTitle: null,
      testimonialLinkedin: null,
      galleryNote: null,
    },
  },
  {
    id: "cs-good-morning-property",
    title: "Good Morning Property — 80 leads at AED 76 CPL",
    slug: "good-morning-property",
    serviceTypes: {
      nodes: [st("Paid Social", "paid-social"), st("CRO", "cro")],
    },
    caseStudyFields: {
      clientName: "Good Morning Property",
      industry: "Real Estate",
      servicesUsed: "Meta Ads, Lead Generation, Landing Page CRO",
      isHero: false,
      isSample: false,
      showLogo: true,
      clientLogo: null,
      heroMetric: "AED 76.38",
      heroMetricLabel: "Cost per lead",
      theChallenge:
        "In Dubai's crowded, high-cost real-estate market, generating qualified buyer/seller leads without overpaying is hard. The brief: a steady flow of genuine enquiries at a controlled cost per lead.",
      theStrategy:
        "Pair sharp audience targeting with a high-converting lead flow — strong hook, clear offer, fast-loading form — so every dirham of ad spend translated into a real enquiry rather than a wasted click.",
      theExecution:
        "Built audience sets around genuine property-intent signals.\nWrote scroll-stopping ad creative tailored to the offer and locality.\nOptimized the landing page and lead form to cut friction and lift completion rate.\nMonitored lead quality and iterated creative to keep CPL efficient.",
      videoEmbedUrl: null,
      metric1: "80",
      label1: "Qualified leads",
      metric2: "AED 76.38",
      label2: "Cost per lead",
      metric3: null,
      label3: null,
      metric4: null,
      label4: null,
      metric5: null,
      label5: null,
      testimonialQuote: null,
      testimonialName: null,
      testimonialTitle: null,
      testimonialLinkedin: null,
      galleryNote: null,
    },
  },
  {
    id: "cs-rainbow-printing",
    title: "Rainbow Printing — +50% organic traffic, +27% CVR",
    slug: "rainbow-printing",
    serviceTypes: { nodes: [st("SEO", "seo"), st("CRO", "cro")] },
    caseStudyFields: {
      clientName: "Rainbow Printing Industries",
      industry: "Printing / Manufacturing",
      servicesUsed: "SEO, Content, CRO",
      isHero: false,
      isSample: false,
      showLogo: true,
      clientLogo: null,
      heroMetric: "+50%",
      heroMetricLabel: "Organic traffic growth",
      theChallenge:
        "Strong manufacturing capability, weak organic presence. The site wasn't ranking for the commercial terms buyers actually searched, and the traffic it did get wasn't converting into enquiries at a healthy rate.",
      theStrategy:
        "Win organic visibility on high-intent commercial keywords, then make sure that hard-won traffic converted — pairing SEO with conversion-rate optimization so growth compounded instead of leaking.",
      theExecution:
        "Researched and targeted the commercial keywords with real buyer intent.\nStrengthened on-page SEO, content structure, and technical fundamentals.\nRan CRO improvements on key pages to lift enquiry/conversion rate.\nTracked rankings → traffic → conversions as one connected funnel.",
      videoEmbedUrl: null,
      metric1: "+50%",
      label1: "Organic traffic growth",
      metric2: "+27%",
      label2: "Lift in conversion rate",
      metric3: null,
      label3: null,
      metric4: null,
      label4: null,
      metric5: null,
      label5: null,
      testimonialQuote: null,
      testimonialName: null,
      testimonialTitle: null,
      testimonialLinkedin: null,
      galleryNote: null,
    },
  },
];
