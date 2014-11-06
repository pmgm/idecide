-- schema for idecide_extra db
-- participant_password
CREATE_TABLE participant_password (
participant_id BIGINT UNSIGNED NOT NULL,
plain_text_pass VARCHAR(20) NOT NULL
);
