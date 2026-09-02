"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

/**
 * Client sign-out trigger. Reuses the existing button markup/styling anywhere
 * (header, sidebar, dock) and clears the Better Auth session.
 */
export function SignOutButton({
  className,
  children,
  "aria-label": ariaLabel,
}: {
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={className}
      onClick={async () => {
        await signOut();
        router.push("/login");
      }}
    >
      {children}
    </button>
  );
}
