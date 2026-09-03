import {
  pgTable,
  text,
  timestamp,
  bigint,
  integer,
  boolean,
  uuid,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const userRole = pgEnum("user_role", ["user", "admin"]);
export const platform = pgEnum("platform", ["shopee", "tiktok"]);

// Order lifecycle mirrors affiliate networks: an order is reported (pending),
// confirmed once the network validates it, then completed (payable) or
// cancelled/returned.
export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const walletTxType = pgEnum("wallet_tx_type", [
  "cashback", // credit from a completed order
  "withdrawal", // debit when a withdrawal is approved
  "refund", // credit back when a withdrawal is rejected
  "adjustment", // manual admin correction (+/-)
]);

export const withdrawalStatus = pgEnum("withdrawal_status", [
  "pending",
  "approved",
  "rejected",
  "paid",
]);

// ---------------------------------------------------------------------------
// Users & auth (Better Auth: user / session / account / verification)
// ---------------------------------------------------------------------------
//
// `users` doubles as Better Auth's `user` model (mapped in src/lib/auth.ts) and
// as our business profile (role, balance). Auth-managed columns: emailVerified,
// image, updatedAt. App columns: role, balance.

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRole("role").notNull().default("user"),
  // Cached wallet balance in VND, kept in sync with wallet_transactions.
  balance: bigint("balance", { mode: "number" }).notNull().default(0),
  // Email notification preferences (gate the transactional emails in notify.ts).
  notifyOrders: boolean("notify_orders").notNull().default(true),
  notifyCashback: boolean("notify_cashback").notNull().default(true),
  notifySystemEmail: boolean("notify_system_email").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    // Better Auth 1.7: account identity is scoped by issuer.
    issuer: text("issuer").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("accounts_issuer_account_id_idx").on(t.issuer, t.accountId)],
);

export const verifications = pgTable("verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Affiliate links
// ---------------------------------------------------------------------------

export const affiliateLinks = pgTable(
  "affiliate_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: platform("platform").notNull(),
    originalUrl: text("original_url").notNull(),
    affiliateUrl: text("affiliate_url").notNull(),
    // Short code used in /go/<code> to track clicks then redirect.
    shortCode: text("short_code").notNull().unique(),
    title: text("title"),
    clicks: integer("clicks").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("affiliate_links_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Orders (each carries the network commission and the user's cashback)
// ---------------------------------------------------------------------------

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    linkId: uuid("link_id").references(() => affiliateLinks.id, {
      onDelete: "set null",
    }),
    platform: platform("platform").notNull(),
    // External id from the affiliate network / marketplace (dedup key).
    externalOrderId: text("external_order_id").notNull().unique(),
    productName: text("product_name").notNull(),
    orderAmount: bigint("order_amount", { mode: "number" }).notNull().default(0),
    commissionAmount: bigint("commission_amount", { mode: "number" })
      .notNull()
      .default(0),
    cashbackAmount: bigint("cashback_amount", { mode: "number" })
      .notNull()
      .default(0),
    status: orderStatus("status").notNull().default("pending"),
    // Internal moderation note / feedback captured by an admin during review.
    adminNote: text("admin_note"),
    // Set once cashback has been credited to the wallet (idempotency guard).
    cashbackCreditedAt: timestamp("cashback_credited_at", {
      withTimezone: true,
    }),
    orderedAt: timestamp("ordered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("orders_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Wallet ledger
// ---------------------------------------------------------------------------

export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: walletTxType("type").notNull(),
    // Signed amount in VND: positive = credit, negative = debit.
    amount: bigint("amount", { mode: "number" }).notNull(),
    balanceAfter: bigint("balance_after", { mode: "number" }).notNull(),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("wallet_tx_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Withdrawals
// ---------------------------------------------------------------------------

export const withdrawals = pgTable(
  "withdrawals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: bigint("amount", { mode: "number" }).notNull(),
    status: withdrawalStatus("status").notNull().default("pending"),
    bankName: text("bank_name").notNull(),
    bankAccount: text("bank_account").notNull(),
    accountHolder: text("account_holder").notNull(),
    note: text("note"),
    requestedAt: timestamp("requested_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (t) => [index("withdrawals_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Integration tokens (OAuth credentials for affiliate providers)
// ---------------------------------------------------------------------------
//
// One row per provider (e.g. "tiktok"). Holds the single business-owned
// affiliate-creator OAuth token used to sign generate-link / order calls.

export const integrationTokens = pgTable("integration_tokens", {
  // Provider key, e.g. "tiktok". One connected account per provider.
  provider: text("provider").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }).notNull(),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  // TikTok identity fields from the token response.
  openId: text("open_id"),
  userType: integer("user_type"),
  sellerName: text("seller_name"),
  // JSON-encoded string[] of granted scope keys.
  grantedScopes: text("granted_scopes"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type IntegrationToken = typeof integrationTokens.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
