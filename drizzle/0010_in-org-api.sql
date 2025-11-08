CREATE OR REPLACE FUNCTION api.in_organization(org_class_id VARCHAR(21))
    RETURNS BOOLEAN -- 1. 修改返回類型
AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE
    v_user_id uuid := auth.jwt() ->> 'sub';
BEGIN
    -- 2. 檢查 NULL user
    IF v_user_id IS NULL THEN
        RETURN FALSE; -- 直接返回 boolean
    END IF;

    -- 3. 檢查 admin
    IF CURRENT_USER = 'app_admin' THEN
        RETURN TRUE; -- 直接返回 boolean
    END IF;

    -- 4. 檢查 org 是否存在
    IF NOT EXISTS(SELECT 1 FROM dbo.classes WHERE id = org_class_id) THEN
        RETURN FALSE; -- 直接返回 boolean
    END IF;

    -- 5. 檢查是否為 owner
    IF EXISTS(SELECT 1 FROM dbo.classes WHERE id = org_class_id AND owner_id = v_user_id) THEN
        RETURN TRUE; -- 直接返回 boolean
    END IF;

    -- 6. 檢查是否為成員 (使用 EXISTS 更簡潔)
    IF EXISTS(SELECT 1
              FROM dbo.user_organizations
              WHERE user_id = v_user_id
                AND organization_class_id = org_class_id)
    THEN
        RETURN TRUE; -- 直接返回 boolean
    END IF;

    -- 7. 如果以上都不是，則返回 false
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION api.in_organization IS $$Evaluate whether the current user is in the specified organization class.
RETURNS True if the user is in the organization or is owner/admin; otherwise, returns False.
$$;
