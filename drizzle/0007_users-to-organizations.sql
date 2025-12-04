-- Custom SQL migration file, put your code below! --

CREATE TABLE IF NOT EXISTS dbo.user_organizations
(
    user_id               uuid        NOT NULL,
    organization_class_id VARCHAR(21) NOT NULL,
    rank                  INTEGER     NOT NULL DEFAULT 0,
    CONSTRAINT pk_dbo_user_organizations PRIMARY KEY (user_id, organization_class_id),
    CONSTRAINT fk_dbo_user_organizations_user FOREIGN KEY (user_id) REFERENCES auth.users,
    CONSTRAINT fk_dbo_user_organizations_organization_class FOREIGN KEY (organization_class_id) REFERENCES dbo.classes
);