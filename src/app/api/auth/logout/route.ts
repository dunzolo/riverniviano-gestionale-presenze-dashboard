import { forwardToLaravel } from "@/lib/laravelProxy";

export async function POST(req: Request) {
  const clientCookies = req.headers.get("cookie") || "";
  const xsrfMatch = clientCookies.match(/XSRF-TOKEN=([^;]+)/);
  const xsrfToken = xsrfMatch ? decodeURIComponent(xsrfMatch[1]) : "";

  return forwardToLaravel(req, "/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
    },
  });
}