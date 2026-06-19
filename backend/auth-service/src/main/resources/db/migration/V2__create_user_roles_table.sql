-- V2: Create user_roles table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(30) NOT NULL,

    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_roles_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
