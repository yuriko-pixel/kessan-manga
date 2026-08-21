import type { ApiRequest, ApiResponse } from "../_admin";
import { hasValidAdminAuth, sendJson, sendUnauthorized } from "../_admin";

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (!hasValidAdminAuth(req)) {
    sendUnauthorized(res);
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  sendJson(res, 200, { ok: true });
}
