'use client'
import { useEffect } from 'react'

export default function FooterAds() {
  useEffect(() => {
    // 1) Google Script dynamisch laden (AdSense verlangt es für die Verifizierung)
    const script = document.createElement('script')
    script.async = true
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-14913070703797021'
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    script.onload = () => {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        console.log('Ads not loaded yet', e)
      }
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
        background: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: 320, height: 50 }}
        data-ad-client="ca-pub-14913070703797021"
        data-ad-slot="1234567890"  // später ersetzen, wenn freigeschaltet
        data-full-width-responsive="false"
      ></ins>
    </footer>
  )
}
