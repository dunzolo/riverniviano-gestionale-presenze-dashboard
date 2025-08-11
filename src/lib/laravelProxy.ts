export async function forwardToLaravel(
  req: Request,
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

  // 🔥 forward cookie del client
  const cookies = incoming.get("cookie");
  if (cookies) headers.set("Cookie", cookies);

  // 🔥 forward content-type se presente (POST/PATCH/DELETE)
  const ct = incoming.get("content-type");
  if (ct && !headers.has("Content-Type")) headers.set("Content-Type", ct);

  // 🔥 importantissimo per Sanctum (stateful)
  const origin = incoming.get("origin");
  if (origin) headers.set("Origin", origin);
  const referer = incoming.get("referer");
  if (referer) headers.set("Referer", referer);
  headers.set("X-Requested-With", "XMLHttpRequest");

  // 🔥 CSRF pass-through (serve per mutate)
  const xsrf = incoming.get("x-xsrf-token");
  if (xsrf) headers.set("X-XSRF-TOKEN", xsrf);

  // Body passthrough se non fornito esplicitamente
  let body = options.body;
  if (!body && method !== "GET" && method !== "HEAD") {
    body = await req.text();
  }

  const url = `${backend}${laravelPath}${search}`;
  const res = await fetch(url, { method, headers, body, redirect: "manual" });

  // Propaga Set-Cookie (compat Node/Undici)
  const setCookies =
    (res.headers as any).getSetCookie?.() ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie") as string] : []);

  const outHeaders = new Headers();
  for (const c of setCookies) outHeaders.append("set-cookie", c);

  const resCT = res.headers.get("content-type");
  if (resCT) outHeaders.set("content-type", resCT);

  // Se Laravel ha risposto con un redirect HTML (302/303/…),
  // convertiamo in 204 per la SPA (niente body "Redirecting…")
  if (res.status >= 300 && res.status < 400) {
    return new Response(null, { status: 204, headers: outHeaders });
  }
  
  if (res.status === 204) {
    return new Response(null, { status: res.status, headers: outHeaders });
  }
  const text = await res.text();
  return new Response(text, { status: res.status, headers: outHeaders });
}