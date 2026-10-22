import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export type ArticleMediaUsage = {
  kind: "article" | "draft" | "version" | "outro";
  id: string;
  label: string;
  href: string;
  blocksRemoval: boolean;
};

/** Keep historical references visible, but only current content prevents library removal. */
export async function getArticleMediaUsage(id: string): Promise<ArticleMediaUsage[]> {
  const pattern = `%${id}%`;
  const result = await db.execute(sql`
    SELECT 'article' AS kind, a.id::text AS ref_id, a.title AS label
      FROM articles a
      WHERE a.content_html LIKE ${pattern} OR a.image_url LIKE ${pattern} OR a.seo::text LIKE ${pattern}
    UNION ALL
    SELECT 'draft' AS kind, a.id::text AS ref_id, a.title AS label
      FROM article_drafts d JOIN articles a ON a.id = d.article_id
      WHERE d.document::text LIKE ${pattern}
    UNION ALL
    SELECT 'version' AS kind, a.id::text AS ref_id, a.title || ' · ' || v.label AS label
      FROM article_versions v JOIN articles a ON a.id = v.article_id
      WHERE v.document::text LIKE ${pattern}
    UNION ALL
    SELECT 'outro' AS kind, o.id AS ref_id, o.name AS label
      FROM article_outros o
      WHERE o.image_url LIKE ${pattern} OR o.links::text LIKE ${pattern}
  `);

  return result.rows.map((row) => {
    const kind = String(row.kind) as ArticleMediaUsage["kind"];
    const refId = String(row.ref_id);
    return {
      kind,
      id: refId,
      label: String(row.label),
      href: kind === "outro" ? "/admin/bai-viet/mau-cuoi-bai" : `/admin/bai-viet/${refId}/sua`,
      blocksRemoval: kind !== "version",
    };
  });
}
