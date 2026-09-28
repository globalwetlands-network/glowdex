// Copies Vite's content-hashed app stylesheet to the stable path the sync reads (cfg.cssEntry).
// Fails if the build emitted zero or several index-*.css files, since a glob copy would then
// silently pick the wrong one or error unclearly.
import { copyFileSync, readdirSync } from 'node:fs';

const matches = readdirSync('dist/assets').filter((f) =>
  /^index-.*\.css$/.test(f),
);
if (matches.length !== 1) {
  console.error(
    `[copy-css] expected exactly one dist/assets/index-*.css, found ${matches.length}: ${matches.join(', ') || 'none'}`,
  );
  process.exit(1);
}
copyFileSync(`dist/assets/${matches[0]}`, 'dist/glowdex.css');
console.log(`[copy-css] dist/assets/${matches[0]} -> dist/glowdex.css`);
