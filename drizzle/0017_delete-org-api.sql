-- Custom SQL migration file, put your code below! --

CREATE OR REPLACE FUNCTION api.delete_organization(
    p_org_class_id VARCHAR(21)
)
    RETURNS VOID AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
BEGIN
    IF NOT api.check_class_permission(p_org_class_id, 'delete') THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to delete this organization',
            HINT = 'Check your permissions.';
    END IF;

    DELETE
    FROM dbo.user_organizations
    WHERE organization_class_id = p_org_class_id;

    DELETE
    FROM dbo.organization_groups
    WHERE organization_class_id = p_org_class_id;

    DELETE
    FROM dbo.organization_invitations
    WHERE organization_class_id = p_org_class_id;

    PERFORM dbo.fn_delete_class(p_org_class_id, TRUE);
END
$$ LANGUAGE plpgsql VOLATILE
                    SECURITY DEFINER;