-- Custom SQL migration file, put your code below! --

CREATE OR REPLACE FUNCTION api.delete_organization_group(
    p_org_class_id VARCHAR(21),
    p_group_id uuid
)
    RETURNS VOID AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_user_id         uuid := auth.jwt() ->> 'sub';
    v_in_group        BOOLEAN;
    v_group_name_path TEXT;
    v_has_permission  BOOLEAN;
    v_group_class_id  VARCHAR(21);
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

    SELECT has, class_id
    FROM api.check_class_permission_by_name_path(v_group_name_path, 'delete')
    INTO v_has_permission, v_group_class_id;

    IF NOT (v_in_group OR v_has_permission) THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to access this group members',
            HINT = 'Check your permissions.';
    END IF;

    DELETE
    FROM dbo.classes
    WHERE id = v_group_class_id;

    DELETE
    FROM dbo.organization_groups
    WHERE group_id = p_group_id;

    DELETE
    FROM auth.groups
    WHERE id = p_group_id;
END;
$$ LANGUAGE plpgsql VOLATILE
                    SECURITY DEFINER;