'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getDict, LANG_OPTIONS } from '@/lib/i18n'

type Player = { id: number; name: string }
type WordPayload = { id: string; word_en: string; term: string; imageUrl?: string | null }


const CATEGORIES = [
  { slug: '', label: 'any' }, { slug: 'food', label: 'Food' }, { slug: 'places', label: 'Places' },
  { slug: 'objects', label: 'Objects' }, { slug: 'animals', label: 'Animals' }, { slug: 'body', label: 'Body' },
  { slug: 'colors', label: 'Colors' }, { slug: 'professions', label: 'Professions' }, { slug: 'time', label: 'Time' }
]

// ---- Unsplash Helper ----
async function getUnsplash(query: string) {
  console.log('[Unsplash] Suche nach:', query)
  try {
    const r = await fetch('/api/unsplash?q=' + encodeURIComponent(query), { cache: 'no-store' })
    if (!r.ok) {
      console.error('[Unsplash] Fehlerstatus', r.status)
      return undefined
    }
    const { photos } = await r.json()
    console.log('[Unsplash] Ergebnis:', photos)
    return photos?.[0]
  } catch (e) {
    console.error('[Unsplash] Exception:', e)
    return undefined
  }
}

export default function Page() {
  const [lang, setLang] = useState<'en' | 'de' | 'krd'>('krd')
  const t = getDict(lang)
  const [count, setCount] = useState(5)
  const [players, setPlayers] = useState<Player[]>(
    Array.from({ length: 5 }, (_, i) => ({ id: i, name: '' }))
  )
  const [category, setCategory] = useState('')
  const [word, setWord] = useState<WordPayload | null>(null)
  const [imposterId, setImposterId] = useState<number | null>(null)
  const [started, setStarted] = useState(false)
  const [revealFor, setRevealFor] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [imageCredit, setImageCredit] = useState<{author?:string; author_link?:string; source_link?:string} | null>(null)

  // Swipe state
  const [overlayY, setOverlayY] = useState(0)
  const [opened, setOpened] = useState(false)
  const startY = useRef<number | null>(null)
  const MAX = 260, THRESH = 200

  useEffect(() => {
    setPlayers(p => Array.from({ length: count }, (_, i) => p[i] ?? { id: i, name: '' }))
  }, [count])

  const allNamesFilled = useMemo(
    () => players.slice(0, count).every(p => p.name.trim().length > 0), [players, count]
  )

  async function fetchWord(params: { lang: string; category?: string }) {
    const q = new URLSearchParams({ lang: params.lang })
    if (params.category) q.set('category', params.category)
    console.log('[WordAPI] Abrufen mit Params:', q.toString())
    const res = await fetch('/api/word?' + q.toString(), { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) {
      console.error('[WordAPI] Fehler:', data)
      throw new Error(data?.error || 'fetch error')
    }
    console.log('[WordAPI] Ergebnis:', data)
    return { id: data.id, word_en: data.word_en, term: data.term, imageUrl: data.imageUrl } as WordPayload
  }

  async function startGame() {
    if (!allNamesFilled) {
      console.warn('[Game] Nicht alle Namen ausgefüllt')
      return
    }
    try {
      setIsLoading(true)
      console.log('[Game] Starte Spiel…')
      const w = await fetchWord({ lang, category: category || undefined })
      console.log('[Game] Kein Bild in DB, hole von Unsplash')
      const u = await getUnsplash(w.word_en)
      if (u?.url) {
        w.imageUrl = u.url
        setImageCredit({ author: u.author, author_link: u.author_link, source_link: u.source_link })
        console.log('[Game] Unsplash Bild gesetzt:', u.url)
      } else {
        setImageCredit(null)
        console.warn('[Game] Kein Unsplash Bild gefunden')
      }
      setWord(w)
      setImposterId(Math.floor(Math.random() * count))
      setStarted(true)
      setRevealFor(0)
      resetOverlay()
    } finally { setIsLoading(false) }
  }

  function nextReveal() {
    if (revealFor == null) return
    const n = revealFor + 1
    if (n < count) { setRevealFor(n); resetOverlay() } else { setRevealFor(null) }
  }
  function resetGame() { 
    console.log('[Game] Reset')
    setStarted(false); setRevealFor(null); setImposterId(null); setWord(null); resetOverlay(); setImageCredit(null) 
  }
  function newRound() { 
    console.log('[Game] Neue Runde')
    setStarted(false); setRevealFor(null); setImposterId(null); setWord(null); resetOverlay(); setImageCredit(null); startGame() 
  }

  function resetOverlay() { setOverlayY(0); setOpened(false); startY.current = null }

  // pointer handlers
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); startY.current = e.clientY }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startY.current == null) return
    const dy = startY.current - e.clientY
    setOverlayY(Math.max(0, Math.min(dy, MAX)))
  }
  const onUp = async () => {
    const openedNow = overlayY >= THRESH
    setOpened(openedNow)
    console.log('[Swipe] Released. openedNow=', openedNow, 'overlayY=', overlayY)
    if (!openedNow) setOverlayY(0)
    startY.current = null

    if (openedNow && word && !word.imageUrl) {
      console.log('[Swipe] Wort geöffnet, aber kein Bild. Hole Unsplash nach.')
      const u = await getUnsplash(word.term)
      if (u?.url) {
        setWord(prev => prev ? { ...prev, imageUrl: u.url } : prev)
        setImageCredit({ author: u.author, author_link: u.author_link, source_link: u.source_link })
        console.log('[Swipe] Unsplash Bild nachgeladen:', u.url)
      } else {
        console.warn('[Swipe] Auch nachträglich kein Unsplash Bild gefunden')
      }
    }
  }

  return (
    <main>
      {/* Setup */}
      {!started && (
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
          <div className="card">
            <div className="row">
              <div style={{ flex: 1, minWidth: 220 }}>
                <label>{t.language}</label>
                <select value={lang} onChange={e => setLang(e.target.value as any)}>
                  {LANG_OPTIONS.map(o => <option key={o.code} value={o.code}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ width: 160 }}>
                <label>{t.players}</label>
                <input type="number" min={3} max={12} value={count}
                  onChange={e => setCount(Math.max(3, Math.min(12, Number(e.target.value))))} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label>{t.category}</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {[{ slug: '', label: t.any }, ...CATEGORIES.filter(c => c.slug)].map(c =>
                    <option key={c.slug || 'any'} value={c.slug}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {players.slice(0, count).map((p, i) => (
                <div key={p.id}>
                  <label>{t.playerName.replace('{{i}}', String(i + 1))}</label>
                  <input value={p.name}
                    onChange={e => setPlayers(arr => arr.map(x => x.id === p.id ? { ...x, name: e.target.value } : x))}
                    placeholder={t.playerName.replace('{{i}}', String(i + 1))} />
                </div>
              ))}
            </div>
          </div>

          <div className="row">
            <button className="btn btn-accent" onClick={startGame} disabled={!allNamesFilled || isLoading}>
              {isLoading ? '…' : `▶️ ${t.start}`}
            </button>
          </div>
        </div>
      )}

      {/* Reveal */}
      {started && revealFor !== null && (
        <>
          <div className="reveal-card">
            {/* Avatar-Layer */}
            <div className={`reveal-layer ${opened ? 'hidden' : ''}`} aria-hidden={opened}>
              <img className="reveal-img" src="/avatar.png" alt="avatar" />
            </div>

            {/* Wortbild-Layer */}
            <div className={`reveal-layer ${opened ? '' : 'hidden'}`} aria-hidden={!opened}>
              {
              revealFor == imposterId ? (<img className="reveal-img" src="/avatar.png" alt="avatar" />)  :
              word?.imageUrl ? (
                <img className="reveal-img" src={word.imageUrl} alt={word.term} />
              ) : (
                <div className="reveal-img" style={{
                  background: 'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)'
                }} />
              )
              }
            </div>

            {/* Swipe-Overlay */}
            <div
              className="reveal-overlay"
              style={{ transform: `translateY(-${opened ? 100 : Math.min(100, (overlayY / 260) * 100)}%)` }}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            >
              <p className="hint">{t.swipeHint}</p>
              <div className="arrow" />
              <div className="cta">{t.revealCard}</div>

              <div className={`reveal-name ${opened ? 'hidden' : ''}`}>
                {players[revealFor].name || '—'}
              </div>
            </div>
          </div>

          {/* Panel */}
          <div className="word-panel" aria-live="polite">
            {!opened ? (
              <div className="sub">{t.revealCard}</div>
            ) : revealFor === imposterId ? (
              <>
                <div className="check">?</div>
                <div className="word" style={{ marginTop: 8 }}>{t.youAreImposter}</div>
                {imageCredit?.author && (
                  <div className="sub" style={{ opacity:.7, fontSize:12, marginTop:8 }}>
                    Photo: <a href={imageCredit.author_link} target="_blank" rel="noreferrer">{imageCredit.author}</a> (Unsplash)
                  </div>
                )}
                <div className="panel-actions">
                  <button className="btn btn-accent" onClick={nextReveal}>{t.next} ▶️</button>
                </div>
              </>
            ) : (
              <>
                <div className="check">✓</div>
                <div className="word">{word?.term}</div>
                {imageCredit?.author && (
                  <div className="sub" style={{ opacity:.7, fontSize:12, marginTop:8 }}>
                    Photo: <a href={imageCredit.author_link} target="_blank" rel="noreferrer">{imageCredit.author}</a> (Unsplash)
                  </div>
                )}
                <div className="panel-actions">
                  <button className="btn btn-accent" onClick={nextReveal}>{t.next} ▶️</button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Nach Reveal aller Spieler */}
      {started && revealFor === null && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="h1">🔔 {t.allSet}</div>
          <div className="sub">{t.discuss}</div>
          <div className="row">
            <button className="btn" onClick={resetGame}>↩️ {t.reset}</button>
            <button className="btn btn-accent" onClick={newRound}>🪄 {t.newWord}</button>
          </div>
        </div>
      )}
    </main>
  )
}
