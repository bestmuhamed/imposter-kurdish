// app/page.tsx
'use client'

import Link from 'next/link'
import { useLanguage } from './_components/LanguageProvider'
import { getDict } from '@/lib/i18n'

export default function Page() {
  const { lang } = useLanguage()
  const t = getDict(lang)

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: [
          'radial-gradient(1200px 600px at 20% -10%, rgba(255,255,255,.08), transparent)',
          'radial-gradient(1000px 500px at 120% 10%, rgba(255,255,255,.05), transparent)',
          'radial-gradient(800px 400px at -10% 30%, rgba(99,102,241,.10), transparent)',
          'radial-gradient(900px 450px at 110% 70%, rgba(236,72,153,.08), transparent)'
        ].join(',')
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 780,
          padding: 24,
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,.15)',
          background: 'linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05))',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,.12)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, letterSpacing: 1.4, opacity: 0.8 }}>{t.home__badge}</div>
          <h1 style={{
            fontSize: 34, margin: '8px 0 6px',
            background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>{t.home__title}</h1>
          <p style={{ opacity: 0.85, fontSize: 16 }}>
            {t.home__lead_prefix} <em>Imposter</em>.
          </p>

          {/* >>> NEU: CTA zum Singlepager (/single/hero) */}
          {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <Link
              href="/single/hero"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
                color: '#0b1020',
                border: '1px solid rgba(255,255,255,.18)',
                boxShadow: '0 6px 20px rgba(167,139,250,.25)'
              }}
            >
              ✨ Singlepager öffnen
            </Link>
          </div> */}
          {/* <<< NEU */}
        </div>

        {/* Liste */}
        <div
          className="grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginTop: 16
          }}
        >
          {/* Imposter Game Karte */}
          <article
            style={{
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(167,139,250,.35)',
              borderRadius: 14,
              padding: 16,
              display: 'grid',
              alignContent: 'space-between',
              gap: 12,
              background: 'transparent',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)'
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: [
                  'linear-gradient(180deg, rgba(12,10,24,.55), rgba(12,10,24,.65))',
                  'url(/imposter.png)'
                ].join(','),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'saturate(1.1) brightness(0.9)',
                transform: 'scale(1.02)'
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(600px 280px at 10% -10%, rgba(129,140,248,.25), transparent), radial-gradient(500px 240px at 110% 10%, rgba(244,114,182,.18), transparent)'
              }}
            />
            <div style={{ position: 'relative' }}>
              <header>
                <div style={{ fontSize: 28, lineHeight: 1 }}>🕵️‍♀️ Imposter</div>
                <p style={{ marginTop: 6, opacity: 0.9, fontSize: 14 }}>
                  {t.imposter__desc}
                </p>
              </header>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Link
                  href="/imposter"
                  className="btn btn-accent"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'linear-gradient(90deg, #818cf8, #f472b6)',
                    color: '#fff',
                    boxShadow: '0 6px 20px rgba(129,140,248,.35)'
                  }}
                >
                  ▶️ {t.imposter__cta}
                </Link>
                <span aria-hidden style={{ alignSelf: 'center', fontSize: 12, opacity: 0.85 }}>
                  {t.imposter__players_range}
                </span>
              </div>
            </div>
          </article>

          {/* Wortduell Game Karte */}
          <article
            style={{
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(56,189,248,.35)',
              borderRadius: 14,
              padding: 16,
              display: 'grid',
              alignContent: 'space-between',
              gap: 12,
              background: 'transparent',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)'
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: [
                  'linear-gradient(180deg, rgba(5,12,20,.55), rgba(5,12,20,.65))',
                  'url(/wortduell.png)'
                ].join(','),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'saturate(1.1) brightness(0.92)',
                transform: 'scale(1.02)'
              }}
            />
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(600px 280px at 90% -10%, rgba(56,189,248,.22), transparent), radial-gradient(500px 240px at -10% 10%, rgba(59,130,246,.18), transparent)'
              }}
            />

            <div style={{ position: 'relative' }}>
              <header>
                <div style={{ fontSize: 28, lineHeight: 1 }}>🎯 {t.wortduell__title}</div>
                <p style={{ marginTop: 6, opacity: 0.9, fontSize: 14 }}>
                  {t.wortduell__desc}
                </p>
              </header>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Link
                  href="/wortduell"
                  className="btn btn-accent"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'linear-gradient(90deg, #22d3ee, #3b82f6)',
                    color: '#0b1020',
                    boxShadow: '0 6px 20px rgba(59,130,246,.35)'
                  }}
                >
                  ▶️ {t.wortduell__cta}
                </Link>
                <span
                  aria-hidden
                  style={{ alignSelf: 'center', fontSize: 12, opacity: 0.85 }}
                >
                  {t.wortduell__players_range}
                </span>
              </div>
            </div>
          </article>

          {/* Hindernisgame (Solo · endlos) */}
          <article
            style={{
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(74,222,128,.35)',
              borderRadius: 14,
              padding: 16,
              display: 'grid',
              alignContent: 'space-between',
              gap: 12,
              background: 'transparent',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)'
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(600px 280px at -10% -10%, rgba(74,222,128,.22), transparent), radial-gradient(500px 240px at 110% 10%, rgba(34,197,94,.18), transparent)'
              }}
            />
            <div style={{ position: 'relative' }}>
              <header>
                <div style={{ fontSize: 28, lineHeight: 1 }}>🏃 Hindernisgame</div>
                <p style={{ marginTop: 6, opacity: 0.9, fontSize: 14 }}>
                  Endloser Singleplayer-Runner mit prozeduralen Hindernissen.
                </p>
              </header>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Link
                  href="/single/hindernisgame"
                  className="btn btn-accent"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'linear-gradient(90deg, #34d399, #22c55e)',
                    color: '#0b1020',
                    boxShadow: '0 6px 20px rgba(34,197,94,.35)'
                  }}
                >
                  ▶️ Jetzt spielen
                </Link>
                <span aria-hidden style={{ alignSelf: 'center', fontSize: 12, opacity: 0.85 }}>
                  1 Spieler · endlos
                </span>
              </div>
            </div>
          </article>

          {/* SkyFlap (Solo · endlos) */}
          <article
            style={{
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(250,204,21,.45)',
              borderRadius: 14,
              padding: 16,
              display: 'grid',
              alignContent: 'space-between',
              gap: 12,
              background: 'transparent',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)'
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(600px 280px at 110% -10%, rgba(250,204,21,.22), transparent), radial-gradient(500px 240px at -10% 10%, rgba(253,224,71,.18), transparent)'
              }}
            />
            <div style={{ position: 'relative' }}>
              <header>
                <div style={{ fontSize: 28, lineHeight: 1 }}>🐦 SkyFlap</div>
                <p style={{ marginTop: 6, opacity: 0.9, fontSize: 14 }}>
                  Flap-Arcade: tippen/Space zum Fliegen – Pipes endlos, Schwierigkeit steigt.
                </p>
              </header>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Link
                  href="/single/skyflap"
                  className="btn btn-accent"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'linear-gradient(90deg, #fde047, #f59e0b)',
                    color: '#0b1020',
                    boxShadow: '0 6px 20px rgba(245,158,11,.35)'
                  }}
                >
                  ▶️ Jetzt spielen
                </Link>
                <span aria-hidden style={{ alignSelf: 'center', fontSize: 12, opacity: 0.85 }}>
                  1 Spieler · endlos
                </span>
              </div>
            </div>
          </article>

          {/* Platzhalter */}
          <article
            style={{
              border: '1px dashed rgba(99,102,241,.45)',
              borderRadius: 14,
              padding: 16,
              display: 'grid',
              gap: 12,
              alignContent: 'space-between',
              background: 'linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02))',
              opacity: 0.9
            }}
          >
            <header>
              <div style={{ fontSize: 22 }}>🔜 {t.soon__title}</div>
              <p style={{ marginTop: 6, fontSize: 14 }}>
                {t.soon__desc}
              </p>
            </header>
            <button
              disabled
              className="btn"
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                opacity: 0.75,
                cursor: 'not-allowed',
                background: 'linear-gradient(90deg, rgba(99,102,241,.25), rgba(236,72,153,.25))',
                color: '#fff'
              }}
            >
              {t.soon__btn}
            </button>
          </article>
        </div>

        {/* Footer Hinweis */}
        <div
          style={{
            marginTop: 18,
            fontSize: 12,
            opacity: 0.75,
            textAlign: 'center'
          }}
        >
          {t.home__tip}
        </div>
      </div>
    </main>
  )
}
