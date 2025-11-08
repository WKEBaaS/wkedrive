-- Custom SQL migration file, put your code below! --

-- role is only for frontend display purposes, not for permission control
ALTER TABLE dbo.user_organizations
    ADD COLUMN "role" TEXT NOT NULL DEFAULT 'Member';

CREATE FUNCTION create_organization(name TEXT, description TEXT) RETURNS VOID
    LANGUAGE plpgsql
AS
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

    INSERT INTO dbo.user_organizations (user_id, organization_class_id, role)
    VALUES (v_user_id, v_new_org_class_id, 'Owner');
END;
$$;

-- CREATE TABLE IF NOT EXISTS api.org_members_result
-- (
--     id        uuid NOT NULL,
--     name      TEXT,
--     email     TEXT,
--     rank      INTEGER,
--     joined_at timestamptz
-- );
alter table api.org_members_result
    add column if not exists "role" TEXT;

CREATE OR REPLACE FUNCTION api.get_organization_members(org_class_id VARCHAR(21)) RETURNS SETOF api.org_members_result
AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
BEGIN
    IF NOT api.in_organization(org_class_id) OR NOT api.check_class_permission(org_class_id, 'read-class') THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to access this organization',
            HINT = 'Check your permissions.';
    END IF;

    RETURN QUERY SELECT u.id, u.name::TEXT, u.email::TEXT, uo.rank, uo.joined_at, uo."role"
                 FROM dbo.user_organizations uo
                          JOIN auth.users u ON uo.user_id = u.id
                 WHERE uo.organization_class_id = org_class_id
                 ORDER BY uo.rank;
END
$$ LANGUAGE plpgsql STABLE;
