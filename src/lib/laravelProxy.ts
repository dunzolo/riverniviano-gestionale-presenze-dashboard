export async function forwardToLaravel(
  req: Request,
  laravelPath: string,
  options: RequestInit = {}
): Promise<Response> {
  const laravel = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const clientCookies = req.headers.get("cookie") || "";

  const url = `${laravel}${laravelPath}`;
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  headers.set("Cookie", clientCookies);

  const res = await fetch(url, {
    method: options.method || req.method,
    headers,
    body: options.body,
  });

  const setCookies = res.headers.getSetCookie?.() || [];
  const proxyHeaders = new Headers();
  proxyHeaders.set("Content-Type", "application/json");
  setCookies.forEach((cookie) => proxyHeaders.append("set-cookie", cookie));

  if (res.status === 204) {
    return new Response(null, {
      status: res.status,
      headers: proxyHeaders,
    });
  }

  const data = await res.text();

  return new Response(data, {
    status: res.status,
    headers: proxyHeaders,
  });
}