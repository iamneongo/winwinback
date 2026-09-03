"use client";

import { useActionState } from "react";
import {
  BellOff,
  BellRing,
  MailCheck,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  adjustBalanceAction,
  resendVerificationAction,
  setUserRoleAction,
  toggleUserNotificationsAction,
} from "@/app/admin/users-actions";
import type { ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SubmitButton } from "@/components/forms/SubmitButton";

export interface UserRowActionsProps {
  userId: string;
  role: "user" | "admin";
  emailVerified: boolean;
  notificationsOn: boolean;
}

function RoleItem({ userId, role }: { userId: string; role: "user" | "admin" }) {
  const [, action] = useActionState<ActionState, FormData>(
    setUserRoleAction,
    undefined,
  );
  const nextRole = role === "admin" ? "user" : "admin";
  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={nextRole} />
      <DropdownMenuItem render={<button type="submit" className="w-full" />}>
        {role === "admin" ? (
          <UserRound className="size-4" />
        ) : (
          <ShieldCheck className="size-4" />
        )}
        {role === "admin" ? "Hạ xuống Người dùng" : "Nâng lên Quản trị"}
      </DropdownMenuItem>
    </form>
  );
}

function NotificationsItem({
  userId,
  notificationsOn,
}: {
  userId: string;
  notificationsOn: boolean;
}) {
  const [, action] = useActionState<ActionState, FormData>(
    toggleUserNotificationsAction,
    undefined,
  );
  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <input
        type="hidden"
        name="enabled"
        value={notificationsOn ? "false" : "true"}
      />
      <DropdownMenuItem render={<button type="submit" className="w-full" />}>
        {notificationsOn ? (
          <BellOff className="size-4" />
        ) : (
          <BellRing className="size-4" />
        )}
        {notificationsOn ? "Tắt thông báo" : "Bật thông báo"}
      </DropdownMenuItem>
    </form>
  );
}

function ResendItem({ userId }: { userId: string }) {
  const [, action] = useActionState<ActionState, FormData>(
    resendVerificationAction,
    undefined,
  );
  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <DropdownMenuItem render={<button type="submit" className="w-full" />}>
        <MailCheck className="size-4" />
        Gửi lại email xác thực
      </DropdownMenuItem>
    </form>
  );
}

function BalanceAdjustPopover({ userId }: { userId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    adjustBalanceAction,
    undefined,
  );
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] text-[#506a90]"
            aria-label="Điều chỉnh số dư"
          />
        }
      >
        <Wallet className="size-3.5" />
        Số dư
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-3">
        <form action={action} className="space-y-2.5">
          <input type="hidden" name="userId" value={userId} />
          <div>
            <p className="text-xs font-semibold text-[#35537c]">
              Điều chỉnh số dư ví
            </p>
            <p className="mt-0.5 text-[11px] text-[#7890b0]">
              Nhập số dương để cộng, số âm để trừ (VND).
            </p>
          </div>
          <Input
            name="amount"
            type="number"
            step="1"
            required
            placeholder="Ví dụ: 50000 hoặc -20000"
            className="h-9"
          />
          <Input
            name="note"
            type="text"
            maxLength={200}
            placeholder="Ghi chú (tuỳ chọn)"
            className="h-9"
          />
          <div className="flex items-center gap-2">
            <SubmitButton className="px-4 py-2 text-xs">Lưu</SubmitButton>
            {state?.error && (
              <span className="text-[11px] text-red-600">{state.error}</span>
            )}
            {state?.success && (
              <span className="text-[11px] font-medium text-[#2f7a1c]">
                {state.success}
              </span>
            )}
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export function UserRowActions({
  userId,
  role,
  emailVerified,
  notificationsOn,
}: UserRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <BalanceAdjustPopover userId={userId} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Hành động khác"
            />
          }
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <RoleItem userId={userId} role={role} />
          <NotificationsItem userId={userId} notificationsOn={notificationsOn} />
          {!emailVerified && (
            <>
              <DropdownMenuSeparator />
              <ResendItem userId={userId} />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
