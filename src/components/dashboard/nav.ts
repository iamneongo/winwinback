import {
  Home,
  ShoppingBag,
  Wallet,
  Settings,
  LayoutDashboard,
  Plug,
  Store,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  /** Shorter label for the compact mobile dock; falls back to `label`. */
  short?: string;
  exact?: boolean;
};

/** Customer dashboard navigation. */
export const customerNav: NavItem[] = [
  { href: "/dashboard", icon: Home, label: "Tổng quan", exact: true },
  { href: "/dashboard/don-hang", icon: ShoppingBag, label: "Đơn hàng của tôi", short: "Đơn hàng" },
  { href: "/dashboard/vi", icon: Wallet, label: "Ví hoàn tiền", short: "Ví" },
  { href: "/dashboard/tai-khoan", icon: Settings, label: "Cài đặt" },
];

/** Admin navigation. */
export const adminNav: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Tổng quan", exact: true },
  { href: "/admin/integrations", icon: Plug, label: "Kết nối sàn", short: "Kết nối" },
];

/** Cross-links between the two shells. */
export const customerAdminLink: NavItem = {
  href: "/admin",
  icon: ShieldCheck,
  label: "Quản trị",
};
export const adminCustomerLink: NavItem = {
  href: "/dashboard",
  icon: Store,
  label: "Trang khách hàng",
  short: "Khách hàng",
};
