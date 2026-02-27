# 3D Иконки Стоматологии: Production Brief (RU)

## 1) Единый стиль (обязательно для всех 12 иконок)
- Стиль: современный медицинский UI, semi-realistic 3D, Apple-like.
- Ракурс: 3/4 фронт, камера сверху на 10-12 градусов.
- Фокус: эквивалент 70-85mm, без сильной перспективной деформации.
- Масштаб: объект занимает ~80% кадра (одинаково во всех иконках).
- Материал эмали: `#F7F9FC` с мягкими переходами к `#E9EEF5`, легкий глянец.
- Свет: мягкий key сверху-слева, fill спереди, слабый rim справа.
- Тени: минимальные, размытые, эффект "плавающей" иконки.
- Фон: прозрачный (иконка должна читаться на `#FFFFFF` и `#F3F5F7`).
- Детализация: без шума и микро-деталей, читаемо в 48/64/128 px.
- Без текста внутри иконок.

## 2) Глобальный prompt-шаблон (для MJ/SDXL)
Использовать как базу + добавлять сцену конкретной иконки:

`clean medical 3d icon, semi-realistic tooth model, smooth rounded surfaces, white enamel material with subtle gradient, soft studio lighting, minimal shadow, floating icon, apple medical ui aesthetic, isolated on transparent background, centered composition, consistent camera angle, highly readable at 48x48, 64x64 and 128x128, no text, no watermark`

Рекомендуемые параметры для Midjourney:
- `--ar 1:1 --v 6 --stylize 120 --quality 1`

## 3) 12 иконок: визуальное описание + точечный prompt

### 1. Healthy tooth
Вид: целый моляр, ровная эмаль, мягкие фиссуры, без дефектов.
Prompt-добавка:
`single healthy molar tooth, intact enamel, clean occlusal surface, gentle glossy highlight`

### 2. Tooth with cavity (initial)
Вид: маленькое темное пятно в фиссуре, остальная коронка здорова.
Prompt-добавка:
`single molar with tiny dark caries spot on occlusal pit, minimal localized decay`

### 3. Tooth with deep caries
Вид: выраженная полость с темным центром и мягкой периферической пигментацией.
Prompt-добавка:
`single molar with deep caries cavity, visible crater, darker center, subtle enamel breakdown`

### 4. Tooth with filling
Вид: пломба на жевательной поверхности, аккуратный шов, клинически чисто.
Prompt-добавка:
`single molar with composite filling patch, slightly different off-white material, smooth restoration`

### 5. Tooth with crown
Вид: верхняя часть покрыта коронкой, заметна тонкая линия перехода у шейки.
Prompt-добавка:
`single tooth with ceramic crown cap, polished surface, subtle crown margin line near gumline`

### 6. Tooth with veneer
Вид: фронтальный зуб, тонкий винир на вестибулярной поверхности.
Prompt-добавка:
`single front tooth with porcelain veneer layer on front face, thin edge translucency`

### 7. Tooth with root canal treatment
Вид: схематичный cutaway без "жестких" медицинских деталей, видны обработанные каналы.
Prompt-добавка:
`single tooth with clean endodontic treatment, subtle cross-section, visible sealed root canals`

### 8. Tooth with braces
Вид: один зуб с брекетом и коротким сегментом дуги, металл матово-глянцевый.
Prompt-добавка:
`single tooth with orthodontic metal bracket and short wire segment, neat clinical look`

### 9. Tooth before treatment
Вид: до лечения: легкая трещина, небольшой скол и тусклая зона пигментации.
Prompt-добавка:
`single tooth before treatment, minor chip, faint crack, mild discoloration`

### 10. Tooth after treatment
Вид: восстановленный вариант #9, гладкая форма и чистая эмаль.
Prompt-добавка:
`single restored tooth after treatment, repaired smooth contour, brighter clean enamel`

### 11. Jaw with multiple teeth
Вид: сегмент дуги (5-7 зубов), мягкая десна, единый ритм формы.
Prompt-добавка:
`upper jaw segment with multiple teeth, soft pink gum base, clean anatomical rhythm`

### 12. Gum inflammation
Вид: зуб + акцент на воспаленной десне (припухлость и красно-розовый градиент).
Prompt-добавка:
`single tooth with inflamed gingiva around neck, mild swelling, red-pink irritated gum`

## 4) Контроль качества перед экспортом
- Проверка на 48x48: симптом читается за 1-2 секунды.
- Одинаковый размер объекта и одинаковое "высотное" положение в кадре.
- Единый свет и одинаковая контрастность между иконками.
- Нет лишних деталей, "шума", текста и фона.
- Экспорт: `PNG` (прозрачный) + исходник (`.blend`/`.fig`), размеры 48/64/128.
