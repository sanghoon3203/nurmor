create table habitat_cells (
    id uuid primary key,
    cell_key varchar(80) not null unique,
    center_lat double precision not null,
    center_lng double precision not null,
    bloom_state varchar(24) not null,
    bloom_score integer not null,
    observation_count integer not null,
    species_count integer not null,
    contributor_count integer not null,
    updated_at timestamp with time zone not null
);

create table media_assets (
    id uuid primary key,
    user_id uuid not null,
    type varchar(16) not null,
    storage_key varchar(300) not null,
    mime_type varchar(120) not null,
    size_bytes bigint not null,
    checksum varchar(128) not null,
    created_at timestamp with time zone not null
);

create table observation_records (
    id uuid primary key,
    user_id uuid not null,
    habitat_cell_id uuid not null,
    exact_lat double precision not null,
    exact_lng double precision not null,
    public_lat double precision not null,
    public_lng double precision not null,
    location_accuracy_meters double precision not null,
    media_asset_ids_csv varchar(500) not null,
    status varchar(24) not null,
    visibility varchar(16) not null,
    selected_species_candidate_id uuid,
    captured_at timestamp with time zone not null,
    created_at timestamp with time zone not null
);

create table analysis_jobs (
    id uuid primary key,
    observation_record_id uuid not null,
    model varchar(80) not null,
    status varchar(24) not null,
    prompt_version varchar(40) not null,
    error_message varchar(2000),
    created_at timestamp with time zone not null,
    completed_at timestamp with time zone
);

create table species_candidates (
    id uuid primary key,
    analysis_job_id uuid not null,
    common_name_ko varchar(120) not null,
    scientific_name varchar(160),
    confidence double precision not null,
    evidence varchar(2000) not null
);

create table codex_entries (
    id uuid primary key,
    habitat_cell_id uuid not null,
    species_key varchar(180) not null,
    display_name varchar(120) not null,
    scientific_name varchar(160),
    observation_count integer not null,
    best_confidence double precision not null,
    first_observed_at timestamp with time zone not null,
    last_observed_at timestamp with time zone not null
);

create index idx_analysis_jobs_observation_created
    on analysis_jobs (observation_record_id, created_at desc);

create index idx_species_candidates_analysis_job
    on species_candidates (analysis_job_id);

create index idx_observation_records_cell_status
    on observation_records (habitat_cell_id, status);

create unique index ux_codex_entries_cell_species
    on codex_entries (habitat_cell_id, species_key);

create index idx_codex_entries_cell_last_observed
    on codex_entries (habitat_cell_id, last_observed_at desc);
