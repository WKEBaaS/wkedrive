-- Custom SQL migration file, put your code below! --
DROP FUNCTION IF EXISTS api.get_organization(VARCHAR);
DROP FUNCTION IF EXISTS api.get_organizations();
DROP FUNCTION IF EXISTS api.get_organization_members(VARCHAR);
DROP FUNCTION IF EXISTS api.create_organization;
DROP TABLE IF EXISTS api.get_org_result;
DROP TABLE IF EXISTS api.get_orgs_result;
DROP TABLE IF EXISTS api.org_members_result;

CREATE OR REPLACE FUNCTION api.get_organization(p_org_class_id CHARACTER VARYING)
    RETURNS TABLE
            (
                class_id    VARCHAR(21),
                name        TEXT,
                description TEXT,
                created_at  TIMESTAMP WITH TIME ZONE,
                updated_at  TIMESTAMP WITH TIME ZONE
            )
    STABLE
    LANGUAGE plpgsql
AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
BEGIN
    IF NOT api.in_organization(p_org_class_id) THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to access this organization',
            HINT = 'Check your permissions.';
    END IF;

    RETURN QUERY SELECT c.id, c.chinese_name::TEXT, c.chinese_description::TEXT, c.created_at, c.updated_at
                 FROM dbo.classes c
                 WHERE c.id = p_org_class_id;
END
$$;

CREATE FUNCTION api.get_organizations()
    RETURNS TABLE
            (
                class_id    VARCHAR(21),
                name        TEXT,
                description TEXT,
                created_at  TIMESTAMP WITH TIME ZONE,
                updated_at  TIMESTAMP WITH TIME ZONE
            )
    STABLE
    LANGUAGE plpgsql
AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_root_class_id VARCHAR(21);
BEGIN
    SELECT id
    FROM dbo.classes
    WHERE name_path = '/組織'
    INTO v_root_class_id;

    RETURN QUERY SELECT c.id, c.chinese_name::TEXT, c.chinese_description::TEXT, c.created_at, c.updated_at
                 FROM dbo.inheritances i,
                      dbo.classes c
                 WHERE i.pcid = v_root_class_id
                   AND i.ccid = c.id
                   AND api.check_class_permission(c.id, 'read-class') = TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION api.get_organization_members(p_org_class_id CHARACTER VARYING)
    RETURNS TABLE
            (
                id        uuid,
                name      TEXT,
                email     TEXT,
                rank      INTEGER,
                joined_at TIMESTAMP WITH TIME ZONE,
                role      TEXT
            )
    STABLE
    LANGUAGE plpgsql
AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
BEGIN
    IF NOT api.in_organization(p_org_class_id) THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to access this organization',
            HINT = 'Check your permissions.';
    END IF;

    RETURN QUERY SELECT u.id, u.name::TEXT, u.email::TEXT, uo.rank, uo.joined_at, uo."role"
                 FROM dbo.user_organizations uo
                          JOIN auth.users u ON uo.user_id = u.id
                 WHERE uo.organization_class_id = p_org_class_id
                 ORDER BY uo.rank;
END
$$;

CREATE OR REPLACE FUNCTION api.create_organization(p_name TEXT, p_description TEXT) RETURNS VOID
    LANGUAGE plpgsql
AS
$$
DECLARE
    v_root_org_class_id VARCHAR(21);
    v_user_id           uuid := auth.jwt() ->> 'sub';
    v_new_org_class_id  VARCHAR(21);
BEGIN
    IF CURRENT_USER = 'anon' THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'Anonymous users cannot create organizations',
            HINT = 'Please log in to create an organization.';
    END IF;

    SELECT id
    INTO v_root_org_class_id
    FROM dbo.classes
    WHERE name_path = '/組織';

    SELECT id
    FROM dbo.fn_insert_class(
            v_root_org_class_id,
            NULL,
            p_name,
            p_description,
            p_name,
            p_description,
            v_user_id
         )
    INTO v_new_org_class_id
    ;

    -- full permissions for owner
    INSERT INTO dbo.permissions(class_id, role_type, role_id, permission_bits)
    VALUES (v_new_org_class_id, 'USER', v_user_id, 32767);

    PERFORM dbo.fn_insert_class(
            v_new_org_class_id,
            NULL,
            '群組',
            NULL,
            'Groups',
            NULL,
            v_user_id
            );
    PERFORM dbo.fn_insert_class(
            v_new_org_class_id,
            NULL,
            '成員',
            NULL,
            'Members',
            NULL,
            v_user_id
            );
    PERFORM dbo.fn_insert_class(
            v_new_org_class_id,
            NULL,
            'S3',
            NULL,
            'S3',
            NULL,
            v_user_id
            );

    INSERT INTO dbo.user_organizations (user_id, organization_class_id, role)
    VALUES (v_user_id, v_new_org_class_id, 'Owner');
END;
$$;
