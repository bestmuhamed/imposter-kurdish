'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type AppLang = 'en' | 'de' | 'krd'

type Ctx = {
  lang: AppLang
  setLang: (l: AppLang) => void
}

const LanguageContext = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLang>('krd')

  // beim Laden aus localStorage lesen
  useEffect(() => {
    const saved = (typeof window !== 'undefined' && window.localStorage.getItem('app_lang')) as AppLang | null
    if (saved === 'en' || saved === 'de' || saved === 'krd') setLangState(saved)
  }, [])

  const setLang = (l: AppLang) => {
    setLangState(l)
    try { window.localStorage.setItem('app_lang', l) } catch {}
  }

  const value = useMemo(() => ({ lang, setLang }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>')
  return ctx
}
