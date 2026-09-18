// Replaces Capacitor's default launcher icons and splash screen in the generated android/ project
// with ones drawn from this app's design. Run after `npx cap add android`.
// Usage: node scripts/android-icons.mjs [path/to/android/app/src/main/res]
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { INK, png, render } from './icon-lib.mjs'

const res = process.argv[2] ?? 'android/app/src/main/res'
if (!existsSync(res)) {
  console.error(`No Android resources at ${res}. Run "npx cap add android" first.`)
  process.exit(1)
}

// Launcher icon size and adaptive-icon layer size (108dp) per screen density.
const densities = {
  mdpi: { launcher: 48, layer: 108 },
  hdpi: { launcher: 72, layer: 162 },
  xhdpi: { launcher: 96, layer: 216 },
  xxhdpi: { launcher: 144, layer: 324 },
  xxxhdpi: { launcher: 192, layer: 432 },
}

const write = (file, size, options) => {
  const [width, height] = Array.isArray(size) ? size : [size, size]
  writeFileSync(file, png(width, height, render({ width, height, ...options })))
}

for (const [density, { launcher, layer }] of Object.entries(densities)) {
  const dir = join(res, `mipmap-${density}`)
  write(join(dir, 'ic_launcher.png'), launcher, { shape: 'rounded' }) // pre-Android 8 icon
  write(join(dir, 'ic_launcher_round.png'), launcher, { shape: 'round', markScale: 0.85 })
  // Adaptive icon foreground: transparent, with the mark well inside the 66dp safe zone.
  write(join(dir, 'ic_launcher_foreground.png'), layer, { shape: 'none', markScale: 0.85 })
}

// Adaptive icon background colour.
const hex = '#' + INK.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()
writeFileSync(
  join(res, 'values', 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${hex}</color>\n</resources>\n`,
)

// Splash screens: same size as each default image, dark background with the check mark centred.
let splashCount = 0
for (const entry of readdirSync(res)) {
  const file = join(res, entry, 'splash.png')
  if (!entry.startsWith('drawable') || !existsSync(file) || !statSync(file).isFile()) continue
  const header = readFileSync(file)
  const width = header.readUInt32BE(16)
  const height = header.readUInt32BE(20)
  write(file, [width, height], { shape: 'full', markScale: 0.6 })
  splashCount++
}

console.log(`android icons written: ${Object.keys(densities).length} densities, ${splashCount} splash images, background ${hex}`)
