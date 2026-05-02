import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables' },
        { status: 500 }
      );
    }

    // Buat client khusus dengan service role key untuk bypass RLS (opsional)
    // dan memastikan koneksi terjadi dari sisi server
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Lakukan query super ringan ke tabel 'articles' untuk memicu aktivitas
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive pulse sent successfully',
      timestamp: new Date().toISOString(),
      active: true
    });
  } catch (error: any) {
    console.error('Keep-alive error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal Server Error' 
      },
      { status: 500 }
    );
  }
}
