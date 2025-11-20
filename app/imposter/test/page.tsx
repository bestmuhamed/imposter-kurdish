'use client';
import { useState } from 'react';

export default function UnsplashTestPage() {
  const [q, setQ] = useState('kurdish music');
  const [count, setCount] = useState(1);
  const [logText, setLogText] = useState('');
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLogText('');
    setImgUrl(null);

    try {
      const url = `/api/unsplash/test-download?q=${encodeURIComponent(q)}&count=${count}`;
      const res = await fetch(url, { cache: 'no-store' });
      const text = await res.text();
      setLogText(text);

      // erste file_url aus Report ziehen
      const m = text.match(/file_url:\s*(https?:\/\/images\.unsplash\.com\/\S+)/i);
      setImgUrl(m?.[1] || null);
    } catch (err: any) {
      setLogText('FEHLER: ' + (err?.message || 'unbekannt'));
      setImgUrl(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100dvh', padding: 24, color: '#fff' }}>
      <h1 style={{ marginTop: 0 }}>Unsplash Test (q-Parameter)</h1>

      <form onSubmit={run} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suchtext, z. B. kurdish music"
          style={{
            flex: '1 1 360px',
            minWidth: 260,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,.2)',
            background: 'rgba(255,255,255,.06)',
            color: '#fff',
          }}
        />
        <input
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
          title="Wie oft auslösen"
          style={{
            width: 110,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,.2)',
            background: 'rgba(255,255,255,.06)',
            color: '#fff',
          }}
        />
        <button
          type="submit"
          disabled={loading || !q.trim()}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            fontWeight: 700,
            background: 'linear-gradient(90deg, #22d3ee, #3b82f6)',
            color: '#0b1020',
            border: 'none',
          }}
        >
          {loading ? '… läuft' : 'Test starten'}
        </button>
      </form>

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 520px) 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{
          border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: 12,
          background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))',
          minHeight: 260, display: 'grid', placeItems: 'center'
        }}>
          {imgUrl ? (
            <img src={imgUrl} alt="Unsplash Download" style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain', background: '#0b0b0b', borderRadius: 8 }} />
          ) : (
            <div style={{ opacity: .8 }}>Kein Bild (noch)</div>
          )}
        </div>

        <div style={{
          border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: 12,
          background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Antwort / Report</div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, lineHeight: 1.4 }}>
            {logText || '—'}
          </pre>
        </div>
      </section>
    </main>
  );
}
