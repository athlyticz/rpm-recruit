import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * On-demand cache invalidation for reference data.
 *
 * The colleges read is cached for an hour, which means a reseed would
 * otherwise take up to an hour to appear. revalidateTag only works inside the
 * Next runtime, and the seed scripts are standalone Node processes, so they
 * call this instead of importing it.
 *
 * Guarded by a shared secret. Without REVALIDATE_SECRET set, the route refuses
 * rather than allowing anonymous cache busting.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured." },
      { status: 503 }
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let tag: string;
  try {
    ({ tag } = (await request.json()) as { tag: string });
  } catch {
    return NextResponse.json({ error: "Expected a JSON body with a tag." }, { status: 400 });
  }

  const ALLOWED = new Set(["colleges"]);
  if (!ALLOWED.has(tag)) {
    return NextResponse.json({ error: `Unknown tag: ${tag}` }, { status: 400 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: tag });
}
