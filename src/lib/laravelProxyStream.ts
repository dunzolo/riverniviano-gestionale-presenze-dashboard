import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const HOP_BY_HOP = new Set([
  "connection","keep-alive","proxy-authenticate","proxy-authorization",
  "te","trailers","transfer-encoding","upgrade","host","content-length",
]);

export async function forwardToLaravelStream(
  req: Request | NextRequest,
  laravelPath: string,
  options: RequestInit = {}
): Promise<Response> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const { search } = new URL(req.url);
  const method = options.method ?? req.method;

  // 1) copia header in arrivo filtrando hop-by-hop
  const headers = new Headers(options.headers ?? {});
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (HOP_BY_HOP.has(k)) return;
    if (!headers.has(key)) headers.set(key, value);
  });

  if (!headers.has("accept")) headers.set("accept", "application/json");
  headers.set("x-requested-with", "XMLHttpRequest");

  // 2) cookie: usa i mirror bk_* se ci sono, altrimenti passa quelli in arrivo
  const jar = await cookies();
  const sessMirror = jar.get("bk_laravel_session")?.value || "";
  const xsrfMirror = jar.get("bk_xsrf")?.value || "";

  const incomingCookieHeader = req.headers.get("cookie") || "";

  if (sessMirror || xsrfMirror) {
    // Ricostruisci Cookie per Laravel usando i mirror
    // ATTENZIONE al nome del cookie sessione: NON forzarlo a 'laravel_session'
    // se il tuo config/session.php usa un nome custom (come nel tuo cURL).
    const sessionCookieName =
      process.env.LARAVEL_SESSION_COOKIE_NAME /* opzionale env per esplicitarlo */ ||
      (incomingCookieHeader.match(/(^|;\s)([^=]*_session)=/)?.[2]) || // prova a inferirlo
      "laravel_session";

    const list: string[] = [];
    if (sessMirror) list.push(`${sessionCookieName}=${sessMirror}`);
    if (xsrfMirror) list.push(`XSRF-TOKEN=${xsrfMirror}`);
    headers.set("cookie", list.join("; "));
  } else {
    // fallback: passa i cookie del browser così come sono
    if (incomingCookieHeader) headers.set("cookie", incomingCookieHeader);
    else headers.delete("cookie");
  }

  // 3) XSRF header: se presente, DEVE essere decodificato
  let xsrfHeader = headers.get("x-xsrf-token") || xsrfMirror || "";
  if (xsrfHeader) {
    try {
      xsrfHeader = decodeURIComponent(xsrfHeader);
    } catch {}
    headers.set("x-xsrf-token", xsrfHeader);
  }

  // 4) corpo streaming
  const body = method === "GET" || method === "HEAD" ? undefined : (req as any).body;

  const url = `${backend}${laravelPath}${search}`;
  const upstream = await fetch(url, {
    method,
    headers,
    body,
    ...(body ? ({ duplex: "half" } as any) : {}),
    redirect: "manual",
  });

  // 5) propaga headers in risposta (senza content-length)
  const out = new Headers();
  upstream.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (key === "content-length") return;
    if (key === "set-cookie") out.append("set-cookie", v);
    else out.set(k, v);
  });

  return new Response(upstream.body, { status: upstream.status, headers: out });
}