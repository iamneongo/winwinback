import { MessageCircle, Megaphone, Users, Mail } from "lucide-react";
import { PolicyShell } from "@/components/policy/PolicyShell";

export const metadata = { title: "Liên hệ hỗ trợ — Win-Win Back" };

// Real channels sourced from the landing CommunitySection.
const channels = [
  {
    icon: MessageCircle,
    tone: "bg-[#e6f0ff] text-[#0068ff]",
    label: "Zalo cộng đồng",
    desc: "Nhận thông báo deal mới và hỗ trợ trực tiếp qua Zalo",
    href: "https://zalo.me/g/slradppiin66t4sbfzwg",
  },
  {
    icon: Megaphone,
    tone: "bg-[#e8f0fe] text-[#1877f2]",
    label: "Fanpage",
    desc: "Theo dõi cập nhật mới nhất về tính năng & khuyến mãi",
    href: "https://www.facebook.com/winwinbackvn/",
  },
  {
    icon: Users,
    tone: "bg-[#eafbe0] text-[#3f8a2e]",
    label: "Group cộng đồng",
    desc: "Chia sẻ deal hot, hỏi đáp về hoàn tiền cùng cộng đồng",
    href: "https://www.facebook.com/groups/vinhlongnhom/",
  },
];

const supportEmail = "support@winwinback.com";

export default function ContactPage() {
  return (
    <PolicyShell
      title="Liên hệ hỗ trợ"
      subtitle="Chọn kênh phù hợp để được hỗ trợ nhanh nhất."
    >
      {channels.map((c) => {
        const Icon = c.icon;
        const inner = (
          <div className="flex items-center gap-4 rounded-xl border border-[#e0eaf6] bg-white p-4 shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${c.tone}`}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <b className="block text-sm text-[#173861]">{c.label}</b>
              <p className="mt-0.5 text-xs text-[#6882a5]">{c.desc}</p>
            </div>
            <span className="text-xs font-semibold text-[#8298b6]">
              {c.href ? "Mở →" : "Sắp có"}
            </span>
          </div>
        );
        return c.href ? (
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer">
            {inner}
          </a>
        ) : (
          <div key={c.label}>{inner}</div>
        );
      })}

      <a
        href={`mailto:${supportEmail}`}
        className="flex items-center gap-4 rounded-xl border border-[#e0eaf6] bg-white p-4 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fff2df] text-[#ed9a0b]">
          <Mail className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <b className="block text-sm text-[#173861]">Email hỗ trợ</b>
          <p className="mt-0.5 text-xs text-[#6882a5]">{supportEmail}</p>
        </div>
        <span className="text-xs font-semibold text-[#8298b6]">Gửi email →</span>
      </a>
    </PolicyShell>
  );
}
