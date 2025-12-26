-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION api.set_storage_object_permission(
    p_org_class_id VARCHAR(21),
    p_object_class_id VARCHAR(21),
    p_permissions jsonb
)
    RETURNS VOID
    LANGUAGE plpgsql
    VOLATILE SECURITY DEFINER
AS
$$
DECLARE
BEGIN
    -------------------------------------------------------------------------
    -- 1. Check if the user has permission to modify permissions
    -------------------------------------------------------------------------
    IF NOT api.check_class_permission(p_object_class_id, 'modify') THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to modify permissions for this object',
            HINT = 'Check your permissions.';
    END IF;

    -------------------------------------------------------------------------
    -- 2. Insert/Upsert permissions
    --    Logic: Default bits to 0, and DO NOT insert if bits are 0.
    -------------------------------------------------------------------------
    INSERT INTO dbo.permissions (class_id, role_type, role_id, permission_bits)
    SELECT p_org_class_id,                          -- 1. Class ID from arg
           (p.role_type)::dbo.permission_role_type, -- 2. Cast to Enum
           (p.role_id)::uuid,                       -- 3. Cast to UUID
           COALESCE(p.permission_bits, 0)           -- 4. Default to 0 if null/missing
    FROM JSONB_TO_RECORDSET(p_permissions) AS p(
                                                role_type TEXT,
                                                role_id TEXT,
                                                permission_bits SMALLINT
        )
    -- ONLY insert if the resulting permission is greater than 0
    WHERE COALESCE(p.permission_bits, 0) > 0
    ON CONFLICT (class_id, role_type, role_id)
        DO UPDATE SET permission_bits = excluded.permission_bits;

END
$$;

COMMENT ON FUNCTION api.set_storage_object_permission IS $$Set Storage Object Permissions
Updates or inserts permission settings for a specific storage object.
It requires the user to have 'modify' rights on the target object. Permission entries with 0 bits are ignored/skipped.

Parameters:
- p_org_class_id: The class ID of the object where permissions will be applied.
- p_object_class_id: The class ID used to validate the requestor's authority (check 'modify' access).
- p_permissions: A JSON array containing the list of roles and their permission bits.

Payload Example (p_permissions):
```json
[
  {
    "role_type": "USER",
    "role_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "permission_bits": 1
  },
  {
    "role_type": "GROUP",
    "role_id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "permission_bits": 3
  }
]
$$;
