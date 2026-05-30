import { wpFetch } from "@/lib/wp";

// ---- Types (match the live WPGraphQL schema from backend-setup-guide.md) ----

export type ServiceTypeTerm = {
  name: string;
  slug: string;
};

export type CaseStudyFields = {
  clientName: string | null;
  industry: string | null;
  isHero: boolean | null;
  isSample: boolean | null;
  heroMetric: string | null;
  heroMetricLabel: string | null;
  showLogo: boolean | null;
  // WPGraphQL for ACF v2 exposes image fields as a media connection (AcfMediaItemConnectionEdge),
  // regardless of the ACF "return format" — so this is an edge with a node, not a scalar URL.
  clientLogo: {
    node: {
      sourceUrl: string | null;
      altText: string | null;
    } | null;
  } | null;
};

export type CaseStudyCard = {
  id: string;
  title: string | null;
  slug: string;
  caseStudyFields: CaseStudyFields | null;
  serviceTypes: { nodes: ServiceTypeTerm[] } | null;
};

type CaseStudiesResponse = {
  caseStudies: { nodes: CaseStudyCard[] } | null;
};

// ---- Query ----

export const CASE_STUDIES_QUERY = /* GraphQL */ `
  query SelectedWorkCaseStudies {
    caseStudies(first: 50) {
      nodes {
        id
        title
        slug
        caseStudyFields {
          clientName
          industry
          isHero
          isSample
          heroMetric
          heroMetricLabel
          showLogo
          clientLogo {
            node {
              sourceUrl
              altText
            }
          }
        }
        serviceTypes {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

// ---- Safe fetcher ----

const REQUEST_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("WPGraphQL request timed out")), ms),
    ),
  ]);
}

/**
 * Fetches case studies for the Selected Work section.
 * Never throws: if the CMS is unreachable, the env is unset, or the schema
 * isn't ready yet, it logs a warning and returns [] so the section renders its
 * graceful empty state. It "lights up" automatically once the CMS returns data.
 */
export async function getCaseStudies(): Promise<CaseStudyCard[]> {
  if (!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL) {
    console.warn(
      "[wp] NEXT_PUBLIC_WP_GRAPHQL_URL not set — Selected Work renders empty state.",
    );
    return [];
  }
  try {
    const data = await withTimeout(
      wpFetch<CaseStudiesResponse>(CASE_STUDIES_QUERY),
      REQUEST_TIMEOUT_MS,
    );
    const nodes = data?.caseStudies?.nodes ?? [];
    // Lead with the hero case study, keep CMS order otherwise.
    return [...nodes].sort((a, b) => {
      const ah = a.caseStudyFields?.isHero ? 1 : 0;
      const bh = b.caseStudyFields?.isHero ? 1 : 0;
      return bh - ah;
    });
  } catch (err) {
    console.warn(
      "[wp] caseStudies fetch failed — Selected Work renders empty state:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

// ---- Service filter helpers ----

export const SERVICE_FILTERS = [
  "All",
  "PPC",
  "SEO",
  "Paid Social",
  "CRO",
  "Multi-Market",
] as const;

export type ServiceFilter = (typeof SERVICE_FILTERS)[number];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function caseStudyMatchesFilter(
  cs: CaseStudyCard,
  filter: ServiceFilter,
): boolean {
  if (filter === "All") return true;
  const target = normalize(filter);
  return (
    cs.serviceTypes?.nodes.some((t) => normalize(t.name) === target) ?? false
  );
}

// ---- Services (CMS-optional; the Services section renders static otherwise) ----

export type ServiceItem = {
  id: string;
  title: string | null;
  slug: string;
  excerpt: string | null;
};

type ServicesResponse = {
  services: { nodes: ServiceItem[] } | null;
};

// NOTE: only core `service` CPT fields are queried. The ACF group for services
// (price/summary/outcome) isn't given an explicit GraphQL field-group name in
// the backend guide — wire those in here once the name is confirmed.
export const SERVICES_QUERY = /* GraphQL */ `
  query Services {
    services(first: 20) {
      nodes {
        id
        title
        slug
        excerpt
      }
    }
  }
