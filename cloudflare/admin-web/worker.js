function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export class ApprovalRoomDO {
  fetch() {
    return new Response("approval-room-ok", { status: 200 });
  }
}

export class DealRoomDO {
  fetch() {
    return new Response("deal-room-ok", { status: 200 });
  }
}

export default {
  async fetch() {
    return html(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>DOC Admin</title>
    <style>
      :root { color-scheme: dark; }
      body { margin:0; font-family: ui-sans-serif, system-ui; background:#0a0f1a; color:#e5e7eb; }
      .wrap { min-height:100vh; display:grid; place-items:center; padding:24px; }
      .card { width:min(720px,100%); background:#111827; border:1px solid #1f2937; border-radius:14px; padding:26px; }
      h1 { margin:0 0 8px; font-size:24px; }
      p { margin:0; color:#9ca3af; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <section class="card">
        <h1>DOC Admin</h1>
        <p>Deploy successful. Protect this host with Zero Trust Access before operational use.</p>
      </section>
    </div>
  </body>
</html>`);
  },
};
