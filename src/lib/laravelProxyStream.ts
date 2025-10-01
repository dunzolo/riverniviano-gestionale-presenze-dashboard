import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

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
  "content-length",
]);

export async function forwardToLaravelStream(
  req: Request | NextRequest,
  laravelPath: string,
  options: RequestInit = {}
): Promise<Response> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const { search } = new URL(req.url);
  const method = options.method ?? req.method;

  const headers = new Headers(options.headers ?? {});
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (HOP_BY_HOP.has(k)) return;
    if (!headers.has(key)) headers.set(key, value);
  });

  if (!headers.has("accept")) headers.set("accept", "application/json");
  headers.set("x-requested-with", "XMLHttpRequest");

  // ⬇️ QUI la fix: cookies() è async
  const jar = await cookies(); // <-- PRIMA era: const jar = cookies();
  const sess = jar.get("bk_laravel_session")?.value || "";
  const xsrf = jar.get("bk_xsrf")?.value || "";

  const cookieHeaderParts: string[] = [];
  if (sess) cookieHeaderParts.push(`laravel_session=${sess}`);
  if (xsrf) cookieHeaderParts.push(`XSRF-TOKEN=${xsrf}`);
  if (cookieHeaderParts.length) headers.set("cookie", cookieHeaderParts.join("; "));
  else headers.delete("cookie");

  if (xsrf && !headers.has("x-xsrf-token")) {
    headers.set("x-xsrf-token", decodeURIComponent(xsrf));
  }

  const body =
    method === "GET" || method === "HEAD" ? undefined : (req as any).body;

  const url = `${backend}${laravelPath}${search}`;
  const upstream = await fetch(url, {
    method,
    headers,
    body,
    ...(body ? ({ duplex: "half" } as any) : {}),
    redirect: "manual",
  });

  const outHeaders = new Headers();
  upstream.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (key === "content-length") return;
    if (key === "set-cookie") outHeaders.append("set-cookie", v);
    else outHeaders.set(k, v);
  });

  // (Facoltativo) se vuoi aggiornare i cookie mirror quando Laravel li rinnova:
  // const setCookies = (upstream.headers as any).getSetCookie?.() ??
  //   (upstream.headers.get("set-cookie") ? [upstream.headers.get("set-cookie") as string] : []);
  // if (setCookies.length) {
  //   const jarOut = await cookies(); // ⬅️ anche qui serve await
  //   for (const sc of setCookies) {
  //     const mSess = sc.match(/laravel_session=([^;]+)/);
  //     const mXsrf = sc.match(/XSRF-TOKEN=([^;]+)/);
  //     if (mSess) jarOut.set("bk_laravel_session", mSess[1], { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  //     if (mXsrf) jarOut.set("bk_xsrf", mXsrf[1], { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  //   }
  // }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}