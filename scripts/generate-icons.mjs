import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'logo', 'index.avif')
const publicDir = join(root, 'public')
mkdirSync(publicDir, { recursive: true })

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
  { name: 'favicon-32.png',       size: 32  },
]

for (const { name, size } of sizes) {
  await sharp(src).resize(size, size).png().toFile(join(publicDir, name))
  console.log(`✓ ${name}`)
}

// favicon.ico as small PNG
await sharp(src).resize(32, 32).png().toFile(join(publicDir, 'favicon.ico'))
console.log('✓ favicon.ico')

console.log('\nAll icons generated!')
