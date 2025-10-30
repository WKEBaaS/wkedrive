-- Custom SQL migration file, put your code below! --

CREATE OR REPLACE FUNCTION api.get_organizations() RETURNS SETOF api.get_orgs_result
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

    RETURN QUERY SELECT c.id, c.chinese_name::TEXT, c.chinese_description::TEXT
                 FROM dbo.inheritances i,
                      dbo.classes c
                 WHERE i.pcid = v_root_class_id
                   AND i.ccid = c.id
                   AND api.check_class_permission(c.id, 'read-class') = TRUE;
END;
$$ LANGUAGE plpgsql STABLE;