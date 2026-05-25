alter table habitat_cells
    add column display_name varchar(120) not null default '';

alter table habitat_cells
    add column description varchar(1000) not null default '';

alter table habitat_cells
    add column habitat_types_csv varchar(200) not null default 'URBAN_GREEN';

alter table habitat_cells
    add column boundary_geo_json varchar(4000);
