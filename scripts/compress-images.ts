import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

interface CompressOptions {
  inputDir: string;
  outputDir: string;
  year: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  fullWidth?: number;
  fullHeight?: number;
  quality?: number;
}

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function compressImages(options: CompressOptions) {
  const {
    inputDir,
    outputDir,
    year,
    thumbnailWidth = 400,
    thumbnailHeight = 300,
    fullWidth = 1920,
    fullHeight = 1440,
    quality = 85,
  } = options;

  console.log(`🚀 Начинаем сжатие изображений для ${year} года...`);
  console.log(`📁 Входная директория: ${inputDir}`);
  console.log(`📁 Выходная директория: ${outputDir}`);

  // Создаем выходные директории
  const thumbnailsDir = path.join(outputDir, year, 'thumbnails');
  const fullDir = path.join(outputDir, year, 'full');

  await ensureDir(thumbnailsDir);
  await ensureDir(fullDir);

  // Читаем все файлы из входной директории
  const files = await fs.readdir(inputDir);
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  console.log(`📷 Найдено изображений: ${imageFiles.length}`);

  let processed = 0;
  let totalOriginalSize = 0;
  let totalThumbnailSize = 0;
  let totalFullSize = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const fileNameWithoutExt = path.parse(file).name;

    // Получаем размер оригинального файла
    const stats = await fs.stat(inputPath);
    totalOriginalSize += stats.size;

    try {
      // Создаем thumbnail
      const thumbnailPath = path.join(thumbnailsDir, `${fileNameWithoutExt}.webp`);
      await sharp(inputPath)
        .resize(thumbnailWidth, thumbnailHeight, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality })
        .toFile(thumbnailPath);

      const thumbnailStats = await fs.stat(thumbnailPath);
      totalThumbnailSize += thumbnailStats.size;

      // Создаем full версию
      const fullPath = path.join(fullDir, `${fileNameWithoutExt}.webp`);
      await sharp(inputPath)
        .resize(fullWidth, fullHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality })
        .toFile(fullPath);

      const fullStats = await fs.stat(fullPath);
      totalFullSize += fullStats.size;

      processed++;

      // Прогресс
      if (processed % 10 === 0 || processed === imageFiles.length) {
        console.log(`⏳ Обработано: ${processed}/${imageFiles.length}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка при обработке ${file}:`, error);
    }
  }

  // Статистика
  const originalSizeMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
  const thumbnailSizeMB = (totalThumbnailSize / 1024 / 1024).toFixed(2);
  const fullSizeMB = (totalFullSize / 1024 / 1024).toFixed(2);
  const totalCompressedMB = ((totalThumbnailSize + totalFullSize) / 1024 / 1024).toFixed(2);
  const savings = ((1 - (totalThumbnailSize + totalFullSize) / totalOriginalSize) * 100).toFixed(1);

  console.log('\n✅ Сжатие завершено!');
  console.log('📊 Статистика:');
  console.log(`   Оригинал: ${originalSizeMB} MB`);
  console.log(`   Thumbnails: ${thumbnailSizeMB} MB`);
  console.log(`   Full: ${fullSizeMB} MB`);
  console.log(`   Всего сжато: ${totalCompressedMB} MB`);
  console.log(`   Экономия: ${savings}%`);
  console.log(`\n📁 Результаты сохранены в: ${outputDir}/${year}/`);
}

// Использование из командной строки
const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Использование: npm run compress-images <inputDir> <outputDir> <year>');
  console.log('Пример: npm run compress-images ./photos/2022 ./compressed 2022');
  process.exit(1);
}

const [inputDir, outputDir, year] = args;

compressImages({
  inputDir,
  outputDir,
  year,
})
  .then(() => {
    console.log('\n🎉 Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  });

export { compressImages };
