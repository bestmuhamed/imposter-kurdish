'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDict, LANG_OPTIONS } from '@/lib/i18n'

export default function LangPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'en'|'de'|'krd'>('krd')
  const t = getDict(lang)

  function next() {
    localStorage.setItem('lang', lang)
    router.push('/setup/players')
  }

  return (
    <main className="card">
      <h1>{t.language}</h1>
      <select value={lang} onChange={e => setLang(e.target.value as any)}>
        {LANG_OPTIONS.map(o => (
          <option key={o.code} value={o.code}>{o.label}</option>
        ))}
      </select>
      <div className="row" style={{ marginTop: 20 }}>
        <button className="btn btn-accent" onClick={next}>
          {t.next} ▶️
        </button>
      </div>
    </main>
  )
}
