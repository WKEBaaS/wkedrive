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
    SELECT FORMAT('/組織/%s/Storage/%s', chinese_name, TRIM(BOTH '/' FROM p_path))
    INTO v_s3_name_path
    FROM dbo.classes
    WHERE id = p_org_class_id;

    IF NOT found THEN
        RAISE SQLSTATE 'PT404' USING
            MESSAGE = FORMAT('Organization ID %s not found', p_org_class_id),
            HINT = 'Check the organization class ID.';
    END IF;

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

CREATE OR REPLACE FUNCTION api.delete_storage_objects(
    p_org_class_id VARCHAR(21),
    p_path TEXT,
    p_names TEXT[]
) RETURNS VOID AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_user_id         uuid := auth.jwt() ->> 'sub';
    v_storage_path    TEXT;
    v_target_name     TEXT;
    v_target_class_id VARCHAR(21);
    v_temp_path       TEXT;
BEGIN
    SELECT FORMAT('/組織/%s/Storage/%s', chinese_name, TRIM(BOTH '/' FROM p_path))
    INTO v_storage_path
    FROM dbo.classes
    WHERE id = p_org_class_id;

    IF NOT v_storage_path ~ '.*/$' THEN
        v_storage_path := v_storage_path || '/';
    END IF;

    IF NOT found THEN
        RAISE SQLSTATE 'PT404' USING
            MESSAGE = FORMAT('Organization ID %s not found', p_org_class_id),
            HINT = 'Check the organization class ID.';
    END IF;

    FOREACH v_target_name IN ARRAY p_names
        LOOP
            SELECT id, name_path
            INTO v_target_class_id, v_temp_path
            FROM dbo.classes
            WHERE name_path = FORMAT('%s%s', v_storage_path, v_target_name);

            -- 4. 如果找到對應的 Class，執行刪除
            IF found THEN
                -- (選用) 權限檢查：由於是 SECURITY DEFINER，建議檢查當前使用者是否有權限刪除該物件
                -- 假設權限名稱為 'delete' (請依據您的 permission_enum 調整)
                IF api.check_class_permission(v_target_class_id, 'delete') THEN
                    -- **核心邏輯：使用指定的 helper function 進行刪除**
                    -- 第二個參數 TRUE 代表遞迴刪除 (若該 Object 下還有子物件/繼承關係一併刪除)
                    PERFORM dbo.fn_delete_class(v_target_class_id, TRUE);
                ELSE
                    RAISE WARNING 'Permission denied: Skipping deletion for %', v_target_name;
                END IF;
            END IF;
        END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE
                    SECURITY DEFINER;

CREATE OR REPLACE FUNCTION api.create_storage_file(
    p_org_class_id VARCHAR(21),
    p_path TEXT,
    p_name TEXT,
    p_size TEXT,
    p_etag TEXT,
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
    SELECT FORMAT('/組織/%s/Storage/%s', chinese_name, TRIM(BOTH '/' FROM p_path))
    INTO v_storage_name_path
    FROM dbo.classes
    WHERE id = p_org_class_id;

    IF NOT found THEN
        RAISE SQLSTATE 'PT404' USING
            MESSAGE = FORMAT('Organization ID %s not found', p_org_class_id),
            HINT = 'Check the organization class ID.';
    END IF;

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
            p_etag,
            p_size,
            v_user_id
            );
END;
$$ LANGUAGE plpgsql VOLATILE
                    SECURITY DEFINER;

COMMENT ON FUNCTION api.create_storage_file IS $$Create Storage File
Create a new file in the specified path within an organization's storage.
Parameters:
- p_org_class_id: The class ID of the organization.
- p_path: The path within the organization's storage where the file will be created.
- p_name: The name of the file.
- p_size: The size of the file.
- p_etag: The S3 Object ETag of the file.
- p_description: A description of the file.
$$;

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
                size        TEXT,
                path        TEXT
            )
AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_file_entity_id     INT := 3;
    v_storage_name_path  TEXT;
    v_storage_prefix_len INT;
    v_storage_class_id   VARCHAR(21);
BEGIN
    -- Find /org/{org_name}/Storage/{p_path}
    SELECT CASE
               WHEN TRIM(BOTH '/' FROM p_path) = '' THEN
                   c.name_path
               ELSE
                   FORMAT('%s/%s', c.name_path, TRIM(BOTH '/' FROM p_path))
               END,
           LENGTH(c.name_path) + 1
    INTO v_storage_name_path,
        v_storage_prefix_len
    FROM dbo.inheritances i,
         dbo.classes c
    WHERE i.pcid = p_org_class_id
      AND i.ccid = c.id
      AND c.chinese_name = 'Storage'
    LIMIT 1;

    IF NOT found THEN
        RAISE SQLSTATE 'PT404' USING
            MESSAGE = FORMAT('Organization ID %s not found', p_org_class_id),
            HINT = 'Check the organization class ID.';
    END IF;

    SELECT id
    INTO v_storage_class_id
    FROM dbo.classes
    WHERE name_path = v_storage_name_path;

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
                ,
               SUBSTRING(c.name_path FROM v_storage_prefix_len + 1)                     AS path
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


CREATE OR REPLACE FUNCTION api.get_storage_file(
    p_org_class_id VARCHAR(21),
    p_path TEXT,
    p_name TEXT
)
    RETURNS TABLE
            (
                id          VARCHAR(21),
                name        TEXT,
                description TEXT,
                size        TEXT,
                etag        TEXT,
                created_at  timestamptz,
                updated_at  timestamptz,
                path        TEXT,
                type        TEXT
            )
AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_is_root          BOOLEAN := (TRIM(BOTH '/' FROM p_path) = '');
    v_file_entity_id   INT     := 3;
    v_file_path        TEXT;
    v_storage_class_id VARCHAR(21);
    v_has_permission   BOOLEAN;
BEGIN
    SELECT CASE
               WHEN v_is_root THEN FORMAT('/組織/%s/Storage/%s', chinese_name, p_name)
               ELSE FORMAT('/組織/%s/Storage/%s/%s', chinese_name, TRIM(BOTH '/' FROM p_path), p_name)
               END
    INTO v_file_path
    FROM dbo.classes
    WHERE id = p_org_class_id;
    IF NOT found THEN
        RAISE SQLSTATE 'PT404' USING
            MESSAGE = FORMAT('Organization ID %s not found', p_org_class_id),
            HINT = 'Check the organization class ID.';
    END IF;

    SELECT class_id, has
    FROM api.check_class_permission_by_name_path(v_file_path, 'read-object')
    INTO v_storage_class_id, v_has_permission;
    IF NOT v_has_permission THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to access this storage file in this organization',
            HINT = 'Check your permissions.';
    END IF;

    RETURN QUERY
        SELECT c.id,
               c.chinese_name::TEXT                                AS name,
               c.chinese_description::TEXT                         AS description,
               c.english_description::TEXT                         AS size,
               c.english_name::TEXT                                AS etag,
               c.created_at,
               c.updated_at,
               SUBSTRING(c.name_path FROM LENGTH(v_file_path) + 2) AS path,
               'file'                                              AS type
        FROM dbo.classes c
        WHERE c.name_path = v_file_path
          AND c.entity_id = v_file_entity_id;
END;
$$ LANGUAGE plpgsql STABLE
                    SECURITY DEFINER;