CREATE TABLE admin_logs (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    admin_id    BIGINT       NOT NULL,
    action      VARCHAR(50)  NOT NULL,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   BIGINT,
    meta_json   TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_admin_logs_admin (admin_id),
    INDEX idx_admin_logs_entity (entity_type),
    INDEX idx_admin_logs_created (created_at),
    CONSTRAINT fk_admin_logs_user FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE analytics_events (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT,
    event_type  VARCHAR(50)  NOT NULL,
    query_text  VARCHAR(500),
    meta_json   TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_analytics_user (user_id),
    INDEX idx_analytics_event_type (event_type),
    INDEX idx_analytics_created (created_at),
    CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
