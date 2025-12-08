import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config({ path: '.env.local' });

interface UploadOptions {
  inputDir: string;
  year: string;
  bucketName?: string;
}

async function uploadToSupabase(options: UploadOptions) {
  const { inputDir, year, bucketName = 'gallery' } = options;

  // Проверяем переменные окружения
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Ошибка: Не найдены NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY в .env.local');
    process.exit(1);
  }

  console.log('🚀 Подключение к Supabase...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Проверяем существование bucket
  console.log(`📦 Проверка bucket "${bucketName}"...`);
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('❌ Ошибка при получении списка buckets:', bucketsError);
    process.exit(1);
  }

  const bucketExists = buckets?.some(b => b.name === bucketName);

  if (!bucketExists) {
    console.log(`📦 Создание bucket "${bucketName}"...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });

    if (createError) {
      console.error('❌ Ошибка при создании bucket:', createError);
      process.exit(1);
    }
    console.log('✅ Bucket создан успешно');
  } else {
    console.log('✅ Bucket уже существует');
  }

  // Загружаем thumbnails
  console.log(`\n📤 Загрузка thumbnails для ${year} года...`);
  const thumbnailsDir = path.join(inputDir, year, 'thumbnails');
  await uploadDirectory(supabase, thumbnailsDir, bucketName, `${year}/thumbnails`);

  // Загружаем full изображения
  console.log(`\n📤 Загрузка full изображений для ${year} года...`);
  const fullDir = path.join(inputDir, year, 'full');
  await uploadDirectory(supabase, fullDir, bucketName, `${year}/full`);

  console.log('\n✅ Загрузка завершена!');
  console.log(`\n🔗 Ваши изображения доступны по URL:`);
  console.log(`   Thumbnails: ${supabaseUrl}/storage/v1/object/public/${bucketName}/${year}/thumbnails/`);
  console.log(`   Full: ${supabaseUrl}/storage/v1/object/public/${bucketName}/${year}/full/`);
}

async function uploadDirectory(
  supabase: any,
  dirPath: string,
  bucketName: string,
  storagePath: string
) {
  try {
    const files = await fs.readdir(dirPath);
    const imageFiles = files.filter(file => /\.webp$/i.test(file));

    console.log(`📷 Найдено файлов: ${imageFiles.length}`);

    let uploaded = 0;
    let failed = 0;

    for (const file of imageFiles) {
      const filePath = path.join(dirPath, file);
      const fileBuffer = await fs.readFile(filePath);
      const storageName = `${storagePath}/${file}`;

      try {
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(storageName, fileBuffer, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (error) {
          console.error(`❌ Ошибка при загрузке ${file}:`, error.message);
          failed++;
        } else {
          uploaded++;
          if (uploaded % 10 === 0 || uploaded === imageFiles.length) {
            console.log(`⏳ Загружено: ${uploaded}/${imageFiles.length}`);
          }
        }
      } catch (error) {
        console.error(`❌ Ошибка при загрузке ${file}:`, error);
        failed++;
      }
    }

    console.log(`✅ Успешно загружено: ${uploaded}`);
    if (failed > 0) {
      console.log(`❌ Не удалось загрузить: ${failed}`);
    }
  } catch (error) {
    console.error('❌ Ошибка при чтении директории:', error);
    throw error;
  }
}

// Использование из командной строки
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Использование: npm run upload-gallery <inputDir> <year> [bucketName]');
  console.log('Пример: npm run upload-gallery ./compressed 2022 gallery');
  process.exit(1);
}

const [inputDir, year, bucketName] = args;

uploadToSupabase({
  inputDir,
  year,
  bucketName,
})
  .then(() => {
    console.log('\n🎉 Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  });

export { uploadToSupabase };
