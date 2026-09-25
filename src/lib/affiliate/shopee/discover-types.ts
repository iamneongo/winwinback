export type ShopeeCampaign = {
  name: string;
  commissionRate: number | null;
  image: string | null;
  link: string;
  startTime: number | null;
  endTime: number | null;
};

export type ShopeeOfferProduct = {
  itemId: string;
  name: string;
  link: string;
  image: string | null;
  commissionRate: number | null;
  price: number | null;
  priceMin: number | null;
  priceMax: number | null;
  sales: number | null;
  rating: number | null;
  shopId: string | null;
  shopName: string | null;
  startTime: number | null;
  endTime: number | null;
};

export type ShopeeDiscoverResponse = {
  campaigns: ShopeeCampaign[];
  products: ShopeeOfferProduct[];
  dataSource: "api" | "db" | "unknown";
};
