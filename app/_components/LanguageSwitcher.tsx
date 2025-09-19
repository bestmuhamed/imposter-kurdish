'use client'
import { useLanguage } from './LanguageProvider'
import { LANG_OPTIONS } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        border: '1px solid var(--border, #ddd)',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <span style={{ fontSize: 12, opacity: 0.8 }}>Language</span>
      <select
        value={lang}
        onChange={e => setLang(e.target.value as any)}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontWeight: 600,
          cursor: 'pointer'
        }}
        aria-label="Select language"
      >
        {LANG_OPTIONS.map(o => (
          <option key={o.code} value={o.code}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
