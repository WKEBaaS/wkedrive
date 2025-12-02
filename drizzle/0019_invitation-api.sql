-- Custom SQL migration file, put your code below! --

CREATE OR REPLACE FUNCTION api.get_organization_invitations(
    p_org_class_id VARCHAR(21)
)
    RETURNS TABLE
            (
                id                    uuid,
                organization_class_id VARCHAR(21),
                invitee_id            uuid,
                invitee_name          TEXT,
                email                 TEXT,
                inviter_id            uuid,
                inviter_name          TEXT,
                type                  dbo.invitation_type,
                status                dbo.invitation_status,
                token                 TEXT,
                created_at            timestamptz,
                expired_at            timestamptz
            )
    STABLE
    LANGUAGE plpgsql
    SECURITY DEFINER
AS
$$
    # VARIABLE_CONFLICT USE_COLUMN
DECLARE

BEGIN
    IF NOT api.in_organization(p_org_class_id) THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to access this organization invitations',
            HINT = 'Check your permissions.';
    END IF;

    RETURN QUERY SELECT i.id,
                        i.organization_class_id,
                        i.invitee_id,
                        invitee_u.name::TEXT,
                        i.email::TEXT,
                        i.inviter_id,
                        inviter_u.name::TEXT,
                        i.type,
                        i.status,
                        i.token::TEXT,
                        i.created_at,
                        i.expired_at
                 FROM dbo.organization_invitations i
                          LEFT JOIN auth.users invitee_u ON i.invitee_id = invitee_u.id
                          LEFT JOIN auth.users inviter_u ON i.inviter_id = inviter_u.id
                 WHERE organization_class_id = p_org_class_id;
END
$$;

CREATE OR REPLACE FUNCTION api.invite_to_organization(
    p_org_class_id VARCHAR(21),
    p_invitee_email TEXT,
    p_expires_in_days INT DEFAULT NULL
)
    RETURNS SETOF dbo.organization_invitations
    LANGUAGE plpgsql
    SECURITY DEFINER
AS
$$
DECLARE
    v_inviter_id uuid := auth.jwt() ->> 'sub';
    v_invitee_id uuid;
    v_expired_at timestamptz;
BEGIN
    IF NOT api.check_class_permission(p_org_class_id, 'insert') THEN
        RAISE SQLSTATE 'PT403' USING
            MESSAGE = 'User does not have permission to invite to this organization',
            HINT = 'Check your permissions.';
    END IF;

    IF p_expires_in_days IS NOT NULL THEN
        v_expired_at := CURRENT_TIMESTAMP + p_expires_in_days * INTERVAL '1 day';
    ELSE
        v_expired_at := CURRENT_TIMESTAMP + INTERVAL '7 days';
    END IF;

    SELECT id
    INTO v_invitee_id
    FROM auth.users
    WHERE email = p_invitee_email;

    INSERT INTO dbo.organization_invitations(organization_class_id, invitee_id, email, inviter_id, type, token,
                                             expired_at)
    VALUES (p_org_class_id,
            v_inviter_id,
            p_invitee_email,
            v_inviter_id,
            'INVITATION'::dbo.invitation_type,
            NULL,
            v_expired_at);
END;
$$