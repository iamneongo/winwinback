import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, orders, withdrawals } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { CreateOrderForm } from "@/components/admin/CreateOrderForm";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { WithdrawalControls } from "@/components/admin/WithdrawalControls";
import { formatVnd } from "@/lib/config";
import {
  orderStatusClass,
  orderStatusLabel,
  platformLabel,
  withdrawalStatusClass,
  withdrawalStatusLabel,
} from "@/lib/labels";

export const metadata = { title: "Quản trị — Win-Win Back" };
export const dynamic = "force-dynamic";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

export default async function AdminPage() {
  const admin = await requireAdmin();

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
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(100),
  ]);

  const pendingWithdrawals = wdRows.filter(
    (r) => r.w.status === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-[#082b4b] text-white">
      <AppHeader name={admin.name} role={admin.role} />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div className="flex justify-end">
          <Link
            href="/admin/integrations"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Kết nối sàn affiliate →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/70">Khách hàng</p>
            <p className="mt-1 text-2xl font-black text-white">
              {userRows.length}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/70">Đơn hàng</p>
            <p className="mt-1 text-2xl font-black text-white">
              {orderRows.length}
            </p>
          </div>
          <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6">
            <p className="text-sm text-white/70">Rút tiền chờ xử lý</p>
            <p className="mt-1 text-2xl font-black text-amber-200">
              {pendingWithdrawals}
            </p>
          </div>
        </div>

        <Card title="Thêm đơn hàng thủ công">
          <CreateOrderForm />
          <p className="mt-3 text-xs text-white/40">
            Mẹo: có thể tự động hoá bằng webhook POST /api/webhooks/affiliate
            (header x-webhook-secret).
          </p>
        </Card>

        <Card title="Yêu cầu rút tiền">
          {wdRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">
              Chưa có yêu cầu nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/50">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4">Khách</th>
                    <th className="py-2 pr-4">Số tiền</th>
                    <th className="py-2 pr-4">Ngân hàng</th>
                    <th className="py-2 pr-4">Trạng thái</th>
                    <th className="py-2 pr-4">Xử lý</th>
                  </tr>
                </thead>
                <tbody>
                  {wdRows.map(({ w, email }) => (
                    <tr key={w.id} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-white/70">{email}</td>
                      <td className="py-2 pr-4 font-semibold">
                        {formatVnd(w.amount)}
                      </td>
                      <td className="py-2 pr-4 text-white/60">
                        {w.bankName} · {w.bankAccount} · {w.accountHolder}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs ${withdrawalStatusClass[w.status]}`}
                        >
                          {withdrawalStatusLabel[w.status]}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <WithdrawalControls
                          withdrawalId={w.id}
                          status={w.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Đơn hàng & hoa hồng">
          {orderRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/40">
              Chưa có đơn hàng nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/50">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4">Khách</th>
                    <th className="py-2 pr-4">Sản phẩm</th>
                    <th className="py-2 pr-4">Sàn</th>
                    <th className="py-2 pr-4">Hoa hồng</th>
                    <th className="py-2 pr-4">Hoàn tiền</th>
                    <th className="py-2 pr-4">Trạng thái</th>
                    <th className="py-2 pr-4">Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map(({ order, email }) => (
                    <tr key={order.id} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-white/70">{email}</td>
                      <td className="py-2 pr-4">{order.productName}</td>
                      <td className="py-2 pr-4">
                        {platformLabel[order.platform]}
                      </td>
                      <td className="py-2 pr-4">
                        {formatVnd(order.commissionAmount)}
                      </td>
                      <td className="py-2 pr-4 font-semibold text-[#b7e961]">
                        {formatVnd(order.cashbackAmount)}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs ${orderStatusClass[order.status]}`}
                        >
                          {orderStatusLabel[order.status]}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <OrderStatusControl
                          orderId={order.id}
                          status={order.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Khách hàng">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/50">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4">Tên</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Vai trò</th>
                  <th className="py-2 pr-4">Số dư ví</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((u) => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4 text-white/70">{u.email}</td>
                    <td className="py-2 pr-4">
                      {u.role === "admin" ? "Quản trị" : "Khách"}
                    </td>
                    <td className="py-2 pr-4 font-semibold text-[#b7e961]">
                      {formatVnd(u.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
