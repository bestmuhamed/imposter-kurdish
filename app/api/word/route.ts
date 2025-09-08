import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const lang = (searchParams.get('lang') || 'krd').toLowerCase()
        const category = searchParams.get('category') || null

        // 1) Random word via RPC
        const { data: words, error: e1 } = await supabase
            .rpc('get_random_word', { p_category: category })

        if (e1 || !words || words.length === 0) {
            console.error('RPC error:', e1)
            return NextResponse.json({ error: 'no_word' }, { status: 404 })
        }

        const w = words[0] as { id: string; word_en: string; category: string; difficulty: number }

        // 2) Translation (fallback auf EN)
        let term = w.word_en
        if (lang !== 'en') {
            const { data: t, error: e2 } = await supabase
                .from('word_translations')
                .select('term')
                .eq('word_en', w.word_en)
                .eq('lang', lang)
                .maybeSingle()
            if (e2) console.warn('translation error:', e2)
            if (t?.term) term = t.term
        }

        // 3) Public image by word id
        const { data: pub } = supabase.storage.from('word-images').getPublicUrl(`${w.id}.webp`)

        // ...
        return NextResponse.json({
            id: w.id,
            word_en: w.word_en,           // << hinzufügen
            term,
            lang,
            category: w.category,
            difficulty: w.difficulty,
            imageUrl: pub.publicUrl
        })

    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: 'internal_error' }, { status: 500 })
    }
}
