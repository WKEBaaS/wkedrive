-- Custom SQL migration file, put your code below! --

CREATE TABLE IF NOT EXISTS api.get_org_result
(
    class_id    VARCHAR(21) NOT NULL,
    name        TEXT,
    description TEXT,
    created_at  timestamptz,
    updated_at  timestamptz
);

CREATE OR REPLACE FUNCTION api.get_organization(org_class_id VARCHAR(21)) RETURNS SETOF api.get_org_result
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

    RETURN QUERY SELECT c.id, c.chinese_name::TEXT, c.chinese_description::TEXT, c.created_at, c.updated_at
                 FROM dbo.classes c
                 WHERE c.id = org_class_id;
END
$$ LANGUAGE plpgsql STABLE;