// Generates the PNG app icons in public/ (no image library needed).
// Design: dark rounded square with a yellow check mark, matching public/favicon.svg.
// Run with: node scripts/generate-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync, crc32 } from 'node:zlib'

const INK = [0x1b, 0x23, 0x40]
const YELLOW = [0xff, 0xd8, 0x4d]

// The check mark in a 512 x 512 design space (same path as favicon.svg).
const CHECK = [
  [140, 270],
  [225, 355],
  [375, 175],
]
const STROKE = 52
const RADIUS = 112

function distToSegment(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function insideRoundedSquare(x, y, size, radius) {
  const cx = Math.min(Math.max(x, radius), size - radius)
  const cy = Math.min(Math.max(y, radius), size - radius)
  return Math.hypot(x - cx, y - cy) <= radius
}

/**
 * Renders one icon. `bleed` icons fill the whole square (for maskable/Apple icons, where the OS
 * applies its own shape) and shrink the check mark into the safe zone. Others have rounded corners.
 */
function render(size, bleed) {
  const scale = size / 512
  const markScale = bleed ? 0.72 : 1
  const SS = 4 // supersampling per axis, for smooth edges
  const pixels = Buffer.alloc(size * size * 4)

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let bg = 0
      let fg = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) / scale
          const y = (py + (sy + 0.5) / SS) / scale
          if (bleed || insideRoundedSquare(x, y, 512, RADIUS)) bg++
          const mx = (x - 256) / markScale + 256
          const my = (y - 256) / markScale + 256
          const d = Math.min(distToSegment(mx, my, CHECK[0], CHECK[1]), distToSegment(mx, my, CHECK[1], CHECK[2]))
          if (d <= STROKE / 2) fg++
        }
      }
      const n = SS * SS
      const i = (py * size + px) * 4
      const alpha = bg / n
      const mix = bg ? Math.min(1, fg / bg) : 0
      for (let c = 0; c < 3; c++) pixels[i + c] = Math.round(INK[c] * (1 - mix) + YELLOW[c] * mix)
      pixels[i + 3] = Math.round(alpha * 255)
    }
  }
  return pixels
}

function png(size, rgba) {
  const rows = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    rows[y * (size * 4 + 1)] = 0 // filter: none
    rgba.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data])
    const out = Buffer.alloc(body.length + 8)
    out.writeUInt32BE(data.length, 0)
    body.copy(out, 4)
    out.writeUInt32BE(crc32(body), body.length + 4)
    return out
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const OUT = new URL('../public/icons/', import.meta.url)
mkdirSync(OUT, { recursive: true })

const icons = [
  ['icon-192.png', 192, false],
  ['icon-512.png', 512, false],
  ['icon-maskable-512.png', 512, true],
  ['apple-touch-icon.png', 180, true],
]
for (const [name, size, bleed] of icons) {
  writeFileSync(new URL(name, OUT), png(size, render(size, bleed)))
  console.log(`wrote public/icons/${name}`)
}
