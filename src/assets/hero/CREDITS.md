# Hero media credits

⚠️ **PLACEHOLDERS — not licensed for production.** Every file here is a watermarked
stock comp. Before ship, replace each one with a licensed export and update this table.
The on-page credit lines live in `HERO_MEDIA` (`src/features/landing/config/heroMedia.ts`).

TODO: once the licensed files are in, compress and optimise them. Targets: photo as
a ~1920px-wide JPEG/WebP under ~300 KB, video as H.264 MP4 (plus WebM if needed) under
~2 MB without audio, poster as a ~1280px JPEG taken from the licensed video. The current
video comp is 768×432, 5.7 MB and still has an audio track.

| File                       | Used for                                                | Source                                   | Credit                               | Licence                       |
| -------------------------- | ------------------------------------------------------- | ---------------------------------------- | ------------------------------------ | ----------------------------- |
| `mangrove-fish.mp4`        | Video hero (default)                                    | Getty Images #687685780                  | Getty Images (contributor TBC)       | Unlicensed comp (watermarked) |
| `mangrove-fish-poster.jpg` | Video fallback (reduced motion, slow connection, error) | Frame extracted from `mangrove-fish.mp4` | Same as `mangrove-fish.mp4`          | Same as `mangrove-fish.mp4`   |
| `split-shot-photo.jpg`     | Photo hero (`?hero=photo`)                              | iStock #1493269965                       | jonathanfilskov-photography / iStock | Unlicensed comp (watermarked) |
