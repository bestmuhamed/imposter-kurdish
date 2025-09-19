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
        background:
          'radial-gradient(1200px 600px at 20% -10%, rgba(255,255,255,.08), transparent), radial-gradient(1000px 500px at 120% 10%, rgba(255,255,255,.05), transparent)'
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
          background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))',
          backdropFilter: 'blur(6px)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, letterSpacing: 1.4, opacity: 0.75 }}>{t.home__badge}</div>
          <h1 style={{ fontSize: 34, margin: '8px 0 6px' }}>{t.home__title}</h1>
          <p style={{ opacity: 0.8, fontSize: 16 }}>
            {t.home__lead_prefix} <em>Imposter</em>.
          </p>
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
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 14,
              padding: 16,
              display: 'grid',
              alignContent: 'space-between',
              gap: 12,
              background: 'linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.08))'
            }}
          >
            <header>
              <div style={{ fontSize: 28, lineHeight: 1 }}>🕵️‍♀️ Imposter</div>
              <p style={{ marginTop: 6, opacity: 0.8, fontSize: 14 }}>
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
                  gap: 8
                }}
              >
                ▶️ {t.imposter__cta}
              </Link>
              <span
                aria-hidden
                style={{
                  alignSelf: 'center',
                  fontSize: 12,
                  opacity: 0.7
                }}
              >
                {t.imposter__players_range}
              </span>
            </div>
          </article>

          {/* Wortduell Game Karte */}
          <article
            style={{
              border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 14,
              padding: 16,
              display: 'grid',
              alignContent: 'space-between',
              gap: 12,
              background: 'linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,.08))'
            }}
          >
            <header>
              <div style={{ fontSize: 28, lineHeight: 1 }}>🎯 Wortduell</div>
              <p style={{ marginTop: 6, opacity: 0.8, fontSize: 14 }}>
                Zwei Spieler, zwei Geheimwörter – durch clevere Fragen musst du erraten,
                was dein Gegenüber gezogen hat.
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
                  gap: 8
                }}
              >
                ▶️ Spiel starten
              </Link>
              <span
                aria-hidden
                style={{
                  alignSelf: 'center',
                  fontSize: 12,
                  opacity: 0.7
                }}
              >
                2 Spieler
              </span>
            </div>
          </article>

          {/* Platzhalter für weitere Mini-Games */}
          <article
            style={{
              border: '1px dashed rgba(255,255,255,.18)',
              borderRadius: 14,
              padding: 16,
              display: 'grid',
              gap: 12,
              alignContent: 'space-between',
              opacity: 0.6
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
                opacity: 0.6,
                cursor: 'not-allowed'
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
            opacity: 0.7,
            textAlign: 'center'
          }}
        >
          {t.home__tip}
        </div>
      </div>
    </main>
  )
}
