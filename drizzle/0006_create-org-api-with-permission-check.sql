-- Custom SQL migration file, put your code below! --

CREATE OR REPLACE FUNCTION api.create_organization(
    name TEXT,
    description TEXT
) RETURNS VOID AS
$$
DECLARE
    v_root_org_class_id VARCHAR(21);
    v_user_id           uuid := auth.jwt() ->> 'sub';
    v_new_org_class_id  VARCHAR(21);
BEGIN
    SELECT id INTO v_root_org_class_id FROM dbo.classes WHERE name_path = '/組織';
    IF NOT api.check_class_permission(v_root_org_class_id, 'insert') THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to create organization',
            HINT = 'Check your permissions.';
    END IF;

    SELECT id
    FROM dbo.fn_insert_class(
            v_root_org_class_id,
            NULL,
            name,
            description,
            name,
            description,
            v_user_id
         )
    INTO v_new_org_class_id;

    PERFORM dbo.fn_insert_class(
            v_new_org_class_id,
            NULL,
            '群組',
            NULL,
            'Groups',
            NULL,
            NULL
            );
    PERFORM dbo.fn_insert_class(
            v_new_org_class_id,
            NULL,
            '成員',
            NULL,
            'Members',
            NULL,
            NULL
            );
    PERFORM dbo.fn_insert_class(
            v_new_org_class_id,
            NULL,
            'S3',
            NULL,
            'S3',
            NULL,
            NULL
            );
END;
$$ LANGUAGE plpgsql
    VOLATILE
