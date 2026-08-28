import { desc, eq } from "drizzle-orm";
import { ShoppingBag } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { PageHeader, Empty, cardClass } from "@/components/dashboard/ui";
import { formatVnd } from "@/lib/config";
import { orderStatusClass, orderStatusLabel, platformLabel } from "@/lib/labels";

export const metadata = { title: "Đơn hàng — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser();

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.orderedAt))
    .limit(100);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        icon={ShoppingBag}
        title="Đơn hàng & hoa hồng"
        hint="Đơn được đồng bộ từ TikTok Shop và ghi nhận hoàn tiền khi hoàn tất."
      />
      <div className={cardClass}>
        {orderRows.length === 0 ? (
          <Empty text="Chưa có đơn hàng nào được ghi nhận." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/45">
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4 font-medium">Sản phẩm</th>
                  <th className="py-2 pr-4 font-medium">Sàn</th>
                  <th className="py-2 pr-4 font-medium">Giá trị đơn</th>
                  <th className="py-2 pr-4 font-medium">Hoàn tiền</th>
                  <th className="py-2 pr-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orderRows.map((o) => (
                  <tr key={o.id} className="border-b border-white/5">
                    <td className="py-2.5 pr-4">{o.productName}</td>
                    <td className="py-2.5 pr-4 text-white/70">
                      {platformLabel[o.platform]}
                    </td>
                    <td className="py-2.5 pr-4 text-white/70">
                      {formatVnd(o.orderAmount)}
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-[#b7e961]">
                      {formatVnd(o.cashbackAmount)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs ${orderStatusClass[o.status]}`}
                      >
                        {orderStatusLabel[o.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
