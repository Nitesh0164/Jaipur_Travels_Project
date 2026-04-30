CREATE TABLE chat_sessions (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    title      VARCHAR(300),
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_chat_sessions_user (user_id),
    INDEX idx_chat_sessions_created (created_at),
    CONSTRAINT fk_chat_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chat_messages (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    session_id   BIGINT       NOT NULL,
    role         VARCHAR(20)  NOT NULL,
    content      LONGTEXT     NOT NULL,
    message_type VARCHAR(30)  NOT NULL DEFAULT 'GENERAL_CHAT',
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_chat_messages_session (session_id),
    INDEX idx_chat_messages_created (created_at),
    CONSTRAINT fk_chat_messages_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE weather_cache (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    city         VARCHAR(100) NOT NULL,
    cache_type   VARCHAR(30)  NOT NULL DEFAULT 'CURRENT',
    payload_json LONGTEXT,
    fetched_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at   TIMESTAMP    NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_weather_cache_city (city),
    INDEX idx_weather_cache_expires (expires_at),
    UNIQUE KEY uk_weather_city_type (city, cache_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
