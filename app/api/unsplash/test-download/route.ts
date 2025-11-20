import { NextResponse } from "next/server";

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;

export async function GET(req: Request) {
  if (!ACCESS_KEY) {
    return new Response("Missing UNSPLASH_ACCESS_KEY", { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const count = Math.max(1, Math.min(10, Number(searchParams.get("count") || "1")));

  if (!q) {
    return new Response(
      "Fehler: q-Parameter fehlt. Beispiel: /api/unsplash/test-download?q=cabbage&count=3",
      { status: 400 }
    );
  }

  const H = {
    Authorization: `Client-ID ${ACCESS_KEY}`,
    "Accept-Version": "v1",
  };

  const lines: string[] = [];
  lines.push(`Unsplash Test Download Report`);
  lines.push(`App Key Prefix: ${ACCESS_KEY.slice(0, 8)}`);
  lines.push(`Date: ${new Date().toISOString()}`);
  lines.push(`Query: ${q}`);
  lines.push(`Runs: ${count}`);
  lines.push("");

  for (let i = 0; i < count; i++) {
    // 1) Suche
    const s = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1`,
      { headers: H, cache: "no-store" }
    );
    const sJson = await s.json().catch(() => null);
    const first = sJson?.results?.[0];

    lines.push(`--- Run #${i + 1} ---`);
    lines.push(`search_status: ${s.status}`);

    if (!first) {
      lines.push(`ERROR: Keine Suchergebnisse.`);
      lines.push("");
      continue;
    }

    // 2) Foto-Details -> download_location
    const p = await fetch(`https://api.unsplash.com/photos/${first.id}`, { headers: H, cache: "no-store" });
    const pJson = await p.json().catch(() => null);
    const downloadLocation: string | undefined = pJson?.links?.download_location;

    if (!downloadLocation) {
      lines.push(`ERROR: Keine download_location im Photo-Objekt.`);
      lines.push("");
      continue;
    }

    lines.push(`photo_id: ${first.id}`);
    lines.push(`download_location: ${downloadLocation}`);

    // 3) Download-Event triggern (zählt)
    const d = await fetch(downloadLocation, { headers: H, cache: "no-store" });
    const dText = await d.text();
    let dJson: any; try { dJson = JSON.parse(dText); } catch { dJson = { raw: dText }; }

    const xreq = d.headers.get("x-request-id");
    const rl = d.headers.get("x-ratelimit-limit");
    const rr = d.headers.get("x-ratelimit-remaining");

    lines.push(`download_status: ${d.status}`);
    lines.push(`x-request-id: ${xreq || "-"}`);
    lines.push(`rate_limit: ${rl || "-"}`);
    lines.push(`rate_remaining: ${rr || "-"}`);

    // 4) Datei-URL (images.unsplash.com/...) per HEAD „anstoßen“ (Nutzung)
    // ... nach dem Download-Ping:
    const fileUrl: string | undefined = dJson?.url;
    lines.push(`file_url: ${fileUrl || "-"}`);

    if (d.ok && fileUrl) {
      try {
        // Cache-Busting
        const busted = fileUrl + (fileUrl.includes("?") ? "&" : "?") + "nocache=" + Date.now() + "_" + Math.random().toString(36).slice(2);

        // echte Nutzung: GET nur das erste Byte
        const h = await fetch(busted, {
          method: "GET",
          headers: { Range: "bytes=0-0", Accept: "image/*", "Cache-Control": "no-cache" },
          cache: "no-store",
        });

        lines.push(`get_status: ${h.status}`); // sollte 206 (Partial Content) oder 200 sein
        lines.push(`get_content_range: ${h.headers.get("content-range") || "-"}`);
        lines.push(`get_length: ${h.headers.get("content-length") || "-"}`);
      } catch (e: any) {
        lines.push(`get_error: ${e?.message || "GET failed"}`);
      }
    } else {
      lines.push(`ERROR: Download-Antwort ohne url-Feld.`);
    }


    lines.push("");
  }

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="unsplash-test-report.txt"',
    },
  });
}
