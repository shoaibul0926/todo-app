// Generates the PNG app icons in public/ (no image library needed).
// Run with: node scripts/generate-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { png, render } from './icon-lib.mjs'

const OUT = new URL('../public/icons/', import.meta.url)
mkdirSync(OUT, { recursive: true })

// "Full bleed" icons fill the square (the OS applies its own shape) and keep the mark inside the safe zone.
const icons = [
  ['icon-192.png', 192, { shape: 'rounded' }],
  ['icon-512.png', 512, { shape: 'rounded' }],
  ['icon-maskable-512.png', 512, { shape: 'full', markScale: 0.72 }],
  ['apple-touch-icon.png', 180, { shape: 'full', markScale: 0.72 }],
]
for (const [name, size, options] of icons) {
  writeFileSync(new URL(name, OUT), png(size, size, render({ width: size, ...options })))
  console.log(`wrote public/icons/${name}`)
}
