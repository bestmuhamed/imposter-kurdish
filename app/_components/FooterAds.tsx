'use client'
import { useEffect } from 'react'

export default function FooterAds() {
  useEffect(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXX') // deine Publisher-ID
    document.body.appendChild(script)

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.log('Ads not loaded yet', e)
    }
  }, [])

  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#000', // optional Hintergrund
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60, // typische Bannerhöhe
      }}
    >
    </footer>
  )
}
