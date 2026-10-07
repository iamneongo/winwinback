import sharp from "sharp";
import { mkdir } from "node:fs/promises";

await mkdir("public/icons", { recursive: true });
for (const size of [180, 192, 512]) {
  await sharp("public/favicon.svg").resize(size, size).png().toFile(`public/icons/pwa-${size}.png`);
}
const mark = await sharp("public/favicon.svg").resize(320, 320).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#082b4b" } })
  .composite([{ input: mark, gravity: "centre" }]).png().toFile("public/icons/pwa-maskable-512.png");
