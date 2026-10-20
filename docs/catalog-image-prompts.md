# Изображения категорий каталога

## Текущий вариант: нейтральные силуэты

Созданы встроенным image_gen на основе предыдущих изображений. По просьбе пользователя транспорт заменён на менее узнаваемые боковые силуэты с контровым освещением. Размер обоих файлов — 1536 × 1024 px (3:2), JPEG, качество 86.

- `src/assets/img/catalog-car-silhouette.jpg`
- `src/assets/img/catalog-moto-silhouette.jpg`

### Автомобиль — финальный промпт

```text
Use case: precise-object-edit.
Asset type: one category-card background in a matched car/motorcycle website image pair.
Edit the reference into a dramatically less identifiable vehicle silhouette. The original detailed vehicle design is specifically REJECTED: replace the entire vehicle with a newly designed generic silhouette, do not preserve its model identity or its distinctive styling.
Keep the charcoal studio mood, matte concrete floor, neutral monochrome palette, landscape 3:2 canvas, exactly 1536 x 1024 pixels. Shift lighting to soft BACKLIGHT with a gentle grey halo behind the subject and a very faint silver edge highlight. The vehicle body must read as a near-black silhouette with only tiny soft tonal variations. Product-photography atmosphere, not a flat white-background clipart icon.
Composition: strict left-facing SIDE PROFILE, no front-three-quarter angle, no view into the front face, entire vehicle visible, centered horizontally, all edges inside frame. Vehicle centered vertically above the bottom quarter; leave the bottom 25% as dark quiet floor for HTML title. Match a restrained, premium, anonymous category pictogram photographed in a dark studio.
Constraints: no logos, no emblems, no text, no license plates, no signature LED patterns, no distinctive recognizable design details, no visible branding, no watermark. Do not reproduce a specific existing manufacturer's model. No split screen, no collage, no border. One finished image.
Subject: an anonymous simplified compact family sedan silhouette with a smoothly rounded roof, ordinary short hood and modest trunk, two plain dark circular wheels. No sculpted sporty panels, no recognizable grille, no detailed headlights, no rim spoke design, no door handle detail. The outline should communicate only the broad category CAR. Vehicle spans about 78% of image width. Black side windows merge into the dark body.
```

### Мотоцикл — финальный промпт

```text
Use case: precise-object-edit.
Asset type: one category-card background in a matched car/motorcycle website image pair.
Edit the reference into a dramatically less identifiable vehicle silhouette. The original detailed vehicle design is specifically REJECTED: replace the entire vehicle with a newly designed generic silhouette, do not preserve its model identity or its distinctive styling.
Keep the charcoal studio mood, matte concrete floor, neutral monochrome palette, landscape 3:2 canvas, exactly 1536 x 1024 pixels. Shift lighting to soft BACKLIGHT with a gentle grey halo behind the subject and a very faint silver edge highlight. The vehicle body must read as a near-black silhouette with only tiny soft tonal variations. Product-photography atmosphere, not a flat white-background clipart icon.
Composition: strict left-facing SIDE PROFILE, no front-three-quarter angle, no view into the front face, entire vehicle visible, centered horizontally, all edges inside frame. Vehicle centered vertically above the bottom quarter; leave the bottom 25% as dark quiet floor for HTML title. Match a restrained, premium, anonymous category pictogram photographed in a dark studio.
Constraints: no logos, no emblems, no text, no license plates, no signature LED patterns, no distinctive recognizable design details, no visible branding, no watermark. Do not reproduce a specific existing manufacturer's model. No split screen, no collage, no border. One finished image.
Subject: an anonymous simplified standard road motorcycle silhouette, two plain dark wheels, small plain fuel tank, straight seat, neutral upright handlebar, slender fork, ordinary tubular frame. No signature angular bodywork, no visible engine architecture or decorative mechanical detail, headlight unlit and barely visible in strict profile. No rider, no luggage. The outline should communicate only the broad category MOTORCYCLE. Vehicle spans about 72% of image width.
```

## Предыдущий вариант (заменён)

Пробные изображения сохранены только локально, исключены из Git и не используются на сайте.

Созданы встроенным инструментом image_gen. Размер каждого изображения: 1536 × 1024 px (3:2). Для сайта сохранены JPEG с качеством 86; исходные PNG остаются в каталоге генерации Codex.

- `src/assets/img/catalog-car-studio.jpg`
- `src/assets/img/catalog-moto-studio.jpg`

## Автомобиль

```text
Use case: ads-marketing.
Asset type: full-bleed photographic background for one category card on a Russian vehicle brake-pad catalogue website.
Create a NEW photorealistic studio photograph, landscape orientation, exactly 1536 x 1024 pixels, 3:2 aspect ratio.
Shared art direction for a matched two-image set: charcoal grey seamless automotive photography studio, matte dark grey concrete floor, subtle soft grey backdrop gradient, large diffused overhead softbox from upper left, controlled silver highlights, deep but readable shadows. Neutral colors. Crisp authentic vehicle materials and proportions. Premium understated commercial photography, physically plausible, no dramatic fantasy effects.
Composition: one entire vehicle centered in the frame, front three-quarter view pointing toward the left, camera at headlight level, vehicle occupying approximately 75% of the canvas width, plenty of breathing room around all edges. Keep vehicle within the middle 65% of image height so a 16:10 card crop does not cut it off. Leave the bottom 20% as calm dark floor for later HTML title overlay.
No people, no words, no letters, no watermark, no visible logos or manufacturer emblems, no readable license plate. No collage, no split-screen, no borders. Deliver a single finished photograph, not a webpage or mockup.
Subject: one graphite metallic modern four-door performance sedan with clean contemporary bodywork, convincing dark alloy wheels and visible brake discs. Restrained realistic car design, wheels straight, no race decorations. The whole vehicle must be visible.
```

## Мотоцикл

```text
Use case: ads-marketing.
Asset type: full-bleed photographic background for one category card on a Russian vehicle brake-pad catalogue website.
Create a NEW photorealistic studio photograph, landscape orientation, exactly 1536 x 1024 pixels, 3:2 aspect ratio.
Shared art direction for a matched two-image set: charcoal grey seamless automotive photography studio, matte dark grey concrete floor, subtle soft grey backdrop gradient, large diffused overhead softbox from upper left, controlled silver highlights, deep but readable shadows. Neutral colors. Crisp authentic vehicle materials and proportions. Premium understated commercial photography, physically plausible, no dramatic fantasy effects.
Composition: one entire vehicle centered in the frame, front three-quarter view pointing toward the left, camera at headlight level, vehicle occupying approximately 75% of the canvas width, plenty of breathing room around all edges. Keep vehicle within the middle 65% of image height so a 16:10 card crop does not cut it off. Leave the bottom 20% as calm dark floor for later HTML title overlay.
No people, no words, no letters, no watermark, no visible logos or manufacturer emblems, no readable license plate. No collage, no split-screen, no borders. Deliver a single finished photograph, not a webpage or mockup.
Subject: one graphite metallic contemporary naked road motorcycle with a compact round LED headlight, realistic black alloy wheels, visible brake discs, front fork, detailed engine and exhaust, parked on its side stand, no rider. Restrained realistic mechanical design. The whole motorcycle and both wheels must be visible.
```
