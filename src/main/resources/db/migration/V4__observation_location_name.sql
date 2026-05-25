alter table observation_records
    add column location_name varchar(120) not null default '현재 위치';
