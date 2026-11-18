export interface ProductArticleFact {
  name: string;
  platform: string;
  shopName?: string;
  category?: string;
  price?: number;
  rating?: string;
  soldCount?: number;
  estimatedCashback?: number;
}

export interface ProductArticleSection {
  q: string;
  a: string;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function money(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

function validAmount(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function productLabel(name: string): string {
  const words = name.trim().split(/\s+/);
  const brand = words.find((word) => /^[A-Z]{3,16}$/.test(word) && !["SALE", "HOT", "LOCAL", "BRAND", "SIZE", "SHOP", "FREE"].includes(word));
  const model = [...words].reverse().find((word) => /^[A-Z]{1,5}\d{2,}[A-Z0-9-]*$/.test(word));
  const label = brand && model ? [...words.slice(0, 2), brand, model].join(" ") : words.slice(0, 6).join(" ");
  return label.length > 72 ? `${label.slice(0, 69).trimEnd()}…` : label;
}

export function productArticleSections(fact: ProductArticleFact, identity: string, assessment: string): ProductArticleSection[] {
  const label = productLabel(fact.name);
  const price = validAmount(fact.price) ? `Giá ghi nhận từ ${fact.platform} là ${money(fact.price)}.` : `Hiện chưa có giá đáng tin cậy từ ${fact.platform} để đối chiếu.`;
  const cashback = validAmount(fact.estimatedCashback)
    ? `Mức hoàn dự kiến hiện là ${money(fact.estimatedCashback)}; mức thực tế phụ thuộc đơn hàng và kết quả đối soát.`
    : "Mức hoàn tiền sẽ hiển thị khi bạn kiểm tra link sản phẩm trên Win-Win Back; không nên ước đoán từ giá niêm yết.";
  return [
    { q: `${label} là gì và bán ở đâu?`, a: identity },
    { q: `${label} có tốt không? Đánh giá theo thông tin công khai`, a: assessment },
    { q: `Giá ${label} bao nhiêu và có đáng mua?`, a: `${price} Giá niêm yết và khuyến mãi có thể thay đổi theo thời điểm, phân loại hàng và nơi bán. Hãy xem lại giá tại trang sản phẩm trước khi quyết định; nếu cần so sánh giá theo khối lượng hoặc quy cách, chỉ tính khi thông tin đó được người bán công bố rõ.` },
    { q: `Mua ${label} ở đâu để được hoàn tiền?`, a: `Sản phẩm được ghi nhận trên ${fact.platform}. Để nhận hoàn tiền, bạn cần đăng nhập Win-Win Back, dán link sản phẩm và mua qua link được hệ thống tạo. ${cashback} Tiền chỉ được cộng vào ví khi đơn hoàn tất và được sàn xác nhận hợp lệ.` },
    { q: `Câu hỏi thường gặp về ${label}`, a: `${label} hiện được ghi nhận trên ${fact.platform}. ${price} ${cashback} Nếu dữ liệu người bán chưa đủ để xác nhận chất lượng hoặc xuất xứ, hãy kiểm tra thông tin trên trang sản phẩm và hỏi người bán trước khi đặt hàng.` },
  ];
}

function evidenceRows(fact: ProductArticleFact): [string, string, string][] {
  const rows: [string, string, string][] = [
    ["Nơi bán", fact.shopName ? `${fact.shopName} trên ${fact.platform}` : fact.platform, "Tên shop không đồng nghĩa với nhà sản xuất."],
    ["Giá niêm yết", validAmount(fact.price) ? money(fact.price) : "Chưa có dữ liệu", "Kiểm tra lại giá và phân loại trước khi mua."],
  ];
  if (fact.category) rows.push(["Danh mục", fact.category, "Danh mục do sàn cung cấp, không thay thế mô tả chi tiết."]);
  if (fact.rating) rows.push(["Điểm đánh giá", fact.rating, "Xem số lượng và nội dung nhận xét tại trang sản phẩm."]);
  if (typeof fact.soldCount === "number" && Number.isFinite(fact.soldCount) && fact.soldCount >= 0) rows.push(["Lượt bán", fact.soldCount.toLocaleString("vi-VN"), "Số liệu có thể thay đổi theo thời điểm."]);
  return rows;
}

export function buildProductArticleHtml(options: {
  imageUrl: string | null;
  intro: string | null;
  fact: ProductArticleFact;
  sections: ProductArticleSection[];
}): string {
  const { imageUrl, intro, fact, sections } = options;
  const parts: string[] = [];
  if (imageUrl) parts.push(`<p><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(fact.name)}" /></p>`);
  if (intro) parts.push(`<p>${escapeHtml(intro)}</p>`);
  sections.forEach((section, index) => {
    parts.push(`<h2>${escapeHtml(section.q)}</h2>`, `<p>${escapeHtml(section.a)}</p>`);
    if (index === 1) {
      parts.push("<table><thead><tr><th>Tiêu chí</th><th>Thông tin trên trang sản phẩm</th><th>Nhận xét</th></tr></thead><tbody>");
      for (const row of evidenceRows(fact)) parts.push(`<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`);
      parts.push("</tbody></table>");
    }
    if (index === 3) {
      parts.push("<h3>Cách mua qua Win-Win Back</h3><ol><li>Sao chép link sản phẩm từ sàn.</li><li>Đăng nhập Win-Win Back, dán link và kiểm tra mức hoàn hiển thị.</li><li>Mở link mua hàng được hệ thống tạo rồi hoàn tất đơn trên sàn.</li><li>Theo dõi trạng thái đơn và tiền hoàn trong tài khoản.</li></ol>");
    }
    if (index === 4) {
      const label = escapeHtml(productLabel(fact.name));
      parts.push(`<h3>${label} mua ở đâu?</h3><p>Sản phẩm được ghi nhận trên ${escapeHtml(fact.platform)}. Kiểm tra tên shop và thông tin sản phẩm trước khi đặt hàng.</p>`);
      parts.push(`<h3>${label} có được hoàn tiền không?</h3><p>Hãy kiểm tra link trên Win-Win Back để biết điều kiện và mức hoàn dự kiến. Khoản hoàn được xác nhận sau khi đơn đủ điều kiện và sàn đối soát xong.</p>`);
    }
  });
  return parts.join("\n");
}
