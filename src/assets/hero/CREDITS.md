# Hero media credits

⚠️ **PLACEHOLDERS — not licensed for production.** Every file here is a watermarked
iStock comp. Before ship, replace each one with a licensed export and update this table.
The on-page credit lines live in `HERO_MEDIA` (`src/features/landing/config/heroMedia.ts`).

TODO: once the licensed files are in, compress and optimise them. Targets: photo as
a ~1920px-wide JPEG/WebP under ~300 KB, video as H.264 MP4 (plus WebM if needed) under
~2 MB without audio, poster as a ~1280px JPEG taken from the licensed video.

| File                   | Used for                                                | Source                          | Credit                               | Licence                       |
| ---------------------- | ------------------------------------------------------- | ------------------------------- | ------------------------------------ | ----------------------------- |
| `split-shot-photo.jpg` | Photo hero (default)                                    | iStock #1493269965              | jonathanfilskov-photography / iStock | Unlicensed comp (watermarked) |
| `crab.mp4`             | Crab video hero                                         | iStock #1046153262              | iStock (contributor TBC)             | Unlicensed comp (watermarked) |
| `crab-poster.jpg`      | Video fallback (reduced motion, slow connection, error) | Frame extracted from `crab.mp4` | Same as `crab.mp4`                   | Same as `crab.mp4`            |
