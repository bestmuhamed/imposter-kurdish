'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '../_components/LanguageProvider'
import { getDict, LANG_OPTIONS } from '@/lib/i18n'

type Player = { id: number; name: string }
type WordPayload = { id: string; word_en: string; term: string; imageUrl?: string | null }

const CATEGORIES = [
    { slug: '', label: 'any' }, { slug: 'food', label: 'Food' }, { slug: 'places', label: 'Places' },
    { slug: 'objects', label: 'Objects' }, { slug: 'animals', label: 'Animals' }, { slug: 'body', label: 'Body' },
    { slug: 'colors', label: 'Colors' }, { slug: 'professions', label: 'Professions' }, { slug: 'time', label: 'Time' }
]

// ---- Unsplash Helper (nur wenn DB-Bild fehlt) ----
async function getUnsplash(query: string) {
    try {
        const r = await fetch('/api/unsplash?q=' + encodeURIComponent(query), { cache: 'no-store' })
        if (!r.ok) return undefined
        const { photos } = await r.json()
        return photos?.[0]
    } catch { return undefined }
}

// ---- API Wort holen ----
async function fetchWord(params: { lang: string; category?: string }) {
    const q = new URLSearchParams({ lang: params.lang })
    if (params.category) q.set('category', params.category)
    const res = await fetch('/api/word?' + q.toString(), { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'fetch error')
    return { id: data.id, word_en: data.word_en, term: data.term, imageUrl: data.imageUrl } as WordPayload
}

export default function Page() {
    const { lang } = useLanguage()
    const t = getDict(lang)

    // Spieler (2 fix)
    const [players, setPlayers] = useState<Player[]>([
        { id: 0, name: '' },
        { id: 1, name: '' }
    ])
    const allNamesFilled = useMemo(() => players.every(p => p.name.trim().length > 0), [players])

    // Einstellungen
    const [category, setCategory] = useState('')

    // Worte:
    // wordForA = Zielwort, das A erraten muss (kennt B)
    // wordForB = Zielwort, das B erraten muss (kennt A)
    const [wordForA, setWordForA] = useState<WordPayload | null>(null)
    const [wordForB, setWordForB] = useState<WordPayload | null>(null)

    // Credits separat (pro Bild)
    const [creditA, setCreditA] = useState<{ author?: string; author_link?: string; source_link?: string } | null>(null)
    const [creditB, setCreditB] = useState<{ author?: string; author_link?: string; source_link?: string } | null>(null)

    // Flow
    const [started, setStarted] = useState(false)
    const [revealFor, setRevealFor] = useState<0 | 1 | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Swipe state (wie beim Imposter-Spiel)
    const [overlayY, setOverlayY] = useState(0)
    const [opened, setOpened] = useState(false)
    const startY = useRef<number | null>(null)
    const MAX = 260, THRESH = 200

    function resetOverlay() { setOverlayY(0); setOpened(false); startY.current = null }

    // Pointer
    const onDown = (e: React.PointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); startY.current = e.clientY }
    const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (startY.current == null) return
        const dy = startY.current - e.clientY
        setOverlayY(Math.max(0, Math.min(dy, MAX)))
    }
    const onUp = async () => {
        const openedNow = overlayY >= THRESH
        setOpened(openedNow)
        if (!openedNow) setOverlayY(0)
        startY.current = null

        // wie beim Imposter: wenn geöffnet & (noch) kein Bild -> Unsplash-Fallback laden
        if (openedNow) {
            const isA = revealFor === 0
            const cur = isA ? wordForB : wordForA
            if (cur && !cur.imageUrl) {
                const u = await getUnsplash(cur.term || cur.word_en)
                if (u?.url) {
                    if (isA) {
                        setWordForB(prev => (prev ? { ...prev, imageUrl: u.url } : prev))
                        setCreditB({ author: u.author, author_link: u.author_link, source_link: u.source_link })
                    } else {
                        setWordForA(prev => (prev ? { ...prev, imageUrl: u.url } : prev))
                        setCreditA({ author: u.author, author_link: u.author_link, source_link: u.source_link })
                    }
                } else {
                    // kein Bild gefunden -> Credit zurücksetzen
                    isA ? setCreditB(null) : setCreditA(null)
                }
            }
        }
    }


    async function ensureImage(w: WordPayload, setCredit: (c: any) => void) {
        //if (w.imageUrl) return w
        const u = await getUnsplash(w.word_en) // nur fallback, englischer Begriff
        if (u?.url) {
            setCredit({ author: u.author, author_link: u.author_link, source_link: u.source_link })
            return { ...w, imageUrl: u.url }
        } else {
            setCredit(null)
            return w
        }
    }

    async function startGame() {
        if (!allNamesFilled) return
        try {
            setIsLoading(true)
            // hole 2 Wörter (Kategorie optional identisch). Vermeide Doppelung.
            let wA = await fetchWord({ lang, category: category || undefined })
            let wB = await fetchWord({ lang, category: category || undefined })
            if (wB.id === wA.id) {
                // minimaler Versuch, ein anderes zu holen
                wB = await fetchWord({ lang, category: category || undefined })
            }

            // Fallback-Bilder nur wenn DB-Bild fehlt
            const wAimg = await ensureImage(wA, setCreditA)
            const wBimg = await ensureImage(wB, setCreditB)

            setWordForA(wAimg)
            setWordForB(wBimg)
            setStarted(true)
            setRevealFor(0) // zuerst Spieler A sieht das Wort von B
            resetOverlay()
        } finally {
            setIsLoading(false)
        }
    }

    function nextReveal() {
        if (revealFor === 0) { setRevealFor(1); resetOverlay() }
        else if (revealFor === 1) { setRevealFor(null) } // beide gesehen
    }

    function resetGame() {
        setStarted(false)
        setRevealFor(null)
        setWordForA(null); setWordForB(null)
        setCreditA(null); setCreditB(null)
        resetOverlay()
    }

    async function newRound() {
        setStarted(false)
        setRevealFor(null)
        setWordForA(null); setWordForB(null)
        setCreditA(null); setCreditB(null)
        resetOverlay()
        await startGame()
    }

    return (
        <main style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
            {/* Header-Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <h1 style={{ margin: 0, fontSize: 22 }}>🎯 Wortduell</h1>
            </div>

            {/* Setup */}
            {!started && (
                <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
                    <div className="card">
                        <div className="row" style={{ gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 220 }}>
                                <label>{t.playerName.replace('{{i}}', '1')}</label>
                                <input
                                    value={players[0].name}
                                    onChange={e => setPlayers(p => p.map(x => x.id === 0 ? { ...x, name: e.target.value } : x))}
                                    placeholder={t.playerName.replace('{{i}}', '1')}
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 220 }}>
                                <label>{t.playerName.replace('{{i}}', '2')}</label>
                                <input
                                    value={players[1].name}
                                    onChange={e => setPlayers(p => p.map(x => x.id === 1 ? { ...x, name: e.target.value } : x))}
                                    placeholder={t.playerName.replace('{{i}}', '2')}
                                />
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

                    <div className="row">
                        <button className="btn btn-accent" onClick={startGame} disabled={!allNamesFilled || isLoading}>
                            {isLoading ? '…' : `▶️ ${t.start}`}
                        </button>
                    </div>
                </div>
            )}

            {/* Reveal: Player A sieht Wort für B, dann Player B sieht Wort für A */}
            {started && revealFor !== null && (
                <>
                    <div className="reveal-card">
                        {/* Avatar-Layer (wie beim Imposter) */}
                        <div className={`reveal-layer ${opened ? 'hidden' : ''}`} aria-hidden={opened}>
                            <img className="reveal-img" src="/avatar.png" alt="avatar" />
                        </div>

                        {/* Wortbild-Layer */}
                        <div className={`reveal-layer ${opened ? '' : 'hidden'}`} aria-hidden={!opened}>
                            {(() => {
                                const w = revealFor === 0 ? wordForB : wordForA
                                return w?.imageUrl ? (
                                    <img
                                        className="reveal-img"
                                        src={w.imageUrl}
                                        alt={w.term}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',          // gesamtes Bild zeigen
                                            objectPosition: 'center',
                                            backgroundColor: '#0b0b0b'     // letterbox
                                        }}
                                        loading="eager"
                                        decoding="async"
                                    />
                                ) : (
                                    <div
                                        className="reveal-img"
                                        style={{ background: 'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)' }}
                                    />
                                )
                            })()}
                        </div>

                        {/* Swipe-Overlay (inkl. Name wie beim Imposter) */}
                        <div
                            className="reveal-overlay"
                            style={{ transform: `translateY(-${opened ? 100 : Math.min(100, (overlayY / 260) * 100)}%)` }}
                            onPointerDown={onDown}
                            onPointerMove={onMove}
                            onPointerUp={onUp}
                            onPointerCancel={onUp}
                        >
                            <p className="hint">{t.swipeHint}</p>
                            <div className="arrow" />
                            <div className="cta">{t.revealCard}</div>

                            <div className={`reveal-name ${opened ? 'hidden' : ''}`}>
                                {(revealFor === 0 ? players[0].name : players[1].name) || '—'}
                            </div>
                        </div>
                    </div>

                    {/* Panel unter der Karte – identischer Aufbau */}
                    <div className="word-panel" aria-live="polite">
                        {!opened ? (
                            <div className="sub">{t.revealCard}</div>
                        ) : (
                            <>
                                <div className="check">✓</div>
                                <div className="word">
                                    {(revealFor === 0 ? wordForB?.term : wordForA?.term) || '—'}
                                </div>

                                {(() => {
                                    const credit = revealFor === 0 ? creditB : creditA
                                    return credit?.author ? (
                                        <div className="sub" style={{ opacity: 0.7, fontSize: 12, marginTop: 8 }}>
                                            Photo: <a href={credit.author_link} target="_blank" rel="noreferrer">{credit.author}</a> (Unsplash)
                                        </div>
                                    ) : null
                                })()}

                                <div className="panel-actions">
                                    <button className="btn btn-accent" onClick={nextReveal}>{t.next} ▶️</button>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}


            {/* Nach beiden Reveals: Übersicht & Spielhinweis */}
            {started && revealFor === null && (
                <div className="card" style={{ marginTop: 16 }}>
                    <div className="h1">🧠 {players[0].name || 'A'} vs. {players[1].name || 'B'}</div>
                    <div className="sub" style={{ marginTop: 10 }}>
                        {t.duelHint}
                    </div>

                    <div className="row" style={{ marginTop: 10 }}>
                        <button className="btn" onClick={resetGame}>↩️ {t.reset}</button>
                        <button className="btn btn-accent" onClick={newRound}>🪄 {t.newWord}</button>
                    </div>
                </div>
            )}
        </main>
    )
}
