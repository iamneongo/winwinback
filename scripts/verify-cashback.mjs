import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

const q = (sql, params = []) => pool.query(sql, params).then((r) => r.rows);

function hr(t) {
  console.log("\n==================== " + t + " ====================");
}

try {
  hr("DB identity");
  console.log(await q("select current_database() as db, now() as server_now"));

  hr("Row counts");
  console.log(
    await q(`select
      (select count(*) from users) as users,
      (select count(*) from affiliate_links) as links,
      (select count(*) from link_clicks) as clicks,
      (select count(*) from orders) as orders,
      (select count(*) from wallet_transactions) as wallet_tx,
      (select count(*) from withdrawals) as withdrawals`),
  );

  hr("Orders by platform + status (ALL TIME)");
  console.log(
    await q(`select platform, status, count(*) n,
      sum(order_amount) order_amt, sum(commission_amount) comm, sum(cashback_amount) cb,
      count(cashback_credited_at) credited
      from orders group by platform, status order by platform, status`),
  );

  hr("Latest 15 affiliate_links");
  console.log(
    await q(`select left(id::text,8) id, left(user_id::text,8) uid, platform, short_code,
      product_id, clicks, left(coalesce(title,''),28) title,
      left(affiliate_url,60) aff_url, created_at
      from affiliate_links order by created_at desc limit 15`),
  );

  hr("Latest 20 link_clicks");
  console.log(
    await q(`select left(id::text,8) id, left(user_id::text,8) uid, platform, product_id,
      (attributed_order_id is not null) attributed, clicked_at
      from link_clicks order by clicked_at desc limit 20`),
  );

  hr("Latest 20 orders");
  console.log(
    await q(`select left(id::text,8) id, left(user_id::text,8) uid, platform, external_order_id,
      left(product_name,22) product, order_amount amt, commission_amount comm,
      cashback_amount cb, status, tiktok_verified_status tvs,
      (cashback_credited_at is not null) credited, ordered_at, created_at
      from orders order by created_at desc limit 20`),
  );

  hr("Clicks in last 48h that are NOT attributed to any order");
  console.log(
    await q(`select left(lc.id::text,8) id, left(lc.user_id::text,8) uid, lc.platform,
      lc.product_id, lc.clicked_at
      from link_clicks lc
      where lc.attributed_order_id is null and lc.clicked_at > now() - interval '48 hours'
      order by lc.clicked_at desc limit 30`),
  );

  hr("Integration tokens (TikTok connection health)");
  console.log(
    await q(`select provider, seller_name, open_id is not null has_openid,
      access_token_expires_at, (access_token_expires_at < now()) access_expired,
      refresh_token_expires_at, updated_at
      from integration_tokens`),
  );

  hr("Wallet tx by type");
  console.log(
    await q(`select type, count(*) n, sum(amount) total from wallet_transactions group by type`),
  );
} catch (e) {
  console.error("QUERY ERROR:", e.message);
} finally {
  await pool.end();
}
