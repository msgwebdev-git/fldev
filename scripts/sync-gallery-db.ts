import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface SyncOptions {
  year: string;
  bucketName?: string;
}

async function syncGalleryDb(options: SyncOptions) {
  const { year, bucketName = 'gallery' } = options;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Ошибка: Не найдены NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('🚀 Подключение к Supabase...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Получаем список файлов из Storage
  console.log(`📦 Получение списка файлов для ${year} года...`);
  const { data: files, error } = await supabase.storage
    .from(bucketName)
    .list(`${year}/full`, {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (error) {
    console.error('❌ Ошибка при получении файлов:', error);
    process.exit(1);
  }

  if (!files || files.length === 0) {
    console.log('⚠️  Файлы не найдены. Убедитесь, что вы загрузили фото в Storage.');
    process.exit(0);
  }

  console.log(`📷 Найдено файлов: ${files.length}`);

  // Проверяем, существует ли таблица gallery
  const { data: existingRecords, error: selectError } = await supabase
    .from('gallery')
    .select('filename, year')
    .eq('year', year);

  if (selectError) {
    console.error('❌ Ошибка при проверке таблицы gallery:', selectError);
    console.log('\n💡 Возможно, таблица gallery не создана. Выполните SQL из supabase-gallery.sql');
    process.exit(1);
  }

  // Создаем Set существующих файлов
  const existingFilenames = new Set(
    existingRecords?.map(r => r.filename) || []
  );

  // Подготавливаем записи для вставки
  const newRecords = files
    .filter(file => !file.name.includes('/') && file.name.endsWith('.webp'))
    .filter(file => {
      const filename = file.name.replace('.webp', '');
      return !existingFilenames.has(filename);
    })
    .map((file, index) => {
      const filename = file.name.replace('.webp', '');
      return {
        year,
        filename,
        alt_text: `Festival Lupilor ${year} - Photo ${index + 1}`,
        display_order: index + 1,
        width: 1920,
        height: 1440,
      };
    });

  if (newRecords.length === 0) {
    console.log('✅ Все файлы уже синхронизированы с базой данных');
    return;
  }

  console.log(`📝 Добавление ${newRecords.length} новых записей в базу данных...`);

  // Вставляем записи пачками по 100
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < newRecords.length; i += batchSize) {
    const batch = newRecords.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from('gallery')
      .insert(batch);

    if (insertError) {
      console.error('❌ Ошибка при вставке записей:', insertError);
    } else {
      inserted += batch.length;
      console.log(`⏳ Вставлено: ${inserted}/${newRecords.length}`);
    }
  }

  console.log('\n✅ Синхронизация завершена!');
  console.log(`📊 Статистика:`);
  console.log(`   Всего файлов в Storage: ${files.length}`);
  console.log(`   Добавлено новых записей: ${inserted}`);
  console.log(`   Уже существовало: ${existingFilenames.size}`);
}

// Использование из командной строки
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Использование: npm run sync-gallery-db <year> [bucketName]');
  console.log('Пример: npm run sync-gallery-db 2022 gallery');
  process.exit(1);
}

const [year, bucketName] = args;

syncGalleryDb({ year, bucketName })
  .then(() => {
    console.log('\n🎉 Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  });

export { syncGalleryDb };
