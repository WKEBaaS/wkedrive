-- Custom SQL migration file, put your code below! --

CREATE TYPE invitation_type AS ENUM ('INVITATION', 'REQUEST');
CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

CREATE TABLE IF NOT EXISTS dbo.organization_invitations
(
    id                    uuid              NOT NULL DEFAULT uuidv7(),
    organization_class_id VARCHAR(21),
    invitee_id            uuid,
    email                 VARCHAR(255),
    inviter_id            uuid,
    type                  invitation_type   NOT NULL,
    status                invitation_status NOT NULL DEFAULT 'PENDING',
    token                 TEXT,
    created_at            timestamptz       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at            timestamptz       NOT NULL,
    CONSTRAINT pk_dbo_organization_invitations PRIMARY KEY (id),
    CONSTRAINT fk_dbo_organization_invitations_class_id FOREIGN KEY (organization_class_id) REFERENCES dbo.classes,
    CONSTRAINT fk_dbo_organization_invitations_invitee FOREIGN KEY (invitee_id) REFERENCES auth.users,
    CONSTRAINT fk_dbo_organization_invitations_inviter FOREIGN KEY (inviter_id) REFERENCES auth.users
)