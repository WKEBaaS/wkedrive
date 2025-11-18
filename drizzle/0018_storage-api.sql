-- Custom SQL migration file, put your code below! --

DROP FUNCTION IF EXISTS api.create_storage_file;
DROP FUNCTION IF EXISTS api.create_storage_folder;
DROP FUNCTION IF EXISTS api.get_storage_objects;

CREATE OR REPLACE FUNCTION api.create_storage_folder(
    p_org_class_id VARCHAR(21),
    p_path TEXT,
    p_name TEXT,
    p_description TEXT
) RETURNS VOID AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_user_id        uuid := auth.jwt() ->> 'sub';
    v_s3_name_path   TEXT;
    v_s3_class_id    VARCHAR(21);
    v_has_permission BOOLEAN;
BEGIN
    SELECT FORMAT('/組織/%s/Storage/', chinese_name, TRIM(BOTH '/' FROM p_path))
    INTO v_s3_name_path
    FROM dbo.classes
    WHERE id = p_org_class_id;

    SELECT class_id, has
    FROM api.check_class_permission_by_name_path(v_s3_name_path, 'insert')
    INTO v_s3_class_id, v_has_permission;
    IF NOT v_has_permission THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to create storage folder in this organization',
            HINT = 'Check your permissions.';
    END IF;

    PERFORM dbo.fn_insert_class(
            v_s3_class_id,
            NULL,
            p_name,
            p_description,
            NULL,
            NULL,
            v_user_id
            );
END;
$$
    LANGUAGE plpgsql VOLATILE
                     SECURITY DEFINER;

CREATE OR REPLACE FUNCTION api.create_storage_file(
    p_org_class_id VARCHAR(21),
    p_path TEXT,
    p_name TEXT,
    p_size TEXT,
    p_description TEXT
) RETURNS VOID AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_user_id           uuid := auth.jwt() ->> 'sub';
    v_file_entity_id    INT  := 3;
    v_storage_name_path TEXT;
    v_storage_class_id  VARCHAR(21);
    v_has_permission    BOOLEAN;
BEGIN
    SELECT FORMAT('/組織/%s/Storage/', chinese_name, TRIM(BOTH '/' FROM p_path))
    INTO v_storage_name_path
    FROM dbo.classes
    WHERE id = p_org_class_id;
    SELECT class_id, has
    FROM api.check_class_permission_by_name_path(v_storage_name_path, 'insert')
    INTO v_storage_class_id, v_has_permission;
    IF NOT v_has_permission THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to create storage file in this organization',
            HINT = 'Check your permissions.';
    END IF;

    IF EXISTS (SELECT 1 FROM dbo.classes WHERE id = v_storage_class_id AND entity_id = v_file_entity_id) THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'Cannot create file under a file entity',
            HINT = 'Please create file under a folder entity.';
    END IF;

    PERFORM dbo.fn_insert_class(
            v_storage_class_id,
            3,
            p_name,
            p_description,
            NULL,
            p_size,
            v_user_id
            );
END;
$$ LANGUAGE plpgsql VOLATILE
                    SECURITY DEFINER;

CREATE OR REPLACE FUNCTION api.get_storage_objects(
    p_org_class_id VARCHAR(21),
    p_path TEXT
)
    RETURNS TABLE
            (
                id          VARCHAR(21),
                name        TEXT,
                description TEXT,
                type        TEXT,
                created_at  timestamptz,
                updated_at  timestamptz,
                size        TEXT
            )
AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_file_entity_id    INT := 3;
    v_storage_name_path TEXT;
    v_storage_class_id  VARCHAR(21);
    v_has_read_class    BOOLEAN;
    v_has_read_object   BOOLEAN;
BEGIN
    SELECT FORMAT('/組織/%s/Storage/%s', chinese_name, TRIM(BOTH '/' FROM p_path))
    INTO v_storage_name_path
    FROM dbo.classes
    WHERE id = p_org_class_id;

    SELECT class_id,
           MAX(has::INT) FILTER ( WHERE permission = 'read-class' )  AS can_read_class,
           MAX(has::INT) FILTER ( WHERE permission = 'read-object' ) AS can_read_object
    INTO v_storage_class_id, v_has_read_class, v_has_read_object
    FROM
        api.get_class_permissions_by_name_path(v_storage_name_path)
    GROUP BY class_id;

    IF NOT (v_has_read_class OR v_has_read_object) THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to access storage objects in this organization',
            HINT = 'Check your permissions.';
    END IF;

    RETURN QUERY
        SELECT c.id,
               c.chinese_name::TEXT                                                     AS name,
               c.chinese_description::TEXT                                              AS description,
               CASE WHEN (c.entity_id = v_file_entity_id) THEN 'file' ELSE 'folder' END AS type,
               c.created_at,
               c.updated_at,
               CASE
                   WHEN (c.entity_id = v_file_entity_id) THEN c.english_description
                   ELSE (SELECT FORMAT('%s items', COUNT(*)::TEXT)
                         FROM dbo.inheritances i_sub
                                  JOIN dbo.classes c_sub ON i_sub.ccid = c_sub.id
                         WHERE i_sub.pcid = c.id -- c.id 是當前這筆 folder 的 id
                           AND c_sub.is_hidden = FALSE)
                   END                                                                  AS size
        FROM dbo.inheritances i,
             dbo.classes c
        WHERE i.pcid = v_storage_class_id
          AND i.ccid = c.id
          AND c.is_hidden = FALSE
          AND api.check_class_permission(c.id, 'read-class') = TRUE;

END;
$$ LANGUAGE plpgsql STABLE
                    SECURITY DEFINER;

COMMENT ON FUNCTION api.get_storage_objects IS $$Get Storage Objects (Folders/Files)
Retrieve the list of storage objects (folders/files) within a specified path in an organization.
Parameters:
- p_org_class_id: The class ID of the organization.
- p_path: The path within the organization's storage to retrieve objects from.
Returns:
```json
[
  {
    "name": "Object Name",
    "description": "Object Description",
    "type": "folder" | "file",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  },
  ...
]
$$;