`;

export async function getServices(): Promise<ServiceItem[]> {
  if (!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL) return [];
  try {
    const data = await withTimeout(
      wpFetch<ServicesResponse>(SERVICES_QUERY),
      REQUEST_TIMEOUT_MS,
    );
    return data?.services?.nodes ?? [];
  } catch (err) {
    console.warn(
      "[wp] services fetch failed — Services renders static content:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

// ---- Single case study (detail page) ----

export type CaseStudyDetailFields = {
  clientName: string | null;
  industry: string | null;
  servicesUsed: string | null;
  isHero: boolean | null;
  isSample: boolean | null;
  showLogo: boolean | null;
  clientLogo: {
    node: { sourceUrl: string | null; altText: string | null } | null;
  } | null;
  heroMetric: string | null;
  heroMetricLabel: string | null;
  theChallenge: string | null;
  theStrategy: string | null;
  theExecution: string | null;
  metric1: string | null;
  label1: string | null;
  metric2: string | null;
  label2: string | null;
  metric3: string | null;
  label3: string | null;
  metric4: string | null;
  label4: string | null;
  metric5: string | null;
  label5: string | null;
  testimonialQuote: string | null;
  testimonialName: string | null;
  testimonialTitle: string | null;
  testimonialLinkedin: string | null;
  galleryNote: string | null;
};

export type CaseStudyDetail = {
  id: string;
  title: string | null;
  slug: string;
  caseStudyFields: CaseStudyDetailFields | null;
  serviceTypes: { nodes: ServiceTypeTerm[] } | null;
};

export const CASE_STUDY_BY_SLUG_QUERY = /* GraphQL */ `
  query CaseStudyBySlug($slug: ID!) {
    caseStudy(id: $slug, idType: SLUG) {
      id
      title
      slug
      caseStudyFields {
        clientName
        industry
        servicesUsed
        isHero
        isSample
        showLogo
        clientLogo {
          node {
            sourceUrl
            altText
          }
        }
        heroMetric
        heroMetricLabel
        theChallenge
        theStrategy
        theExecution
        metric1
        label1
        metric2
        label2
        metric3
        label3
        metric4
        label4
        metric5
        label5
        testimonialQuote
        testimonialName
        testimonialTitle
        testimonialLinkedin
        galleryNote
      }
      serviceTypes {
        nodes {
          name
          slug
        }
      }
    }
  }
`;

export async function getCaseStudyBySlug(
  slug: string,
): Promise<CaseStudyDetail | null> {
  if (!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL) return null;
  try {
    const data = await withTimeout(
      wpFetch<{ caseStudy: CaseStudyDetail | null }>(CASE_STUDY_BY_SLUG_QUERY, {
        slug,
      }),
      REQUEST_TIMEOUT_MS,
    );
    return data?.caseStudy ?? null;
  } catch (err) {
    console.warn(
      `[wp] caseStudy(${slug}) fetch failed:`,
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

// ---- Index (for generateStaticParams + prev/next nav) ----

export type CaseStudyIndexItem = {
  slug: string;
  title: string | null;
  isHero: boolean;
  isSample: boolean;
};

type CaseStudyIndexResponse = {
  caseStudies: {
    nodes: {
      slug: string;
      title: string | null;
      caseStudyFields: { isHero: boolean | null; isSample: boolean | null } | null;
    }[];
  } | null;
};

export const CASE_STUDY_INDEX_QUERY = /* GraphQL */ `
  query CaseStudyIndex {
    caseStudies(first: 100) {
      nodes {
        slug
        title
        caseStudyFields {
          isHero
          isSample
        }
      }
    }
  }
`;

export async function getCaseStudyIndex(): Promise<CaseStudyIndexItem[]> {
  if (!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL) return [];
  try {
    const data = await withTimeout(
      wpFetch<CaseStudyIndexResponse>(CASE_STUDY_INDEX_QUERY),
      REQUEST_TIMEOUT_MS,
    );
    const nodes = data?.caseStudies?.nodes ?? [];
    // Hero case study first, then CMS order — stable for prev/next nav.
    return nodes
      .map((n) => ({
        slug: n.slug,
        title: n.title,
        isHero: !!n.caseStudyFields?.isHero,
        isSample: !!n.caseStudyFields?.isSample,
      }))
      .sort((a, b) => (b.isHero ? 1 : 0) - (a.isHero ? 1 : 0));
  } catch (err) {
    console.warn(
      "[wp] caseStudy index fetch failed:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}

// ---- Testimonials (carousel; section hides entirely when empty) ----

export type Testimonial = {
  id: string;
  title: string | null;
  testimonialFields: {
    quote: string | null;
    personName: string | null;
    personTitle: string | null;
    linkedinUrl: string | null;
  } | null;
};

type TestimonialsResponse = {
  testimonials: { nodes: Testimonial[] } | null;
};

export const TESTIMONIALS_QUERY = /* GraphQL */ `
  query Testimonials {
    testimonials(first: 20) {
      nodes {
        id
        title
        testimonialFields {
          quote
          personName
          personTitle
          linkedinUrl
        }
      }
    }
  }
`;

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL) return [];
  try {
    const data = await withTimeout(
      wpFetch<TestimonialsResponse>(TESTIMONIALS_QUERY),
      REQUEST_TIMEOUT_MS,
    );
    // Only surface testimonials that actually carry a quote.
    return (data?.testimonials?.nodes ?? []).filter(
      (t) => !!t.testimonialFields?.quote?.trim(),
    );
  } catch (err) {
    console.warn(
      "[wp] testimonials fetch failed — section hidden:",
      err instanceof Error ? err.message : String(err),
    );
    return [];
  }
}
