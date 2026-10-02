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
  "reward", // credit from completing a mission / quest
  "prize", // credit from winning a lucky-draw period
]);

// A lucky-draw period is opened by an admin with an explicit date window, then
// drawn (Vietlott-style on the last 4 digits of order ids) to pay out the fund.
export const luckyDrawStatus = pgEnum("lucky_draw_status", ["open", "drawn"]);

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
  // Referral: this user's own invite code + who invited them (app-level
  // attribution for the "mời bạn" missions; no FK to keep deletes simple).
  referralCode: text("referral_code").unique(),
  referredBy: uuid("referred_by"),
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
    // Marketplace product id resolved at creation (TikTok: starts with 17...).
    // The join key that lets us attribute an incoming affiliate order to the
    // user who generated the link for that product.
    productId: text("product_id"),
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
    // Result of the last live check against the TikTok affiliate-orders API:
    // "settled" | "pending" | "cancelled" | "not_found" | null (never checked).
    // Used to gate cashback approval so admins never pay out an order the
    // creator did not actually earn commission on.
    tiktokVerifiedStatus: text("tiktok_verified_status"),
    tiktokVerifiedAt: timestamp("tiktok_verified_at", { withTimezone: true }),
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
// Link clicks (attribution log)
// ---------------------------------------------------------------------------

// One row per /go/<code> visit. Attribution matches an incoming affiliate
// order to a click by (productId + time): the most recent unattributed click
// for that product, made before the order was created, wins the order.
export const linkClicks = pgTable(
  "link_clicks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    linkId: uuid("link_id")
      .notNull()
      .references(() => affiliateLinks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: platform("platform").notNull(),
    // Denormalised from the link so attribution can match by product cheaply.
    productId: text("product_id"),
    // Set once this click has been used to attribute an order (prevents a
    // single click being credited to more than one order).
    attributedOrderId: uuid("attributed_order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    clickedAt: timestamp("clicked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("link_clicks_product_idx").on(t.productId, t.clickedAt),
    index("link_clicks_link_idx").on(t.linkId),
  ],
);

// ---------------------------------------------------------------------------
// Notifications (in-app bell feed)
// ---------------------------------------------------------------------------
//
// One row per recipient. User events (cashback, withdrawal status) target the
// owning user; admin events (a new withdrawal request) are fanned out to one
// row per admin so read-state is tracked per admin. `type` drives the icon.

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // cashback | withdrawal | withdrawal_request | order | system
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    // Optional in-app destination the item links to.
    href: text("href"),
    // Null until the recipient has seen it.
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

// ---------------------------------------------------------------------------
// Mission claims (gamified rewards: "nhiệm vụ nhận quà")
// ---------------------------------------------------------------------------
//
// Missions themselves are defined in code (src/lib/missions/catalog.ts). One
// row here per (user, mission) once the user acts. Auto + referral missions go
// straight to "approved" (credited); manual/social missions start "submitted"
// (proof attached) and an admin moves them to "approved" or "rejected".

export const missionClaims = pgTable(
  "mission_claims",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Mission catalog key, e.g. "first_link" | "invite_5" | "share_social".
    missionKey: text("mission_key").notNull(),
    // submitted | approved | rejected
    status: text("status").notNull(),
    // VND credited on approval (snapshot of the catalog reward at claim time).
    reward: bigint("reward", { mode: "number" }).notNull().default(0),
    // Proof link/screenshot URL for manual (social) missions.
    proof: text("proof"),
    adminNote: text("admin_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("mission_claims_user_mission_idx").on(t.userId, t.missionKey),
  ],
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

// ---------------------------------------------------------------------------
// Lucky draw (quỹ rút thăm may mắn)
// ---------------------------------------------------------------------------
//
// 10% of every completed order's commission accrues into a single global fund
// (prizeFund). Each completed order also mints one ticket whose number is the
// last 4 digits of its external order id. An admin opens a period with an
// explicit [startAt, endAt] window and later draws it: a random 4-digit number
// is picked; exact matches split the whole fund, otherwise the nearest ticket
// takes 20% and the rest rolls over (it simply stays in the fund).

// Single-row global prize fund. Balance is the amount currently available to be
// won; unwon remainders naturally roll over because they stay here.
export const prizeFund = pgTable("prize_fund", {
  id: text("id").primaryKey().default("global"),
  balance: bigint("balance", { mode: "number" }).notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const luckyDrawPeriods = pgTable("lucky_draw_periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: luckyDrawStatus("status").notNull().default("open"),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  // Draw result — null until drawn.
  winningNumber: text("winning_number"),
  // Fund snapshot at draw time, and how much was actually paid to winners.
  potTotal: bigint("pot_total", { mode: "number" }).notNull().default(0),
  paidOut: bigint("paid_out", { mode: "number" }).notNull().default(0),
  // Whether the draw hit an exact 4-digit match (vs. nearest-ticket payout).
  exactMatch: boolean("exact_match"),
  drawnAt: timestamp("drawn_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const luckyDrawTickets = pgTable(
  "lucky_draw_tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // One ticket per order (unique) — minted when the order settles.
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" })
      .unique(),
    // Set when a draw consumes the ticket; null while it still awaits a draw.
    periodId: uuid("period_id").references(() => luckyDrawPeriods.id, {
      onDelete: "set null",
    }),
    // Last 4 digits of the order id, zero-padded (the lottery number).
    number: text("number").notNull(),
    isWinner: boolean("is_winner").notNull().default(false),
    prizeAmount: bigint("prize_amount", { mode: "number" })
      .notNull()
      .default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("lucky_draw_tickets_user_idx").on(t.userId),
    index("lucky_draw_tickets_period_idx").on(t.periodId),
    index("lucky_draw_tickets_created_idx").on(t.createdAt),
  ],
);

export type User = typeof users.$inferSelect;
export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type IntegrationToken = typeof integrationTokens.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type LinkClick = typeof linkClicks.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type MissionClaim = typeof missionClaims.$inferSelect;
export type PrizeFund = typeof prizeFund.$inferSelect;
export type LuckyDrawPeriod = typeof luckyDrawPeriods.$inferSelect;
export type LuckyDrawTicket = typeof luckyDrawTickets.$inferSelect;
