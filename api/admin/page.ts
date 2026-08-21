import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ApiRequest, ApiResponse } from "../_admin";
import { hasValidAdminAuth, sendJson, sendUnauthorized } from "../_admin";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!hasValidAdminAuth(req)) {
    sendUnauthorized(res);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    sendJson(res, 405, { error: "Method Not Allowed" });
    return;
  }

  try {
    const indexPath = path.join(process.cwd(), "dist", "index.html");
    const html = await readFile(indexPath, "utf8");
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end(req.method === "HEAD" ? "" : html);
  } catch {
    sendJson(res, 500, {
      error: "Admin page is unavailable. Run the frontend build before deploying.",
    });
  }
}
