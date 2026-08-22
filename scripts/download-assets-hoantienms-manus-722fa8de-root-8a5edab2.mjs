import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE = 'public/sites/hoantienms-manus-722fa8de/root-8a5edab2/images';
mkdirSync(BASE, { recursive: true });

const assets = [
  { url: 'https://hoantienms-6skvtbyd.manus.space/manus-storage/winwin-wallet-reference-match_b27fdde4.jpg', filename: 'winwin-wallet.jpg' },
  { url: 'https://hoantienms-6skvtbyd.manus.space/manus-storage/mobile-link-card_dfd008fe.jpg', filename: 'mobile-link-card.jpg' },
  { url: 'https://hoantienms-6skvtbyd.manus.space/manus-storage/route-illustration_aa1094d2.jpg', filename: 'route-illustration.jpg' },
  { url: 'https://hoantienms-6skvtbyd.manus.space/manus-storage/cashback-seal_1530381d.jpg', filename: 'cashback-seal.jpg' },
  { url: 'https://hoantienms-6skvtbyd.manus.space/manus-storage/hoan-arrow-logo_a084a1c8.png', filename: 'favicon.png', dest: 'public/sites/hoantienms-manus-722fa8de/root-8a5edab2' },
];

async function download(url, path) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url} → ${res.status}`);
  const buf = await res.arrayBuffer();
  writeFileSync(path, Buffer.from(buf));
  console.log('✓', path);
}

await Promise.all(assets.map(a => {
  const dir = a.dest || BASE;
  return download(a.url, join(dir, a.filename));
}));
console.log('All assets downloaded.');
