/**
 * Ask the running app to drop a cached tag.
 *
 * Called at the end of the seed scripts so a reseed shows up immediately
 * rather than after the cache's hourly revalidate. Silent no-op when the app
 * URL or secret is not configured, since seeding a local database without a
 * running app is a normal thing to do.
 */
export async function revalidate(tag: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!url || !secret) {
    console.log(
      `Skipped cache revalidation for "${tag}": set NEXT_PUBLIC_APP_URL and REVALIDATE_SECRET to enable.`
    );
    return;
  }

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ tag }),
    });

    if (!response.ok) {
      console.warn(`Cache revalidation for "${tag}" failed: ${response.status}`);
      return;
    }
    console.log(`Revalidated cache tag "${tag}".`);
  } catch (error) {
    console.warn(
      `Cache revalidation for "${tag}" could not reach the app:`,
      error instanceof Error ? error.message : error
    );
  }
}
