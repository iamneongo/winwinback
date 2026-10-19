import "server-only";
import path from "node:path";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import sharp from "sharp";
import { db } from "@/db";
import { articleMedia } from "@/db/schema";

export const mediaRoot = () => path.resolve(/* turbopackIgnore: true */ process.env.ARTICLE_MEDIA_DIR || path.join(process.cwd(), "storage/article-media"));
export function mediaPath(id: string, thumb = false) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Invalid media id");
  return path.join(mediaRoot(), `${id}${thumb ? "-thumb" : ""}.webp`);
}
export async function storeArticleImage(bytes: Buffer, name: string) {
  if (!bytes.length || bytes.length > 10 * 1024 * 1024) throw new Error("Ảnh tối đa 10 MB.");
  const meta = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata();
  if (!["jpeg", "png", "webp", "avif"].includes(meta.format || "") || (meta.pages || 1) > 1) throw new Error("Chỉ nhận ảnh tĩnh JPEG, PNG, WebP hoặc AVIF.");
  const id = crypto.randomUUID();
  const full = await sharp(bytes, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const thumb = await sharp(full.data).resize({ width: 360, height: 240, fit: "inside", withoutEnlargement: true }).webp({ quality: 75 }).toBuffer();
  await mkdir(mediaRoot(), { recursive: true });
  try {
    await writeFile(mediaPath(id), full.data, { flag: "wx" });
    await writeFile(mediaPath(id, true), thumb, { flag: "wx" });
    await db.insert(articleMedia).values({ id, name: name.slice(0, 180), width: full.info.width, height: full.info.height, bytes: full.data.length });
  } catch (error) {
    await Promise.allSettled([unlink(mediaPath(id)), unlink(mediaPath(id, true))]);
    throw error;
  }
  return { id, url: `/api/article-media/${id}`, width: full.info.width, height: full.info.height };
}
export async function readArticleImage(id: string, thumb: boolean) { return readFile(mediaPath(id, thumb)); }
