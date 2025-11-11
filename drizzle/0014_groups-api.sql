-- Custom SQL migration file, put your code below! --

ALTER TABLE auth.groups
    ADD CONSTRAINT uq_auth_group_name UNIQUE (name),
    ADD COLUMN IF NOT EXISTS display_name VARCHAR(255) NOT NULL DEFAULT '';

INSERT INTO dbo.permission_enum(name, bit)
VALUES ('org-manage-group-members', 128);


CREATE TABLE IF NOT EXISTS dbo.organization_groups
(
    organization_class_id VARCHAR(21) NOT NULL,
    group_id              uuid        NOT NULL,
    rank                  INTEGER     NOT NULL DEFAULT 0,
    CONSTRAINT pk_dbo_organization_groups PRIMARY KEY (organization_class_id, group_id),
    CONSTRAINT fk_dbo_organization_groups_organization_class FOREIGN KEY (organization_class_id) REFERENCES dbo.classes,
    CONSTRAINT fk_dbo_organization_groups_group FOREIGN KEY (group_id) REFERENCES auth.groups
);

CREATE OR REPLACE FUNCTION api.create_organization_group(
    p_org_class_id VARCHAR(21),
    p_group_name TEXT,
    p_group_description TEXT,
    p_init_user_ids uuid[] DEFAULT NULL
)
    RETURNS VOID AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_org_group_name_path TEXT;
    v_group_name          TEXT;
    v_has_permission      BOOLEAN;
    v_org_groups_class_id TEXT;
    v_new_group_id        uuid;
    v_user_id             uuid := auth.jwt() ->> 'sub';
    v_new_group_class_id  VARCHAR(21);
BEGIN
    SELECT FORMAT('/組織/%s/群組', chinese_name),
           FORMAT('%s@%s', p_group_name, chinese_name)
    INTO v_org_group_name_path, v_group_name
    FROM dbo.classes
    WHERE id = p_org_class_id;
    IF NOT found THEN
        RAISE SQLSTATE 'PT404' USING
            MESSAGE = 'Organization not found',
            HINT = 'Check the organization class ID.';
    END IF;

    SELECT class_id, has
    FROM
        api.check_class_permission_by_name_path(v_org_group_name_path, 'insert')
    INTO v_org_groups_class_id, v_has_permission;

    IF NOT v_has_permission THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to create group in this organization',
            HINT = 'Check your permissions.';
    END IF;

    INSERT INTO auth.groups(name, display_name, description)
    VALUES (v_group_name, p_group_name, p_group_description)
    RETURNING id
        INTO v_new_group_id;

    SELECT id
    INTO v_new_group_class_id
    FROM dbo.fn_insert_class(
            v_org_groups_class_id,
            NULL,
            p_group_name,
            p_group_description,
            NULL,
            NULL,
            v_user_id
         );

    INSERT INTO dbo.organization_groups(organization_class_id, group_id)
    VALUES (p_org_class_id, v_new_group_id);

    IF p_init_user_ids IS NOT NULL THEN
        INSERT INTO auth.user_groups(user_id, group_id)
        SELECT UNNEST(p_init_user_ids), v_new_group_id;
    END IF;
END;
$$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER;

COMMENT ON FUNCTION api.create_organization_group IS $$Create a new group within the specified organization.
Parameters:
- p_org_class_id: The class ID of the organization where the group will be created.
- p_group_name: The name of the new group.
- p_group_description: A description for the new group.
- p_init_user_ids: An optional array of user IDs to initialize the group with members.
$$;

CREATE OR REPLACE FUNCTION api.get_organization_groups(p_org_class_id VARCHAR(21))
    RETURNS TABLE
            (
                id           uuid,
                name         VARCHAR,
                display_name VARCHAR,
                description  TEXT,
                created_at   timestamptz,
                updated_at   timestamptz
            )
AS
$$
DECLARE
BEGIN
    IF NOT api.in_organization(p_org_class_id) THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to access this organization',
            HINT = 'Check your permissions.';
    END IF;

    RETURN QUERY
        SELECT g.id, g.name, g.display_name, g.description, g.created_at, g.updated_at
        FROM auth.groups g
                 JOIN dbo.organization_groups og ON g.id = og.group_id
        WHERE og.organization_class_id = p_org_class_id
        ORDER BY g.created_at;
END;
$$ LANGUAGE plpgsql STABLE
                    SECURITY DEFINER;

COMMENT ON FUNCTION api.get_organization_groups IS $$Retrieve all groups within the specified organization.
Parameters:
- p_org_class_id: The class ID of the organization whose groups are to be retrieved.
$$;

CREATE OR REPLACE FUNCTION api.add_members_to_group(
    p_org_class_id VARCHAR(21),
    p_group_id uuid,
    p_user_ids uuid[]
)
    RETURNS VOID AS
