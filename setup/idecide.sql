-- schema for idecide db
-- participant
CREATE TABLE participant (
       participant_id SERIAL PRIMARY KEY,
       first_name VARCHAR(50) NOT NULL,
       last_name VARCHAR(50) NOT NULL,
eligible VARCHAR(3) NULL DEFAULT 'no',
consent VARCHAR(3) NULL DEFAULT 'no',
validated VARCHAR(3) NULL DEFAULT 'no',
off_study VARCHAR(3) NULL DEFAULT 'no',
enrolled DATETIME NULL,
accrued DATETIME NULL 
);
-- add confirmed field <2014-10-22 Wed>
ALTER TABLE participant
ADD COLUMN confirmed VARCHAR(3) NULL DEFAULT 'no'
AFTER enrolled;
-- participant_contact
CREATE TABLE participant_contact (
participant_id BIGINT UNSIGNED NOT NULL,
email VARCHAR(90) NULL,
street_address1 VARCHAR(100) NULL,
street_address2 VARCHAR(100) NULL,
city VARCHAR(100) NULL,
state VARCHAR(20) NULL,
postcode VARCHAR(16) NULL,

FOREIGN KEY (participant_id) REFERENCES participant(participant_id) ON DELETE CASCADE
);
-- add alternate_email <2014-11-05 Wed>
ALTER TABLE participant_contact
ADD COLUMN alternate_email VARCHAR(90) NULL
AFTER email;
-- participant_data
CREATE TABLE participant_data (
participant_id BIGINT UNSIGNED NOT NULL,
username VARCHAR(20) NOT NULL,
passcode CHAR(32) NOT NULL,
treatment VARCHAR(30) NOT NULL,
site VARCHAR(100) NULL,

FOREIGN KEY (participant_id) REFERENCES participant(participant_id) ON DELETE CASCADE
);
-- participant_incentive
CREATE TABLE participant_incentive (
participant_id BIGINT UNSIGNED NOT NULL,
incentive_choice BIGINT UNSIGNED NULL,
incentive_name VARCHAR(100) NULL,
incentive_street VARCHAR(100) NULL,
incentive_city VARCHAR(100) NULL,
incentive_state VARCHAR(20) NULL,
incentive_post VARCHAR(16) NULL,
FOREIGN KEY (participant_id) REFERENCES participant(participant_id) ON DELETE CASCADE
);
CREATE TABLE survey (
survey_id SERIAL PRIMARY KEY,
surveyKeyword VARCHAR(20) NOT NULL,
survey varchar(100) NULL
);
INSERT into survey VALUES (
DEFAULT, 'baseline', 'Baseline'
);
INSERT into survey VALUES (
DEFAULT, 'three', '3 months'
);
INSERT into survey VALUES (
DEFAULT, 'six', '6 months'
);
INSERT into survey VALUES (
DEFAULT, 'twelve', '12 months'
);
-- schedule (participant_survey m-m)
CREATE TABLE schedule (
participant_id BIGINT UNSIGNED NOT NULL,
survey_id BIGINT UNSIGNED NOT NULL,
order_index BIGINT UNSIGNED NOT NULL,
surveyType VARCHAR(30) DEFAULT 'Primary' NOT NULL,
dateScheduled DATETIME NOT NULL,
dateActual DATETIME NULL,
dateStarted DATETIME NULL,
dateCompleted DATETIME NULL,

FOREIGN KEY (participant_id) REFERENCES participant(participant_id) ON DELETE CASCADE,
FOREIGN KEY (survey_id) REFERENCES survey(survey_id) ON DELETE CASCADE
);
