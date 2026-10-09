import assert from "node:assert/strict";
import test from "node:test";
import { normalizeArticleCategory } from "../src/lib/articles/categories";

test("groups equivalent Shopee and TikTok categories", () => {
  assert.equal(normalizeArticleCategory("Thời Trang Nữ › Áo"), "Thời trang & phụ kiện");
  assert.equal(normalizeArticleCategory("Fashion › Women's Clothing"), "Thời trang & phụ kiện");
  assert.equal(normalizeArticleCategory("Thiết Bị Điện Tử › Camera"), "Điện tử & công nghệ");
  assert.equal(normalizeArticleCategory("Phụ kiện điện thoại"), "Điện tử & công nghệ");
  assert.equal(normalizeArticleCategory("Đồ Ăn Vặt › Bánh Tráng"), "Thực phẩm & đồ uống");
});

test("keeps canonical labels and safely groups unknown categories", () => {
  assert.equal(normalizeArticleCategory("Mẹ & bé"), "Mẹ & bé");
  assert.equal(normalizeArticleCategory(null), "Khác");
  assert.equal(normalizeArticleCategory("Danh mục chưa xác định"), "Khác");
});
