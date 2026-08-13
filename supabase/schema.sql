-- Tenor schema
-- Run once against your Supabase project (SQL editor or supabase db push).
--
-- Design invariants:
--   * Writes go through the service role key (bypasses RLS). There is deliberately no anon
--     INSERT policy on any table: a forged verdict row would break the one property this
--     project is built around.
--   * tenor_verdicts rows are publicly readable, because that is the entire integrity claim:
--     anyone can fetch the canonical reasoning behind a hash and rederive it themselves.
--   * Everything else is unreadable without the service role.

-- ---------------------------------------------------------------------------
-- tenor_documents
-- One row per uploaded file, keyed by the keccak256 of its bytes. The same
-- file uploaded twice is one document, not two identities.
-- ---------------------------------------------------------------------------
create table if not exists tenor_documents (
    id            uuid primary key default gen_random_uuid(),
    doc_hash      text not null,
    user_wallet   text,
    created_at    timestamptz not null default now(),

    constraint tenor_documents_doc_hash_unique unique (doc_hash)
);

alter table tenor_documents enable row level security;
-- No public read. Service role bypasses RLS for all writes.

-- ---------------------------------------------------------------------------
-- tenor_extractions
-- The structured fields the extraction agent pulled from each document.
-- One row per document (we upsert on document_id in the pipeline).
-- ---------------------------------------------------------------------------
create table if not exists tenor_extractions (
    id                uuid primary key default gen_random_uuid(),
    document_id       uuid references tenor_documents(id) on delete cascade,
    payload           jsonb not null,
    document_quality  integer,
    created_at        timestamptz not null default now()
);

alter table tenor_extractions enable row level security;
-- No public read.

-- ---------------------------------------------------------------------------
-- tenor_verdicts
-- The full reasoning trail for each priced receivable.
-- verdict_hash is keccak256(canonicalJson), written on chain at pricing time.
-- The canonical_json column stores the exact bytes that were hashed so anyone
-- can re-derive the hash and confirm nothing was rewritten.
-- ---------------------------------------------------------------------------
create table if not exists tenor_verdicts (
    id             uuid primary key default gen_random_uuid(),
    document_id    uuid references tenor_documents(id) on delete set null,
    extraction     jsonb not null,
    bull           jsonb not null,
    bear           jsonb not null,
    arbiter        jsonb not null,
    canonical_json text not null,
    verdict_hash   text not null,
    advance_value  bigint,
    spread         integer,
    inverted       boolean not null default false,
    created_at     timestamptz not null default now(),

    constraint tenor_verdicts_verdict_hash_unique unique (verdict_hash)
);

alter table tenor_verdicts enable row level security;

-- Public read: this is the self-service verification endpoint.
create policy "verdicts are publicly readable"
    on tenor_verdicts
    for select
    using (true);
