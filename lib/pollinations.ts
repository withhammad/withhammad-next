// Build a URL to OUR same-origin image proxy (/api/img) instead of pointing the
// browser straight at image.pollinations.ai.
//
// Why: Pollinations sends `X-Content-Type-Options: nosniff`, and under concurrent
// or throttled requests it sometimes returns a non-image body. A cross-origin
// <img> then trips Chrome's Opaque Response Blocking (net::ERR_BLOCKED_BY_ORB)
// and renders blank. Proxying makes the browser load a same-origin response with
// a guaranteed image/* content type (and lets the server retry transient misses).

export function proxiedImage(
  prompt: string,
  width: number,
  height: number,
  seed: number,
  model = "flux",
): string {
  const p = encodeURIComponent(prompt);
  return `/api/img?p=${p}&w=${width}&h=${height}&seed=${seed}&model=${model}`;
}
