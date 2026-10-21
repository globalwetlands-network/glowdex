# Hero media credits

The on-page credit lines live in `HERO_MEDIA` (`src/features/landing/config/heroMedia.ts`).

⚠️ **`split-shot-photo.jpg` is still a PLACEHOLDER — not licensed for production.** It is
a watermarked stock comp. Before ship, replace it with a licensed export, compress it to a
~1920px-wide JPEG/WebP under ~300 KB, and update this table.

## Moses perch video licence

- Source: Getty Images, Creative # 687685780
- Page: https://www.gettyimages.com/detail/video/russells-snapper-moses-perch-stock-footage/687685780
- Contributor: Baramee Temboonkiat
- Licence: Royalty-free (purchased)
- Attribution: not required for creative footage. If the site shows a credits section for
  other licensed material, add this line: "Imagery supplied by Baramee Temboonkiat/Creatas
  Video via Getty Images"
- The receipt is held by the project team and has not been checked into the repo.

## Encoding

The 1080p master (`GLOW_MosesPerch_Video_full_quality.mov`, ~116 MB, 1920×1080 25 fps
H.264 with an AAC audio track) is git-ignored because it exceeds GitHub's 100 MB file limit.
Keep it outside the repo. All three web files are made from it with ffmpeg; the videos keep
only the video stream (no audio, data or metadata) and start playing before they finish
downloading (`+faststart`).

- **`hero-video-moses-perch.mp4`** (desktop, and the default): 1280×720 H.264, two-pass
  1000 kb/s, 15.08 s, 1,893,928 B.
- **`hero-video-moses-perch-mobile.mp4`**: 960×540 H.264, two-pass 760 kb/s, 15.08 s,
  1,434,993 B. Played below 768px wide; `HeroMedia.tsx` picks the file once with
  `matchMedia`.
- **`hero-video-moses-perch-poster.webp`**: frame 0 of the master, so it matches the first
  video frame and the poster-to-video swap shows no jump. 1280×720 WebP (quality 75),
  97,752 B. It is also the image shown instead of the video for reduced motion, slow
  connections and playback errors. The ffmpeg build used has no WebP encoder, so ffmpeg
  extracts a lossless frame and Pillow encodes it.

```sh
M=GLOW_MosesPerch_Video_full_quality.mov
# Videos: run once per row, (W, H, KBPS, OUT) = (1280, 720, 1000, hero-video-moses-perch.mp4)
# and (960, 540, 760, hero-video-moses-perch-mobile.mp4).
for PASS in 1 2; do
  [ $PASS = 1 ] && DEST=(-f mp4 /dev/null) || DEST=(-movflags +faststart "$OUT")
  ffmpeg -y -i "$M" -map 0:v:0 -an -dn -sn -map_metadata -1 \
    -vf "scale=${W}:${H}:flags=lanczos" -c:v libx264 -preset veryslow -profile:v high \
    -pix_fmt yuv420p -b:v "${KBPS}k" -pass $PASS -passlogfile x264 "${DEST[@]}"
done
# Poster
ffmpeg -y -i "$M" -frames:v 1 -vf "scale=1280:720:flags=lanczos" poster-frame0.png
python3 -c "from PIL import Image; Image.open('poster-frame0.png').convert('RGB').save('hero-video-moses-perch-poster.webp', 'WEBP', quality=75, method=6)"
```

| File                                 | Used for                                                | Source                               | Credit                               | Licence                              |
| ------------------------------------ | ------------------------------------------------------- | ------------------------------------ | ------------------------------------ | ------------------------------------ |
| `hero-video-moses-perch.mp4`         | Video hero (default), viewports 768px and wider         | Getty Images, Creative # 687685780   | Baramee Temboonkiat                  | Royalty-free (purchased)             |
| `hero-video-moses-perch-mobile.mp4`  | Video hero below 768px                                  | Same as `hero-video-moses-perch.mp4` | Same as `hero-video-moses-perch.mp4` | Same as `hero-video-moses-perch.mp4` |
| `hero-video-moses-perch-poster.webp` | Video fallback (reduced motion, slow connection, error) | Frame 0 of the 1080p master          | Same as `hero-video-moses-perch.mp4` | Same as `hero-video-moses-perch.mp4` |
| `split-shot-photo.jpg`               | Photo hero (`?hero=photo`)                              | iStock #1493269965                   | jonathanfilskov-photography / iStock | Unlicensed comp (watermarked)        |
