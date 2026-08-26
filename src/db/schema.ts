import {
  pgTable,
  text,
  timestamp,
  bigint,
  integer,
  uuid,
  pgEnum,
  index,
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
// Users & sessions
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRole("role").notNull().default("user"),
  // Cached wallet balance in VND, kept in sync with wallet_transactions.
  balance: bigint("balance", { mode: "number" }).notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // random token, stored in the cookie
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
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
