-- Custom SQL migration file, put your code below! --

GRANT ALL ON TABLE dbo.user_organizations TO authenticated;
GRANT ALL ON TABLE auth.users TO authenticated;

ALTER TABLE dbo.user_organizations
    ADD COLUMN joined_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL;

CREATE TABLE IF NOT EXISTS api.org_members_result
(
    id        uuid NOT NULL,
    name      TEXT,
    email     TEXT,
    rank      INTEGER,
    joined_at timestamptz
);

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

    RETURN QUERY SELECT u.id, u.name::TEXT, u.email::TEXT, uo.rank, uo.joined_at
                 FROM dbo.user_organizations uo
                          JOIN auth.users u ON uo.user_id = u.id
                 WHERE uo.organization_class_id = org_class_id
                 ORDER BY uo.rank;
END
$$ LANGUAGE plpgsql STABLE;