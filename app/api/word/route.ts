import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'en').toLowerCase(); // default to English
    const category = searchParams.get('category') || null;

    // 1) Random word via RPC
    const { data: words, error: e1 } = await supabase
      .rpc('get_random_word', { p_category: category });

    if (e1 || !words || words.length === 0) {
      console.error('RPC error:', e1);
      return NextResponse.json({ error: 'no_word' }, { status: 404 });
    }

    const w = words[0] as { id: string; word_en: string; category: string; difficulty: number };

    // 2) Fetch all translations
    const { data: translations, error: e2 } = await supabase
      .from('word_translations')
      .select('lang, term')
      .eq('word_en', w.word_en);

    if (e2) {
      console.warn('translation fetch error:', e2);
    }

    // Build a dictionary of terms: { en: '...', de: '...', krd: '...' }
    const terms: Record<string, string> = {};
    translations?.forEach(({ lang: l, term }) => {
      if (l && term) terms[l.toLowerCase()] = term;
    });

    // fallback for English, if not present
    if (!terms.en) terms.en = w.word_en;

    // 3) Determine the term for the requested language, fallback to English
    const termForLang = terms[lang] || terms.en;

    // 4) Public image by word id
    const { data: pub } = supabase.storage.from('word-images').getPublicUrl(`${w.id}.webp`);

    return NextResponse.json({
      id: w.id,
      word_en: w.word_en,
      term: termForLang,
      terms,              // << new multi-lang dictionary
      lang,
      category: w.category,
      difficulty: w.difficulty,
      imageUrl: pub.publicUrl,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
