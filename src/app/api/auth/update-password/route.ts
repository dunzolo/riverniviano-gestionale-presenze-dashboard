import { forwardToLaravel } from "@/lib/laravelProxy";

export async function POST(req: Request) {
  const body = await req.text();

  const clientCookies = req.headers.get("cookie") || "";
  const xsrfMatch = clientCookies.match(/XSRF-TOKEN=([^;]+)/);
  const xsrfToken = xsrfMatch ? decodeURIComponent(xsrfMatch[1]) : "";

  return forwardToLaravel(req, "/update-password", {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
    },
  });
}