/** A small, cross-marketplace taxonomy for AI-generated product articles. */
export const ARTICLE_CATEGORIES = [
  "Mẹ & bé",
  "Làm đẹp & sức khỏe",
  "Điện tử & công nghệ",
  "Thời trang & phụ kiện",
  "Nhà cửa & đời sống",
  "Thực phẩm & đồ uống",
  "Thể thao & du lịch",
  "Sách & văn phòng phẩm",
  "Khác",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export const UNCATEGORIZED: ArticleCategory = "Khác";

const categoryKeywords: ReadonlyArray<{
  name: ArticleCategory;
  keywords: readonly string[];
}> = [
  { name: "Mẹ & bé", keywords: ["me & be", "me va be", "tre em", "baby", "mom & baby", "do choi"] },
  { name: "Làm đẹp & sức khỏe", keywords: ["lam dep", "my pham", "sac dep", "suc khoe", "cham soc da", "beauty", "health"] },
  { name: "Điện tử & công nghệ", keywords: ["dien thoai", "may tinh", "dien tu", "cong nghe", "camera", "am thanh", "phu kien dien thoai", "electronics"] },
  { name: "Thời trang & phụ kiện", keywords: ["thoi trang", "quan ao", "giay", "dep", "tui xach", "dong ho", "trang suc", "phu kien thoi trang", "fashion"] },
  { name: "Nhà cửa & đời sống", keywords: ["nha cua", "doi song", "gia dung", "noi that", "do dung nha", "nha bep", "bep", "home", "kitchen"] },
  { name: "Thực phẩm & đồ uống", keywords: ["thuc pham", "do uong", "bach hoa", "do an", "an vat", "banh", "food", "beverage", "snack"] },
  { name: "Thể thao & du lịch", keywords: ["the thao", "du lich", "ngoai troi", "fitness", "sport", "outdoor", "travel"] },
  { name: "Sách & văn phòng phẩm", keywords: ["sach", "van phong pham", "hoc tap", "stationery", "book"] },
];

function searchText(input: string): string {
  return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

/** Also maps legacy marketplace category strings without rewriting stored rows. */
export function normalizeArticleCategory(raw?: string | null): ArticleCategory {
  if (!raw?.trim()) return UNCATEGORIZED;
  if (ARTICLE_CATEGORIES.includes(raw.trim() as ArticleCategory)) return raw.trim() as ArticleCategory;
  const text = searchText(raw);
  return categoryKeywords.find(({ keywords }) => keywords.some((keyword) => text.includes(keyword)))?.name ?? UNCATEGORIZED;
}