$$
DECLARE
    v_group_name_path TEXT;
    v_group_class_id  VARCHAR(21);
    v_has_permission  BOOLEAN;
BEGIN
    SELECT FORMAT('/組織/%s/群組/%s', chinese_name, g.display_name)
    INTO v_group_name_path
    FROM dbo.classes c
             JOIN auth.groups g ON g.id = p_group_id
    WHERE c.id = p_org_class_id;

    SELECT class_id, has
    FROM api.check_class_permission_by_name_path(v_group_name_path, 'org-manage-group-members')
    INTO v_group_class_id, v_has_permission;
    IF NOT v_has_permission THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to manage group members in this organization',
            HINT = 'Check your permissions.';
    END IF;

    INSERT INTO auth.user_groups(user_id, group_id)
    SELECT UNNEST(p_user_ids), p_group_id
    ON CONFLICT DO NOTHING;
END
$$ LANGUAGE plpgsql VOLATILE
                    SECURITY DEFINER;

COMMENT ON FUNCTION api.add_members_to_group IS $$Add users to a specified group within an organization.
Parameters:
- p_org_class_id: The class ID of the organization.
- p_group_id: The ID of the group to which users will be added.
- p_user_ids: An array of user IDs to be added to the group.
$$;

CREATE OR REPLACE FUNCTION api.remove_members_from_group(
    p_org_class_id VARCHAR(21),
    p_group_id uuid,
    p_user_ids uuid[]
)
    RETURNS VOID AS
$$
DECLARE
    v_group_name_path TEXT;
    v_group_class_id  VARCHAR(21);
    v_has_permission  BOOLEAN;
BEGIN
    SELECT FORMAT('/組織/%s/群組/%s', chinese_name, g.display_name)
    INTO v_group_name_path
    FROM dbo.classes c
             JOIN auth.groups g ON g.id = p_group_id
    WHERE c.id = p_org_class_id;
    SELECT class_id, has
    FROM api.check_class_permission_by_name_path(v_group_name_path, 'org-manage-group-members')
    INTO v_group_class_id, v_has_permission;
    IF NOT v_has_permission THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to manage group members in this organization',
            HINT = 'Check your permissions.';
    END IF;
    DELETE
    FROM auth.user_groups
    WHERE group_id = p_group_id
      AND user_id = ANY (p_user_ids);
END
$$ LANGUAGE plpgsql VOLATILE
                    SECURITY DEFINER;
COMMENT ON FUNCTION api.remove_members_from_group IS $$Remove users from a specified group within an organization.
Parameters:
- p_org_class_id: The class ID of the organization.
- p_group_id: The ID of the group from which users will be removed.
- p_user_ids: An array of user IDs to be removed from the group.
$$;

CREATE OR REPLACE FUNCTION api.get_organization_group_members(p_org_class_id VARCHAR(21), p_group_id uuid)
    RETURNS TABLE
            (
                id        uuid,
                name      TEXT,
                email     TEXT,
                rank      INTEGER,
                joined_at TIMESTAMP WITH TIME ZONE
            )
AS
$$
DECLARE
    v_user_id         uuid := auth.jwt() ->> 'sub';
    v_in_group        BOOLEAN;
    v_group_name_path TEXT;
    v_has_permission  BOOLEAN;
BEGIN
    SELECT COUNT(*) > 1
    INTO v_in_group
    FROM auth.user_groups
    WHERE user_id = v_user_id
      AND group_id = p_group_id;

    SELECT FORMAT('/組織/%s/群組/%s', chinese_name, g.display_name)
    INTO v_group_name_path
    FROM dbo.classes c
             JOIN auth.groups g ON g.id = p_group_id
    WHERE c.id = p_org_class_id;

    SELECT has
    FROM api.check_class_permission_by_name_path(v_group_name_path, 'read-class')
    INTO v_has_permission;

    IF NOT (v_in_group OR v_has_permission) THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to access this group members',
            HINT = 'Check your permissions.';
    END IF;

    RETURN QUERY SELECT u.id,
                        u.name::TEXT,
                        u.email::TEXT,
                        ug.rank::INTEGER           AS rank,
                        ug.created_at::timestamptz AS joined_at
                 FROM auth.user_groups ug
                          JOIN auth.users u ON ug.user_id = u.id
                 WHERE ug.group_id = p_group_id
                 ORDER BY u.name;
END;
$$ LANGUAGE plpgsql STABLE
                    SECURITY DEFINER;
COMMENT ON FUNCTION api.get_organization_group_members IS $$Retrieve members of a specified group within an organization.
Parameters:
- p_org_class_id: The class ID of the organization.
- p_group_id: The ID of the group whose members are to be retrieved.
$$;