interface Env {
  JWT_SECRET?: string;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export class WalletSessionDO {
  fetch(): Response {
    return json({ ok: true, durableObject: "wallet_session" });
  }
}

export class ApprovalRoomDO {
  fetch(): Response {
    return json({ ok: true, durableObject: "approval_room" });
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true });
    }

    if (request.method === "POST" && url.pathname === "/ai/commands/execute") {
      const auth = request.headers.get("authorization") ?? "";
      if (!auth.startsWith("Bearer ")) {
        return json({ ok: false, error: "Unauthorized" }, 401);
      }

      let payload: Record<string, unknown>;
      try {
        payload = (await request.json()) as Record<string, unknown>;
      } catch {
        return json({ ok: false, error: "Invalid JSON" }, 400);
      }

      return json({
        ok: true,
        mode: payload["mode"] ?? "plan",
        command: payload["command"] ?? "",
        note: "DOC API edge worker accepted the command envelope",
      });
    }

    return json({ ok: false, error: "Not Found" }, 404);
  },
};
