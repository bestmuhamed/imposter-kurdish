'use client'
import { useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { LANG_OPTIONS } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)

  const current = LANG_OPTIONS.find(o => o.code === lang)

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        minWidth: 120
      }}
    >
      {/* Aktueller Wert */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,.2)',
          background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))',
          backdropFilter: 'blur(6px)',
          cursor: 'pointer',
          color: '#fff',
          fontWeight: 600
        }}
      >
        <span>{current?.label || lang}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .2s ease'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown-Liste */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            right: 0,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,.15)',
            background: 'linear-gradient(180deg, rgba(20,20,30,.95), rgba(15,15,25,.95))',
            boxShadow: '0 8px 20px rgba(0,0,0,.4)',
            zIndex: 100
          }}
        >
          {LANG_OPTIONS.map(o => (
            <div
              key={o.code}
              onClick={() => {
                setLang(o.code as any)
                setOpen(false)
              }}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                fontWeight: o.code === lang ? 700 : 500,
                background:
                  o.code === lang
                    ? 'linear-gradient(90deg,#818cf8,#f472b6)'
                    : 'transparent',
                color: o.code === lang ? '#fff' : '#ddd',
                borderRadius: o.code === lang ? 8 : 0
              }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
