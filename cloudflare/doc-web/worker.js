function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export class WalletRoomDO {
  fetch() {
    return new Response("wallet-room-ok", { status: 200 });
  }
}

export class CommandRoomDO {
  fetch() {
    return new Response("command-room-ok", { status: 200 });
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    return html(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>DOC OS</title>
    <style>
      :root { color-scheme: dark; }
      body { margin:0; font-family: ui-sans-serif, system-ui; background:#0b1220; color:#e5e7eb; }
      .wrap { min-height:100vh; display:grid; place-items:center; padding:24px; }
      .card { width:min(900px,100%); background:#111827; border:1px solid #1f2937; border-radius:14px; padding:28px; }
      h1 { margin:0 0 10px; font-size:28px; }
      p { margin:0 0 16px; color:#9ca3af; }
      .bar { border:1px solid #374151; border-radius:10px; padding:12px; background:#0f172a; color:#cbd5e1; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <section class="card">
        <h1>DOC OS</h1>
        <p>Edge deployment is live. Main app package build is pending Cloudflare Next adapter wiring.</p>
        <div class="bar">Command: Create 1 investor wallet (plan mode)</div>
      </section>
    </div>
  </body>
</html>`);
  },
};
