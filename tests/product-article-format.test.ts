import { test } from "node:test";
import assert from "node:assert/strict";
import { buildProductArticleHtml, productArticleSections, productLabel } from "../src/lib/articles/product-article-format";
import { sanitizeArticleHtml } from "../src/lib/articles/sanitize";

test("product article follows the editorial structure and only renders supplied figures", () => {
  const fact = { name: "Lạp xưởng truyền thống 500g", platform: "Shopee", shopName: "Cửa hàng A", price: 90_900, estimatedCashback: 3_636 };
  const sections = productArticleSections(fact, "Thông tin về sản phẩm từ trang bán hàng. Chưa xác minh được đơn vị sản xuất.", "Cần xem thêm thành phần, hạn sử dụng và nhận xét của người mua trước khi quyết định.");
  const html = sanitizeArticleHtml(buildProductArticleHtml({ fact, sections, intro: "Bài viết đối chiếu thông tin từ trang sản phẩm.", imageUrl: "/api/img?url=test", }));
  assert.equal(sections.length, 5);
  assert.equal((html.match(/<h2>/g) ?? []).length, 5);
  assert.match(html, /<table>/);
  assert.match(html, /<th>Thông tin trên trang sản phẩm<\/th><th>Nhận xét<\/th>/);
  assert.match(html, /<h3>Cách mua qua Win-Win Back<\/h3>/);
  assert.match(html, /<h3>.*có được hoàn tiền không\?<\/h3>/);
  assert.match(html, /90\.900/);
  assert.match(html, /3\.636/);
  assert.doesNotMatch(html, /100\.900|40%|sản xuất bởi Cửa hàng A/);
});

test("missing product values stay explicitly unknown and text is escaped", () => {
  const fact = { name: "Sản phẩm <mới>", platform: "TikTok Shop" };
  const sections = productArticleSections(fact, "Thông tin còn thiếu.", "Chưa thể kết luận chất lượng.");
  const html = sanitizeArticleHtml(buildProductArticleHtml({ fact, sections, intro: null, imageUrl: null }));
  assert.match(html, /Chưa có dữ liệu/);
  assert.match(html, /Mức hoàn tiền sẽ hiển thị khi bạn kiểm tra link/);
  assert.match(html, /&lt;mới&gt;/);
  assert.doesNotMatch(html, /<mới>|NaN|undefined/);
});

test("headings use a concise product name when brand and model are present", () => {
  assert.equal(productLabel("Áo polo 88 phối local brand WENKO áo form rộng tay lỡ PK02"), "Áo polo WENKO PK02");
  assert.equal(productLabel("Lạp xưởng truyền thống 500g"), "Lạp xưởng truyền thống 500g");
});
