CREATE TABLE bus_routes (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    route_no         VARCHAR(20)  NOT NULL,
    route_type       VARCHAR(50)  NOT NULL DEFAULT 'Regular',
    category         VARCHAR(50)  NOT NULL DEFAULT 'Urban',
    from_stop        VARCHAR(200) NOT NULL,
    to_stop          VARCHAR(200) NOT NULL,
    via_summary_json JSON,
    distance_km      DECIMAL(6,1) NOT NULL DEFAULT 0,
    stops_count      INT          NOT NULL DEFAULT 0,
    headway_minutes  INT          NOT NULL DEFAULT 0,
    buses_on_route   INT          NOT NULL DEFAULT 0,
    fare_min         DECIMAL(8,2) NOT NULL DEFAULT 0,
    fare_max         DECIMAL(8,2) NOT NULL DEFAULT 0,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_bus_routes_route_no (route_no),
    INDEX idx_bus_routes_from (from_stop),
    INDEX idx_bus_routes_to (to_stop),
    INDEX idx_bus_routes_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bus_stops (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    route_id   BIGINT       NOT NULL,
    stop_name  VARCHAR(200) NOT NULL,
    stop_order INT          NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_bus_stops_name (stop_name),
    INDEX idx_bus_stops_route (route_id),
    CONSTRAINT fk_bus_stops_route FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
