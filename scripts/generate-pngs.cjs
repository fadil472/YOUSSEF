const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generateIconPNG(size, filename) {
  const width = size;
  const height = size;
  const rowBytes = 1 + width * 4; // 1 filter byte (0) + 4 bytes RGBA
  const rawData = Buffer.alloc(height * rowBytes);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width / 2;

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowBytes;
    rawData[rowStart] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Rounded squircle mask
      const cornerR = width * 0.22;
      const qx = Math.max(0, Math.abs(dx) - (cx - cornerR));
      const qy = Math.max(0, Math.abs(dy) - (cy - cornerR));
      const cornerDist = Math.sqrt(qx * qx + qy * qy);

      if (cornerDist > cornerR) {
        // Transparent outside
        rawData[idx] = 0;
        rawData[idx + 1] = 0;
        rawData[idx + 2] = 0;
        rawData[idx + 3] = 0;
        continue;
      }

      // Deep dark Obsidian background gradient (#141727 -> #090b14)
      const gradT = (x + y) / (width + height);
      let r = Math.round(20 * (1 - gradT) + 9 * gradT);
      let g = Math.round(23 * (1 - gradT) + 11 * gradT);
      let b = Math.round(39 * (1 - gradT) + 20 * gradT);

      // Vortex Spiral pattern
      const spiralDist = Math.abs(dist - ((angle + Math.PI) / (2 * Math.PI) * (maxR * 0.6) + maxR * 0.15) % (maxR * 0.45));
      if (spiralDist < maxR * 0.05 && dist < maxR * 0.75 && dist > maxR * 0.15) {
        // Cyan / Violet glowing spiral
        const glow = 1 - (spiralDist / (maxR * 0.05));
        r = Math.min(255, r + Math.round(139 * glow));
        g = Math.min(255, g + Math.round(92 * glow));
        b = Math.min(255, b + Math.round(246 * glow));
      }

      // Central glowing core
      if (dist < maxR * 0.16) {
        const coreT = 1 - (dist / (maxR * 0.16));
        r = Math.min(255, r + Math.round(34 * coreT + 220 * (coreT * coreT)));
        g = Math.min(255, g + Math.round(211 * coreT + 220 * (coreT * coreT)));
        b = Math.min(255, b + Math.round(238 * coreT + 220 * (coreT * coreT)));
      }

      // Border highlight
      if (cornerDist > cornerR - 3) {
        r = Math.min(255, r + 90);
        g = Math.min(255, g + 60);
        b = Math.min(255, b + 180);
      }

      rawData[idx] = r;
      rawData[idx + 1] = g;
      rawData[idx + 2] = b;
      rawData[idx + 3] = 255; // Solid inside
    }
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdr = createChunk('IHDR', ihdrData);

  const compressedData = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressedData);
  const iend = createChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([sig, ihdr, idat, iend]);
  fs.writeFileSync(filename, pngBuffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

generateIconPNG(192, 'public/pwa-192x192.png');
generateIconPNG(512, 'public/pwa-512x512.png');
generateIconPNG(180, 'public/apple-touch-icon.png');
generateIconPNG(512, 'public/pwa-maskable-512x512.png');
