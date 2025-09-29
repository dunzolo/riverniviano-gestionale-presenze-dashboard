// src/lib/laravelProxy.ts
import type { NextRequest } from "next/server";

export async function forwardToLaravel(
  req: Request | NextRequest,
  laravelPath: string,
  options: RequestInit = {}
): Promise<Response> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const { search } = new URL(req.url);
  const method = options.method ?? req.method;

  const incoming = req.headers;
  const headers = new Headers(options.headers ?? {});
  headers.set("Accept", "application/json");
  headers.set("X-Requested-With", "XMLHttpRequest");

  // Cookie dal client → backend (Sanctum stateful)
  const cookies = incoming.get("cookie");
  if (cookies) headers.set("Cookie", cookies);

  // Forward Content-Type SOLO se esiste già (es. multipart con boundary)
  const ctIncoming = incoming.get("content-type");
  if (ctIncoming && !headers.has("Content-Type")) {
    headers.set("Content-Type", ctIncoming);
  }

  // Origin/Referer (utile per Sanctum CORS stateful)
  const origin = incoming.get("origin");
  if (origin) headers.set("Origin", origin);
  const referer = incoming.get("referer");
  if (referer) headers.set("Referer", referer);

  // CSRF pass-through (se presente)
  const xsrf = incoming.get("x-xsrf-token");
  if (xsrf) headers.set("X-XSRF-TOKEN", xsrf);

  // Body pass-through (IMPORTANTISSIMO: non consumare lo stream)
  let body = options.body;
  if (!body && method !== "GET" && method !== "HEAD") {
    body = (req as any).body; // ReadableStream
  }

  const url = `${backend}${laravelPath}${search}`;
  const init: any = { method, headers, redirect: "manual" };

  if (body && method !== "GET" && method !== "HEAD") {
    init.body = body;
    // necessario quando si passa uno stream (multipart/form-data)
    init.duplex = "half";
  }

  const res = await fetch(url, init);

  // Propaga Set-Cookie
  const setCookies =
    (res.headers as any).getSetCookie?.() ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie") as string] : []);

  const outHeaders = new Headers();
  for (const c of setCookies) outHeaders.append("set-cookie", c);

  const resCT = res.headers.get("content-type");
  if (resCT) outHeaders.set("content-type", resCT);

  if (res.status >= 300 && res.status < 400) {
    return new Response(null, { status: 204, headers: outHeaders });
  }
  if (res.status === 204) {
    return new Response(null, { status: res.status, headers: outHeaders });
  }

  const text = await res.text();
  return new Response(text, { status: res.status, headers: outHeaders });
}