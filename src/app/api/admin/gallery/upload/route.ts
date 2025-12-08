import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const thumbnail = formData.get('thumbnail') as File;
    const full = formData.get('full') as File;
    const year = formData.get('year') as string;
    const filename = formData.get('filename') as string;
    const width = parseInt(formData.get('width') as string) || 1920;
    const height = parseInt(formData.get('height') as string) || 1440;

    if (!thumbnail || !full || !year || !filename) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client with service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upload thumbnail to Supabase Storage
    const thumbnailPath = `${year}/thumbnails/${filename}.webp`;
    const thumbnailBuffer = Buffer.from(await thumbnail.arrayBuffer());

    const { error: thumbnailError } = await supabase.storage
      .from('gallery')
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (thumbnailError) {
      console.error('Thumbnail upload error:', thumbnailError);
      return NextResponse.json(
        { error: 'Failed to upload thumbnail' },
        { status: 500 }
      );
    }

    // Upload full image to Supabase Storage
    const fullPath = `${year}/full/${filename}.webp`;
    const fullBuffer = Buffer.from(await full.arrayBuffer());

    const { error: fullError } = await supabase.storage
      .from('gallery')
      .upload(fullPath, fullBuffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (fullError) {
      console.error('Full image upload error:', fullError);
      return NextResponse.json(
        { error: 'Failed to upload full image' },
        { status: 500 }
      );
    }

    // Check if record already exists
    const { data: existing } = await supabase
      .from('gallery')
      .select('id')
      .eq('year', year)
      .eq('filename', filename)
      .single();

    if (!existing) {
      // Get next display order
      const { data: lastPhoto } = await supabase
        .from('gallery')
        .select('display_order')
        .eq('year', year)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (lastPhoto?.display_order || 0) + 1;

      // Insert record into database
      const { error: dbError } = await supabase
        .from('gallery')
        .insert({
          year,
          filename,
          alt_text: `Festival Lupilor ${year}`,
          width,
          height,
          display_order: nextOrder,
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        return NextResponse.json(
          { error: 'Failed to insert into database' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      filename,
      thumbnailSize: thumbnailBuffer.length,
      fullSize: fullBuffer.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
