import nextEnv from "@next/env";
import pg from "pg";
import sharp from "sharp";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
nextEnv.loadEnvConfig(process.cwd());
const apply = process.argv.includes("--apply");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const root = path.resolve(process.env.ARTICLE_MEDIA_DIR || "storage/article-media");
try {
  await client.connect();
  const rows = await client.query("SELECT id, content_html, image_url, seo, revision FROM articles WHERE content_html LIKE '%data:image/%' OR image_url LIKE 'data:image/%' OR seo::text LIKE '%data:image/%'");
  console.log(`${rows.rowCount} articles contain inline images. Mode: ${apply ? 'APPLY' : 'DRY RUN'}`);
  if (apply && rows.rowCount) {
    await mkdir(".article-studio-backups", { recursive: true });
    await writeFile(path.resolve(".article-studio-backups", `inline-images-${Date.now()}.json`), JSON.stringify(rows.rows), { flag: "wx", mode: 0o600 });
    await mkdir(root, { recursive: true });
    const known = new Map();
    for (const row of rows.rows) {
      let serialized = JSON.stringify({ html: row.content_html, image: row.image_url, seo: row.seo });
      const matches = [...new Set(serialized.match(/data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+/g) || [])];
      await client.query("BEGIN");
      try {
        for (const data of matches) {
          const hash = createHash("sha256").update(data).digest("hex");
          let url = known.get(hash);
          if (!url) {
            const bytes = Buffer.from(data.slice(data.indexOf(",") + 1), "base64");
            if (bytes.length > 10 * 1024 * 1024) throw new Error("Inline image exceeds 10 MB");
            const full = await sharp(bytes, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
            const thumb = await sharp(full.data).resize({ width: 360, height: 240, fit: "inside" }).webp({ quality: 75 }).toBuffer();
            const id = randomUUID();
            await writeFile(path.join(root, `${id}.webp`), full.data, { flag: "wx" });
            await writeFile(path.join(root, `${id}-thumb.webp`), thumb, { flag: "wx" });
            await client.query("INSERT INTO article_media(id,name,width,height,bytes) VALUES($1,$2,$3,$4,$5)", [id, "Ảnh bài viết chuyển đổi", full.info.width, full.info.height, full.data.length]);
            url = `/api/article-media/${id}`; known.set(hash, url);
          }
          serialized = serialized.split(data).join(url);
        }
        const changed = JSON.parse(serialized);
        const updated = await client.query("UPDATE articles SET content_html=$1,image_url=$2,seo=$3,revision=revision+1 WHERE id=$4 AND revision=$5 RETURNING id", [changed.html, changed.image, changed.seo, row.id, row.revision]);
        if (!updated.rowCount) throw new Error("Article changed during conversion; retry after review");
        await client.query("COMMIT");
        console.log(`Converted ${row.id}`);
      } catch (error) { await client.query("ROLLBACK"); throw error; }
    }
  }
} finally { await client.end(); }
