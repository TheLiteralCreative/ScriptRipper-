/**
 * Minimal Render health-check endpoint so their pings avoid the full app shell.
 */
export function GET() {
  return new Response("healthy", {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  })
}

export const dynamic = "force-static"
