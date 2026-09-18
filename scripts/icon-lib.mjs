// Tiny icon renderer shared by generate-icons.mjs (web icons) and android-icons.mjs (native app icons).
// Design: dark rounded square with a yellow check mark, matching public/favicon.svg. No image library needed.
import { deflateSync, crc32 } from 'node:zlib'

export const INK = [0x1b, 0x23, 0x40]
export const YELLOW = [0xff, 0xd8, 0x4d]

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
 * Renders RGBA pixels. The 512-unit design is centred on the canvas and scaled to its shorter side.
 *  shape: 'rounded' (rounded square), 'round' (circle), 'full' (fills the whole canvas), 'none' (mark only, transparent)
 *  markScale: size of the check mark relative to the design (1 = as in the favicon)
 */
export function render({ width, height = width, shape = 'rounded', markScale = 1 }) {
  const scale = Math.min(width, height) / 512
  const SS = 4 // supersampling per axis, for smooth edges
  const pixels = Buffer.alloc(width * height * 4)

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let bg = 0
      let fg = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          // Design-space coordinates, centred on the canvas.
          const x = (px + (sx + 0.5) / SS - width / 2) / scale + 256
          const y = (py + (sy + 0.5) / SS - height / 2) / scale + 256
          if (shape === 'full') bg++
          else if (shape === 'rounded' && insideRoundedSquare(x, y, 512, RADIUS)) bg++
          else if (shape === 'round' && Math.hypot(x - 256, y - 256) <= 256) bg++
          const mx = (x - 256) / markScale + 256
          const my = (y - 256) / markScale + 256
          const d = Math.min(distToSegment(mx, my, CHECK[0], CHECK[1]), distToSegment(mx, my, CHECK[1], CHECK[2]))
          if (d <= STROKE / 2) fg++
        }
      }
      const n = SS * SS
      const i = (py * width + px) * 4
      if (shape === 'none') {
        for (let c = 0; c < 3; c++) pixels[i + c] = YELLOW[c]
        pixels[i + 3] = Math.round((fg / n) * 255)
        continue
      }
      const mix = bg ? Math.min(1, fg / bg) : 0
      for (let c = 0; c < 3; c++) pixels[i + c] = Math.round(INK[c] * (1 - mix) + YELLOW[c] * mix)
      pixels[i + 3] = Math.round((bg / n) * 255)
    }
  }
  return pixels
}

/** Encodes RGBA pixels as a PNG file. */
export function png(width, height, rgba) {
  const stride = width * 4 + 1
  const rows = Buffer.alloc(height * stride)
  for (let y = 0; y < height; y++) {
    rows[y * stride] = 0 // filter: none
    rgba.copy(rows, y * stride + 1, y * width * 4, (y + 1) * width * 4)
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
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
