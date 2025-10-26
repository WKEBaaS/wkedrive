-- Custom SQL migration file, put your code below! --

--Removing the unique constraint to allow duplicate group names across different organizations.
ALTER TABLE auth.groups
    DROP CONSTRAINT uq_auth_group_name;

CREATE TABLE IF NOT EXISTS dbo.files
(
    id        uuid             NOT NULL,
    mime_type VARCHAR(255),
    size      BIGINT DEFAULT 0 NOT NULL,
    hash      VARCHAR(128),
    CONSTRAINT pk_dbo_files PRIMARY KEY (id),
    CONSTRAINT fk_dbo_files_id FOREIGN KEY (id) REFERENCES dbo.objects ON DELETE CASCADE
);

DO
$$
    DECLARE
        v_root_class_id        VARCHAR(21);
        v_org_class_id         VARCHAR(21);
        v_permissions_class_id VARCHAR(21);
    BEGIN
        SELECT id
        INTO v_root_class_id
        FROM dbo.classes
        WHERE name_path = '/';

        -- Insert 'Organizations' class and its subclasses
        SELECT id
        FROM dbo.fn_insert_class(
                v_root_class_id,
                NULL,
                '組織',
                NULL,
                'Organizations',
                NULL,
                NULL
             )
        INTO v_org_class_id;

        -- Insert 'Permissions' class and its subclasses
        SELECT id
        FROM dbo.fn_insert_class(
                v_root_class_id,
                NULL,
                '權限',
                NULL,
                'Permissions',
                NULL,
                NULL
             )
        INTO v_permissions_class_id;
        PERFORM dbo.fn_insert_class(
                v_permissions_class_id,
                NULL,
                '物件',
                NULL,
                'Objects',
                NULL,
                NULL
                );
    END
$$
