import type { NextRequest } from "next/server";

// Header da NON inoltrare verso upstream
const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length" // <-- importantissimo
]);

export async function forwardToLaravel(
  req: Request | NextRequest,
  laravelPath: string,
  options: RequestInit = {}
): Promise<Response> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const { search } = new URL(req.url);
  const method = options.method ?? req.method;

  // Copia gli header IN ARRIVO, filtrando gli hop-by-hop
  const headers = new Headers(options.headers ?? {});
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (HOP_BY_HOP.has(k)) return;
    if (!headers.has(key)) headers.set(key, value);
  });

  // Intestazioni utili
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  headers.set("X-Requested-With", "XMLHttpRequest");

  // NON leggere/consumare il body: passa lo stream grezzo
  const body =
    method === "GET" || method === "HEAD" ? undefined : (req as any).body;

  const url = `${backend}${laravelPath}${search}`;
  const upstream = await fetch(url, {
    method,
    headers,
    body,
    ...(body ? ({ duplex: "half" } as any) : {}),
    redirect: "manual"
  });

  // Propaga Set-Cookie e gli altri header (tranne content-length)
  const outHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (key === "content-length") return;
    if (key === "set-cookie") outHeaders.append("set-cookie", v);
    else outHeaders.set(k, v);
  });

  // Stream back della risposta (niente bufferizzazione)
  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders
  });
}