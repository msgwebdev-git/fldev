import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const year = searchParams.get('year');
    const filename = searchParams.get('filename');

    if (!id || !year || !filename) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete from storage
    const thumbnailPath = `${year}/thumbnails/${filename}.webp`;
    const fullPath = `${year}/full/${filename}.webp`;

    await supabase.storage.from('gallery').remove([thumbnailPath, fullPath]);

    // Delete from database
    const { error: dbError } = await supabase
      .from('gallery')
      .delete()
      .eq('id', parseInt(id));

    if (dbError) {
      console.error('Database delete error:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
