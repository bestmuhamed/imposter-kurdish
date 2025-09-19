'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDict, LANG_OPTIONS } from '@/lib/i18n'

type Player = { id: number; name: string }

const CATEGORIES = [
  { slug: '', label: 'any' }, { slug: 'food', label: 'Food' },
  { slug: 'places', label: 'Places' }, { slug: 'objects', label: 'Objects' },
  { slug: 'animals', label: 'Animals' }, { slug: 'body', label: 'Body' },
  { slug: 'colors', label: 'Colors' }, { slug: 'professions', label: 'Professions' },
  { slug: 'time', label: 'Time' }
]

export default function PlayersPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'en'|'de'|'krd'>('krd')
  const t = getDict(lang)

  const [count, setCount] = useState(5)
  const [players, setPlayers] = useState<Player[]>([])
  const [category, setCategory] = useState('')

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as 'en'|'de'|'krd'|null
    if (savedLang) setLang(savedLang)
    setPlayers(Array.from({ length: count }, (_, i) => ({ id: i, name: '' })))
  }, [count])

  function start() {
    localStorage.setItem('count', String(count))
    localStorage.setItem('players', JSON.stringify(players))
    localStorage.setItem('category', category)
    router.push('/game')
  }

  return (
    <main>
      <div className="card">
        <div className="row">
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
        <button className="btn btn-accent" onClick={start}>{t.start} ▶️</button>
      </div>
    </main>
  )
}
