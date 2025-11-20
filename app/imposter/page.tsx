'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getDict, LANG_OPTIONS } from '@/lib/i18n'
import { useLanguage } from '../_components/LanguageProvider'

type Player = { id: number; name: string }
type WordPayload = {
    id: string;
    word_en: string;
    term: string;
    terms?: Record<string, string>; // optional dictionary of translations
    imageUrl?: string | null;
};

type UnsplashPick = {
    url?: string
    author?: string
    author_link?: string
    photo_link?: string
    download_location?: string
}

const CATEGORIES = [
    { slug: '', label: 'any' },
    { slug: 'food', label: 'Food' },
    { slug: 'places', label: 'Places' },
    { slug: 'objects', label: 'Objects' },
    { slug: 'animals', label: 'Animals' },
    { slug: 'body', label: 'Body' },
    { slug: 'colors', label: 'Colors' },
    { slug: 'professions', label: 'Professions' },
    { slug: 'time', label: 'Time' }
]

// ---- Unsplash Helper ----
async function getUnsplash(query: string): Promise<UnsplashPick | undefined> {
    try {
        const r = await fetch('/api/unsplash?q=' + encodeURIComponent(query), { cache: 'no-store' })
        if (!r.ok) return undefined
        const { photos } = await r.json()
        return photos?.[0]
    } catch { return undefined }
}


