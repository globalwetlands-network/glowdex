# Hero media credits

The on-page credit lines live in `HERO_MEDIA` (`src/features/landing/config/heroMedia.ts`).

⚠️ **`split-shot-photo.jpg` is still a PLACEHOLDER — not licensed for production.** It is
a watermarked stock comp. Before ship, replace it with a licensed export, compress it to a
~1920px-wide JPEG/WebP under ~300 KB, and update this table.

The video is the licensed purchase, exported for the web with HandBrake: 1280×720 H.264,
no audio, 4.7 MB. The 1080p master (`*.mov`, ~116 MB) is git-ignored because it exceeds
GitHub's 100 MB file limit. Keep it outside the repo. The poster is frame 0 of that master,
so it matches the first video frame and the poster-to-video swap shows no jump. It is a
1920×1080 JPEG (q80, ~520 KB). The dense foliage makes it heavier than the 300 KB target,
so it was kept at full quality.

| File                                | Used for                                                | Source                      | Credit                               | Licence                              |
| ----------------------------------- | ------------------------------------------------------- | --------------------------- | ------------------------------------ | ------------------------------------ |
| `hero-video-moses-perch.mp4`        | Video hero (default)                                    | Purchased stock video       | Baramee Temboonkiat                  | Licensed (purchased)                 |
| `hero-video-moses-perch-poster.jpg` | Video fallback (reduced motion, slow connection, error) | Frame 0 of the 1080p master | Same as `hero-video-moses-perch.mp4` | Same as `hero-video-moses-perch.mp4` |
| `split-shot-photo.jpg`              | Photo hero (`?hero=photo`)                              | iStock #1493269965          | jonathanfilskov-photography / iStock | Unlicensed comp (watermarked)        |
