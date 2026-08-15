-- Uptime schema
-- Applied to the project as migration `uptime_node_valuations`. Kept here so the shape of
-- the database is reviewable in the repo rather than only in a dashboard.
--
-- Design invariants:
--   * Writes go through the service role key, which bypasses RLS. There is deliberately no
--     anon INSERT policy on any table. A forged valuation row would break the one property
--     this project is built around.
--   * Nodes and valuations are publicly readable, because that IS the integrity claim:
--     anyone can fetch the earnings history behind a sourceHash, or the reasoning behind a
--     verdictHash, and re-derive both themselves.

-- ---------------------------------------------------------------------------
-- uptime_nodes
-- One row per node put in front of the panel, keyed by the keccak256 of its
-- canonical revenue history. The same observations hashed twice are one node.
-- No operator wallet is stored here: it is already on chain via listNode, and
-- leaving it out lets the whole row be public so sourceHash stays checkable.
-- ---------------------------------------------------------------------------
create table if not exists uptime_nodes (
    id             uuid primary key default gen_random_uuid(),
    source_hash    text not null,
    payout_address text not null,
    chain          text not null,
    chain_id       integer,
    -- false means the history was attested by the operator rather than read from a chain.
    -- An attested history is a claim, not a record, and the column keeps that distinction
    -- visible instead of letting it quietly disappear into the valuation.
    verifiable     boolean not null default false,
    network        text,
    hardware       text,
    term_months    integer not null,
    shares_total   integer not null,
    -- The exact RevenueHistory object that was hashed into source_hash.
    history        jsonb not null,
    created_at     timestamptz not null default now(),

    constraint uptime_nodes_source_hash_unique unique (source_hash)
);

alter table uptime_nodes enable row level security;

create policy "nodes are publicly readable"
    on uptime_nodes for select using (true);

-- ---------------------------------------------------------------------------
-- uptime_valuations
-- The full argument behind each priced node. canonical_json holds the exact
-- bytes that were hashed, so anyone can re-derive verdict_hash and confirm the
-- reasoning was not rewritten after shares were sold.
-- ---------------------------------------------------------------------------
create table if not exists uptime_valuations (
    id                     uuid primary key default gen_random_uuid(),
    node_id                uuid references uptime_nodes(id) on delete set null,
    source_hash            text,
    profile                jsonb not null,
    operator_case          jsonb not null,
    investor_case          jsonb not null,
    arbiter                jsonb not null,
    canonical_json         text not null,
    verdict_hash           text not null,
    price_rate             numeric,
    price_per_share        numeric,
    projected_term_revenue numeric,
    confidence             integer,
    spread                 numeric,
    -- True when the operator's advocate came in below the investor, meaning it argued
    -- against its own client. Stored rather than derived so a broken debate stays visible
    -- in the record even if the cases are read separately.
    inverted               boolean not null default false,
    created_at             timestamptz not null default now(),

    constraint uptime_valuations_verdict_hash_unique unique (verdict_hash)
);

alter table uptime_valuations enable row level security;

create policy "valuations are publicly readable"
    on uptime_valuations for select using (true);

-- ---------------------------------------------------------------------------
-- uptime_listings
-- What actually reached the chain. Everything here is public on chain anyway.
-- ---------------------------------------------------------------------------
create table if not exists uptime_listings (
    id            uuid primary key default gen_random_uuid(),
    valuation_id  uuid references uptime_valuations(id) on delete set null,
    node_token_id bigint,
    chain_id      integer not null,
    contract      text not null,
    list_tx       text,
    valuation_tx  text,
    created_at    timestamptz not null default now()
);

alter table uptime_listings enable row level security;

create policy "listings are publicly readable"
    on uptime_listings for select using (true);

create index if not exists uptime_valuations_verdict_hash_idx on uptime_valuations (verdict_hash);
create index if not exists uptime_valuations_created_at_idx on uptime_valuations (created_at desc);
create index if not exists uptime_nodes_payout_address_idx on uptime_nodes (payout_address);
create index if not exists uptime_listings_token_idx on uptime_listings (chain_id, node_token_id);