export default function Page() {
    const { lang } = useLanguage()
    const t = getDict(lang)
    const [count, setCount] = useState(5)
    const [players, setPlayers] = useState<Player[]>(Array.from({ length: 5 }, (_, i) => ({ id: i, name: '' })))
    const [category, setCategory] = useState('')
    const [word, setWord] = useState<WordPayload | null>(null)
    const [imposterId, setImposterId] = useState<number | null>(null)
    const [started, setStarted] = useState(false)
    const [revealFor, setRevealFor] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [imageCredit, setImageCredit] = useState<{ author?: string; author_link?: string; source_link?: string } | null>(null)

    // Swipe state
    const [overlayY, setOverlayY] = useState(0)
    const [opened, setOpened] = useState(false)
    const startY = useRef<number | null>(null)
    const MAX = 260, THRESH = 200

    useEffect(() => {
        setPlayers(p => Array.from({ length: count }, (_, i) => p[i] ?? { id: i, name: '' }))
    }, [count])

    const allNamesFilled = useMemo(() => players.slice(0, count).every(p => p.name.trim().length > 0), [players, count])

    async function fetchWord(params: { lang: string; category?: string }) {
        const q = new URLSearchParams();
        q.set('lang', params.lang);
        if (params.category) q.set('category', params.category);

        const res = await fetch('/api/word?' + q.toString(), { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'fetch error');

        return {
            id: data.id,
            word_en: data.word_en,
            term: data.term,
            terms: data.terms,
            imageUrl: data.imageUrl,
        } as WordPayload;
    }
    function getTermForLanguage(word: WordPayload | null, lang: string): string {
        if (!word) return '';
        // Prefer the multi-lang dictionary if available
        if (word.terms && word.terms[lang]) return word.terms[lang];
        // Fall back to the API-provided term
        return word.term ?? word.word_en;
    }


    const downloadRef = useRef<string | null>(null) // oben definieren

    async function startGame() {
        if (!allNamesFilled) return
        try {
            setIsLoading(true)
            const w = await fetchWord({ lang, category: category || undefined })
            const u = await getUnsplash(w.word_en)
            if (u?.url) {
                w.imageUrl = u.url
                setImageCredit({
                    author: u.author,
                    author_link: u.author_link,
                    source_link: u.photo_link,
                })
                // Speichere download_location für später
                downloadRef.current = u.download_location ?? null
            } else {
                setImageCredit(null)
                downloadRef.current = null
            }

            setWord(w)
            setImposterId(Math.floor(Math.random() * count))
            setStarted(true)
            setRevealFor(0)
            resetOverlay()
        } finally {
            setIsLoading(false)
        }
    }


    function nextReveal() {
        if (revealFor == null) return
        const n = revealFor + 1
        if (n < count) {
            setRevealFor(n)
            resetOverlay()
        } else {
            setRevealFor(null)
        }
    }
    function resetGame() {
        setStarted(false); setRevealFor(null); setImposterId(null); setWord(null); resetOverlay(); setImageCredit(null)
    }
    function newRound() {
        setStarted(false); setRevealFor(null); setImposterId(null); setWord(null); resetOverlay(); setImageCredit(null); startGame()
    }
    function resetOverlay() { setOverlayY(0); setOpened(false); startY.current = null }

    // pointer handlers
    const onDown = (e: React.PointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); startY.current = e.clientY }
    const onMove = (e: React.PointerEvent<HTMLDivElement>) => { if (startY.current == null) return; const dy = startY.current - e.clientY; setOverlayY(Math.max(0, Math.min(dy, MAX))) }
    const onUp = async () => {
        const openedNow = overlayY >= THRESH
        setOpened(openedNow)
        if (!openedNow) setOverlayY(0)
        startY.current = null

        // Nur beim Aufdecken der echten Karte (nicht beim Imposter)
        if (openedNow && revealFor !== imposterId && downloadRef.current) {
            try {
                const r = await fetch(
                    '/api/unsplash/download?url=' + encodeURIComponent(downloadRef.current),
                    { cache: 'no-store' }
                )
                const json = await r.json()
                if (json?.ok && json?.fileUrl) {
                    // 👉 hier wird jetzt das „offizielle“ Download-Bild geladen
                    setWord(prev => (prev ? { ...prev, imageUrl: json.fileUrl } : prev))
                    console.log('Unsplash official download URL:', json.fileUrl)
                }
                console.log('Unsplash download trigger result:', json)
            } catch { }
            downloadRef.current = null // nur 1x
        }
    }


    return (
        <main
            style={{
                minHeight: '100dvh',
                width: '100%',
                padding: 24,
                background: [
                    'radial-gradient(1200px 600px at 20% -10%, rgba(255,255,255,.08), transparent)',
                    'radial-gradient(1000px 500px at 120% 10%, rgba(255,255,255,.05), transparent)',
                    'radial-gradient(800px 400px at -10% 30%, rgba(99,102,241,.10), transparent)', // indigo
                    'radial-gradient(900px 450px at 110% 70%, rgba(236,72,153,.08), transparent)' // pink
                ].join(',')
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <h1
                    style={{
                        margin: 0,
                        fontSize: 28,
                        background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent'
                    }}
                >
                    Imposter
                </h1>
            </div>

            {/* Setup */}
            {!started && (
                <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
                    <div
                        className="card"
                        style={{
                            border: '1px solid rgba(255,255,255,.12)',
                            borderRadius: 16,
                            background: 'linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05))',
                            boxShadow: '0 10px 30px rgba(0,0,0,.15)',
                            backdropFilter: 'blur(6px)',
                            padding: 16
                        }}
                    >
                        <div className="row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 220 }}>
                                <label htmlFor="playerCount">{t.players}</label>
                                <div
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        border: '1px solid rgba(255,255,255,.18)', borderRadius: 12, padding: 6,
                                        background: 'linear-gradient(180deg, rgba(99,102,241,.12), rgba(99,102,241,.04))'
                                    }}
                                >
                                    <button type="button" aria-label="decrease players" onClick={() => setCount(c => Math.max(3, c - 1))}
                                        style={{ minWidth: 44, minHeight: 44, borderRadius: 10, background: 'rgba(255,255,255,.08)', color: '#fff' }}>−</button>

                                    <input
                                        id="playerCount"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={2}
                                        value={String(count)}
                                        onChange={e => {
                                            const raw = e.target.value.replace(/\D/g, '')
                                            const num = raw === '' ? 0 : Number(raw)
                                            const clamped = Math.max(3, Math.min(12, num))
                                            if (raw === '') e.target.value = ''
                                            setCount(clamped)
                                        }}
                                        onWheel={e => (e.currentTarget as HTMLInputElement).blur()}
                                        style={{ textAlign: 'center', flex: 1, minWidth: 64, fontSize: 18, padding: '10px 8px', border: 'none', outline: 'none', background: 'transparent', color: '#fff' }}
                                    />

                                    <button type="button" aria-label="increase players" onClick={() => setCount(c => Math.min(12, c + 1))}
                                        style={{ minWidth: 44, minHeight: 44, borderRadius: 10, background: 'rgba(255,255,255,.08)', color: '#fff' }}>+</button>
                                </div>
                            </div>

                            <div style={{ flex: 1, minWidth: 220 }}>
                                <label>{t.category}</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 12px', borderRadius: 12,
                                        border: '1px solid rgba(255,255,255,.18)', color: '#fff', background: 'linear-gradient(180deg, rgba(14,165,233,.14), rgba(14,165,233,.05))'
                                    }}
                                >
                                    {[{ slug: '', label: t.any }, ...CATEGORIES.filter(c => c.slug)].map(c => (
                                        <option key={c.slug || 'any'} value={c.slug} style={{ color: '#0b1020' }}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div
                        className="card"
                        style={{
                            border: '1px solid rgba(255,255,255,.12)',
                            borderRadius: 16,
                            background: 'linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05))',
                            boxShadow: '0 10px 30px rgba(0,0,0,.15)',
                            backdropFilter: 'blur(6px)',
                            padding: 16
                        }}
                    >
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {players.slice(0, count).map((p, i) => (
                                <div key={p.id}>
                                    <label>{t.playerName.replace('{{i}}', String(i + 1))}</label>
                                    <input
                                        value={p.name}
                                        onChange={e => setPlayers(arr => arr.map(x => x.id === p.id ? { ...x, name: e.target.value } : x))}
                                        placeholder={t.playerName.replace('{{i}}', String(i + 1))}
                                        style={{
                                            width: '100%', padding: '10px 12px', borderRadius: 12,
                                            border: '1px solid rgba(255,255,255,.18)', color: '#fff', background: 'rgba(255,255,255,.06)'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="row">
                        <button
                            className="btn btn-accent"
                            onClick={startGame}
                            disabled={!allNamesFilled || isLoading}
                            style={{
                                padding: '12px 16px',
                                borderRadius: 12,
                                fontWeight: 700,
                                background: 'linear-gradient(90deg, #818cf8, #f472b6)',
                                color: '#fff',
                                boxShadow: '0 10px 25px rgba(129,140,248,.35)'
                            }}
                        >
                            {isLoading ? '…' : `▶️ ${t.start}`}
                        </button>
                    </div>
                </div>
            )}

            {/* Reveal */}
            {started && revealFor !== null && (
                <>

                    <div
                        className="reveal-card"
                        style={{
                            borderRadius: 16,
                            overflow: 'hidden',
                            height: 320,
                            border: '1px solid rgba(255,255,255,.12)',
                            background: 'linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))',
                            padding: 16,
                        }}
                    >
                        {/* Avatar-Layer */}
                        <div className={`reveal-layer ${opened ? 'hidden' : ''}`} aria-hidden={opened}>
                            <img className="reveal-img" src="/avatar.png" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        {/* Wortbild-Layer */}
                        <div className={`reveal-layer ${opened ? '' : 'hidden'}`} aria-hidden={!opened}>
                            {revealFor == imposterId ? (
                                <img className="reveal-img" src="/avatar.png" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : word?.imageUrl ? (
                                <img
                                    className="reveal-img"
                                    src={word.imageUrl}
                                    alt={word.term}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', backgroundColor: '#0b0b0b' }}
                                    loading="eager"
                                    decoding="async"
                                />
                            ) : (
                                <div className="reveal-img" style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)' }} />
                            )}
                        </div>

                        {/* Swipe-Overlay */}
                        <div
                            className="reveal-overlay"
                            style={{
                                position: 'absolute', inset: 0,
                                display: 'grid', placeItems: 'center',
                                background: 'linear-gradient(180deg, rgba(12,10,24,.85), rgba(12,10,24,.55))',
                                transform: `translateY(-${opened ? 100 : Math.min(100, (overlayY / 260) * 100)}%)`,
                                transition: 'transform .2s ease-out',
                                color: '#fff'
                            }}
                            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                        >
                            <p className="hint" style={{ opacity: .9 }}>{t.swipeHint}</p>

                            <div
                                className="cta"
                                style={{
                                    marginTop: 40,
                                    padding: '8px 12px',
                                    borderRadius: 10,
                                    background: 'linear-gradient(90deg, #22d3ee, #3b82f6)',
                                    color: '#0b1020',
                                    fontWeight: 700
                                }}
                            >
                                {t.revealCard}
                            </div>

                            <div>
                                {/* Pfeil-Icon nach oben */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#22d3ee"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ display: 'block', margin: '0 auto' }}
                                >
                                    <path d="M12 19V5" />
                                    <path d="M5 12l7-7 7 7" />
                                </svg>
                            </div>

                            <div
                                className={`reveal-name ${opened ? 'hidden' : ''}`}
                                style={{ marginTop: 10, opacity: .85 }}
                            >
                                {players[revealFor].name || '—'}
                            </div>
                        </div>

                    </div>

                    {/* Panel */}
                    <div className="word-panel" aria-live="polite" style={{
                        marginTop: 12,
                        border: '1px solid rgba(255,255,255,.12)',
                        borderRadius: 16,
                        padding: 16,
                        background: 'linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))'
                    }}>
                        {!opened ? (
                            <div className="sub" style={{ opacity: .9 }}>{t.revealCard}</div>
                        ) : revealFor === imposterId ? (
                            <>
                                <div className="check" style={{
                                    width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center',
                                    background: 'linear-gradient(90deg, #f472b6, #a78bfa)', color: '#fff', fontWeight: 800
                                }}>?</div>
                                <div className="word" style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}>{t.youAreImposter}</div>

                                <div className="panel-actions" style={{ marginTop: 10 }}>
                                    <button className="btn btn-accent" onClick={nextReveal} style={{
                                        padding: '10px 14px', borderRadius: 12, fontWeight: 700,
                                        background: 'linear-gradient(90deg, #818cf8, #f472b6)', color: '#fff'
                                    }}>{t.next} ▶️</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="check" style={{
                                    width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center',
                                    background: 'linear-gradient(90deg, #22d3ee, #3b82f6)', color: '#0b1020', fontWeight: 800
                                }}>✓</div>
                                <div className="word">
                                    {getTermForLanguage(word, lang)}
                                </div>

                                {imageCredit?.author && imageCredit?.author_link && imageCredit?.source_link && (
                                    <div className="sub" style={{ opacity: .8, fontSize: 12, marginTop: 8 }}>
                                        Photo by{' '}
                                        <a
                                            href={`${imageCredit.author_link}?utm_source=kurdish-imposter&utm_medium=referral`}
                                            target="_blank" rel="noreferrer"
                                        >
                                            {imageCredit.author}
                                        </a>{' '}
                                        on{' '}
                                        <a
                                            href={`${imageCredit.source_link}?utm_source=kurdish-imposter&utm_medium=referral`}
                                            target="_blank" rel="noreferrer"
                                        >
                                            Unsplash
                                        </a>
                                    </div>
                                )}
                                <div className="panel-actions" style={{ marginTop: 10 }}>
                                    <button className="btn btn-accent" onClick={nextReveal} style={{
                                        padding: '10px 14px', borderRadius: 12, fontWeight: 700,
                                        background: 'linear-gradient(90deg, #22d3ee, #3b82f6)', color: '#0b1020'
                                    }}>{t.next} ▶️</button>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Nach Reveal aller Spieler */}
            {started && revealFor === null && (
                <div className="card" style={{
                    marginTop: 16,
                    border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: 16,
                    padding: 16,
                    background: 'linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05))',
                    boxShadow: '0 10px 30px rgba(0,0,0,.15)',
                    backdropFilter: 'blur(6px)'
                }}>
                    <div className="h1" style={{
                        background: 'linear-gradient(90deg, #a78bfa, #f472b6)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        fontWeight: 800
                    }}>🔔 {t.allSet}</div>
                    <div className="sub" style={{ opacity: .85 }}>{t.discuss}</div>
                    <div className="row" style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                        <button className="btn" onClick={resetGame} style={{
                            padding: '10px 14px', borderRadius: 12, fontWeight: 700,
                            background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.12)'
                        }}>↩️ {t.reset}</button>
                        <button className="btn btn-accent" onClick={newRound} style={{
                            padding: '10px 14px', borderRadius: 12, fontWeight: 700,
                            background: 'linear-gradient(90deg, #818cf8, #f472b6)', color: '#fff'
                        }}>🪄 {t.newWord}</button>
                    </div>
                </div>
            )}
        </main>
    )
}
