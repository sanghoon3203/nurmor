create table user_profiles (
    user_id uuid primary key,
    firebase_uid varchar(160) not null unique,
    email varchar(240),
    display_name varchar(80) not null,
    avatar_url varchar(500),
    public_contributor boolean not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

alter table codex_entries
    add column category varchar(24) not null default 'OTHER';

alter table codex_entries
    add column representative_media_key varchar(300);

alter table codex_entries
    add column discovery_number bigint not null default 0;

create index idx_user_profiles_firebase_uid
    on user_profiles (firebase_uid);

create index idx_observation_records_user_captured
    on observation_records (user_id, captured_at desc);

create index idx_observation_records_public_location
    on observation_records (status, public_lat, public_lng, captured_at desc);

create index idx_codex_entries_category_last_observed
    on codex_entries (category, last_observed_at desc);
