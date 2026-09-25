import {
  Home,
  ShoppingBag,
  Wallet,
  Settings,
  LayoutDashboard,
  BadgeDollarSign,
  UsersRound,
  Plug,
  Store,
  ShieldCheck,
  Banknote,
  Gift,
  Compass,
  ClipboardCheck,
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
  { href: "/dashboard/nhiem-vu", icon: Gift, label: "Nhiệm vụ nhận quà", short: "Nhiệm vụ" },
  { href: "/dashboard/kham-pha", icon: Compass, label: "Sàn sale", short: "Sàn sale" },
  { href: "/dashboard/tai-khoan", icon: Settings, label: "Cài đặt" },
];

/** Admin navigation. */
export const adminNav: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Tổng quan", exact: true },
  { href: "/admin/nguoi-dung", icon: UsersRound, label: "Quản lý người dùng", short: "Người dùng" },
  { href: "/admin/yeu-cau-hoan-tien", icon: BadgeDollarSign, label: "Yêu cầu hoàn tiền", short: "Yêu cầu" },
  { href: "/admin/rut-tien", icon: Banknote, label: "Yêu cầu rút tiền", short: "Rút tiền" },
  { href: "/admin/don-hang", icon: ShoppingBag, label: "Đơn hàng", short: "Đơn hàng" },
  { href: "/admin/nhiem-vu", icon: ClipboardCheck, label: "Duyệt nhiệm vụ", short: "Nhiệm vụ" },
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
