import { desc, eq } from "drizzle-orm";
import { Users, ShoppingBag, Clock3 } from "lucide-react";
import { db } from "@/db";
import { users, orders, withdrawals } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { WithdrawalControls } from "@/components/admin/WithdrawalControls";
import { cardClass, sectionTitleClass } from "@/components/dashboard/ui";
import { formatVnd } from "@/lib/config";
import {
  orderStatusLabel,
  platformLabel,
  withdrawalStatusLabel,
} from "@/lib/labels";

export const metadata = { title: "Quản trị — Win-Win Back" };
export const dynamic = "force-dynamic";

const ORDER_BADGE: Record<string, string> = {
  pending: "bg-[#fff5df] text-[#d88700]",
  confirmed: "bg-[#e7f7ef] text-[#168146]",
  completed: "bg-[#eaf2ff] text-[#287be5]",
  cancelled: "bg-[#fee9e8] text-[#d34843]",
};
const WITHDRAWAL_BADGE: Record<string, string> = {
  pending: "bg-[#fff5df] text-[#d88700]",
  approved: "bg-[#eaf2ff] text-[#287be5]",
  rejected: "bg-[#fee9e8] text-[#d34843]",
  paid: "bg-[#e7f7ef] text-[#168146]",
};

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Users;
  tone: string;
  label: string;
  value: string;
}) {
  return (
    <div className={`${cardClass} flex items-center gap-3`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon className="h-6 w-6" strokeWidth={2.2} />
      </span>
      <div>
        <p className="text-xs font-medium text-[#536f98]">{label}</p>
        <p className="mt-1 text-2xl font-black tracking-tight text-[#0d315d]">{value}</p>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={`${cardClass} overflow-hidden p-0`}>
      <h2 className={`${sectionTitleClass} border-b border-[#e8eef6] px-4 py-4 sm:px-5`}>
        {title}
      </h2>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

const thClass = "px-3 py-3 font-semibold";
const emptyClass = "py-8 text-center text-sm text-[#6681a7]";

export default async function AdminPage() {
  await requireAdmin();

  const [orderRows, wdRows, userRows] = await Promise.all([
    db
      .select({ order: orders, email: users.email })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(100),
    db
      .select({ w: withdrawals, email: users.email })
      .from(withdrawals)
      .innerJoin(users, eq(withdrawals.userId, users.id))
      .orderBy(desc(withdrawals.requestedAt))
      .limit(100),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        balance: users.balance,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100),
  ]);

  const pendingWithdrawals = wdRows.filter((r) => r.w.status === "pending").length;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e] sm:text-[30px]">
          Quản trị
        </h1>
        <p className="mt-1 text-sm text-[#58749a]">
          Quản lý đơn hàng, hoa hồng, yêu cầu rút tiền và khách hàng
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={Users} tone="bg-[#e8f1ff] text-[#287be5]" label="Khách hàng" value={String(userRows.length)} />
        <StatCard icon={ShoppingBag} tone="bg-[#e7f9df] text-[#33a91f]" label="Đơn hàng" value={String(orderRows.length)} />
        <StatCard icon={Clock3} tone="bg-[#fff1d9] text-[#e99a10]" label="Rút tiền chờ xử lý" value={String(pendingWithdrawals)} />
      </div>

      <div className="mt-5 space-y-5">
        <Panel title="Yêu cầu rút tiền">
          {wdRows.length === 0 ? (
            <p className={emptyClass}>Chưa có yêu cầu nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#f7faff] text-xs text-[#536f98]">
                  <tr>
                    <th className={thClass}>Khách</th>
                    <th className={thClass}>Số tiền</th>
                    <th className={thClass}>Ngân hàng</th>
                    <th className={thClass}>Trạng thái</th>
                    <th className={thClass}>Xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1f7]">
                  {wdRows.map(({ w, email }) => (
                    <tr key={w.id} className="text-[#49688f]">
                      <td className="px-3 py-3">{email}</td>
                      <td className="px-3 py-3 font-bold text-[#173861]">{formatVnd(w.amount)}</td>
                      <td className="px-3 py-3 text-[#58759c]">{w.bankName} · {w.bankAccount} · {w.accountHolder}</td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${WITHDRAWAL_BADGE[w.status]}`}>{withdrawalStatusLabel[w.status]}</span></td>
                      <td className="px-3 py-3"><WithdrawalControls withdrawalId={w.id} status={w.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Đơn hàng & hoa hồng">
          {orderRows.length === 0 ? (
            <p className={emptyClass}>Chưa có đơn hàng nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f7faff] text-xs text-[#536f98]">
                  <tr>
                    <th className={thClass}>Khách</th>
                    <th className={thClass}>Sản phẩm</th>
                    <th className={thClass}>Sàn</th>
                    <th className={thClass}>Hoa hồng</th>
                    <th className={thClass}>Hoàn tiền</th>
                    <th className={thClass}>Trạng thái</th>
                    <th className={thClass}>Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1f7]">
                  {orderRows.map(({ order, email }) => (
                    <tr key={order.id} className="text-[#49688f]">
                      <td className="px-3 py-3">{email}</td>
                      <td className="px-3 py-3 text-[#244a7c]">{order.productName}</td>
                      <td className="px-3 py-3">{platformLabel[order.platform]}</td>
                      <td className="px-3 py-3">{formatVnd(order.commissionAmount)}</td>
                      <td className="px-3 py-3 font-bold text-[#168146]">{formatVnd(order.cashbackAmount)}</td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_BADGE[order.status]}`}>{orderStatusLabel[order.status]}</span></td>
                      <td className="px-3 py-3"><OrderStatusControl orderId={order.id} status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Khách hàng">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-[#f7faff] text-xs text-[#536f98]">
                <tr>
                  <th className={thClass}>Tên</th>
                  <th className={thClass}>Email</th>
                  <th className={thClass}>Vai trò</th>
                  <th className={thClass}>Số dư ví</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1f7]">
                {userRows.map((u) => (
                  <tr key={u.id} className="text-[#49688f]">
                    <td className="px-3 py-3 text-[#244a7c]">{u.name}</td>
                    <td className="px-3 py-3">{u.email}</td>
                    <td className="px-3 py-3">{u.role === "admin" ? "Quản trị" : "Khách"}</td>
                    <td className="px-3 py-3 font-bold text-[#168146]">{formatVnd(u.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </main>
  );
}
