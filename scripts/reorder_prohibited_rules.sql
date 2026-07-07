-- Reorder "prohibited" festival rule content
-- Run in Supabase SQL Editor. Moves the "Разрешённые исключения / Excepții permise"
-- block to the end so all prohibited items are listed first.

UPDATE festival_rules
SET
  content_ro = '[
    "Este strict interzis accesul cu:",
    "• Băuturi alcoolice sau slab alcoolice în orice recipient",
    "• Produse alimentare și băuturi, cu excepția apei plate",
    "• Medicamente, cu excepția celor vitale, antialergice și soluții pentru lentile (în ambalaj original sigilat)",
    "• Substanțe narcotice",
    "• Arme de orice tip (de foc, pneumatic, cu gaz, arme albe)",
    "• Substanțe explozive, artificii și articole pirotehnice",
    "• Lămpi cu combustibil, arzătoare, grătare, butelii, lichide inflamabile",
    "• Spray-uri aerosol, deodorante, repelente, produse pentru coafat",
    "• Obiecte tăioase sau periculoase",
    "• Lasere, generatoare, megafoane",
    "• Drone și quadcoptere",
    "Excepții permise:",
    "• Alimente pentru copii",
    "• Produse dietetice prescrise medical (cu dovadă medicală)"
  ]'::jsonb,
  content_ru = '[
    "Строго запрещён вход с:",
    "• Алкогольными или слабоалкогольными напитками в любой таре",
    "• Продуктами питания и напитками, за исключением негазированной воды",
    "• Медикаментами, за исключением жизненно необходимых, противоаллергических и растворов для линз (в оригинальной запечатанной упаковке)",
    "• Наркотическими веществами",
    "• Оружием любого типа (огнестрельным, пневматическим, газовым, холодным)",
    "• Взрывчатыми веществами, фейерверками и пиротехникой",
    "• Лампами на горючем, горелками, мангалами, баллонами, легковоспламеняющимися жидкостями",
    "• Аэрозольными спреями, дезодорантами, репеллентами, средствами для укладки",
    "• Острыми или опасными предметами",
    "• Лазерами, генераторами, мегафонами",
    "• Дронами и квадрокоптерами",
    "Разрешённые исключения:",
    "• Детское питание",
    "• Диетические продукты по медицинским показаниям (с документальным подтверждением)"
  ]'::jsonb
WHERE section_id = 'prohibited';

-- Verification (optional): expect 15 items in each language
SELECT jsonb_array_length(content_ru) AS ru_items,
       jsonb_array_length(content_ro) AS ro_items
FROM festival_rules
WHERE section_id = 'prohibited';
