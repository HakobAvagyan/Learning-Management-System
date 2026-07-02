CREATE TABLE enrollment.enrollments (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    course_id   VARCHAR(24)     NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    enrolled_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_course UNIQUE (user_id, course_id),
    CONSTRAINT ck_status CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_enrollments_user_id   ON enrollment.enrollments (user_id);
CREATE INDEX idx_enrollments_course_id ON enrollment.enrollments (course_id);