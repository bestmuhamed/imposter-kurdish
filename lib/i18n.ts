// lib/i18n.ts
import en from '@/locales/en.json'
import de from '@/locales/de.json'
import krd from '@/locales/krd.json'

export type Lang = 'en' | 'de' | 'krd'

const dicts: Record<Lang, any> = { en, de, krd }

export function getDict(lang: string) {
  if (['en','de','krd'].includes(lang)) return dicts[lang as Lang]
  return en
}

export const LANG_OPTIONS: Array<{ code: Lang; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'krd', label: 'Kurmancî' }
]
