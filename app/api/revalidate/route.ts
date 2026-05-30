import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RevalidateBody {
  slug?: string;
  postType?: string;
  paths?: string[];
  secret?: string;
}

const CASE_STUDY_TYPES = ["case_study", "casestudy", "case-study", "case_studies"];

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { revalidated: false, error: "REVALIDATE_SECRET is not configured." },
      { status: 500 },
    );
  }

  let body: RevalidateBody = {};
  try {
    body = (await req.json()) as RevalidateBody;
  } catch {
    /* empty/non-JSON body is allowed (generic ping) */
  }

  // Accept the secret from a header, the query string, or the body.
  const provided =
    req.headers.get("x-revalidate-secret") ??
    new URL(req.url).searchParams.get("secret") ??
    body.secret ??
    "";

  if (provided !== secret) {
    return Response.json(
      { revalidated: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  // Aggregate pages that surface CMS content always get refreshed.
  const paths = new Set<string>(["/", "/blog", "/products", "/work"]);

  const slug = (body.slug ?? "").trim();
  const type = (body.postType ?? "").toLowerCase();

  if (slug) {
    if (type === "post") {
      paths.add(`/blog/${slug}`);
    } else if (CASE_STUDY_TYPES.includes(type)) {
      paths.add(`/work/${slug}`);
    } else {
      // Unknown type but we have a slug — cover both detail routes safely.
      paths.add(`/blog/${slug}`);
      paths.add(`/work/${slug}`);
    }
  }

  // Allow callers to pass explicit paths too.
  if (Array.isArray(body.paths)) {
    body.paths
      .filter((p) => typeof p === "string" && p.startsWith("/"))
      .forEach((p) => paths.add(p));
  }

  const revalidated: string[] = [];
  for (const p of paths) {
    try {
      revalidatePath(p);
      revalidated.push(p);
    } catch (err) {
      console.warn("[revalidate] failed for", p, err);
    }
  }

  return Response.json({ revalidated: true, paths: revalidated });
}

// Friendly response for manual GET checks (does NOT revalidate).
export function GET() {
  return Response.json({
    ok: true,
    hint: "POST to this endpoint with the x-revalidate-secret header to revalidate.",
  });
}
