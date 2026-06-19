-- V4: Seed admin user
-- Password: Admin@123 (BCrypt hash with cost factor 12)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, enabled)
VALUES ('admin', 'admin@hospital.com', '$2a$12$LJ3RG/4.1X2JhB7X1B.NyOFqB4Kz3BqZ5g6pGqk7y0U1zR5vGnKu', 'System', 'Administrator', '+1234567890', true);

INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE username = 'admin';

-- Seed demo doctor
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, enabled)
VALUES ('dr.smith', 'dr.smith@hospital.com', '$2a$12$LJ3RG/4.1X2JhB7X1B.NyOFqB4Kz3BqZ5g6pGqk7y0U1zR5vGnKu', 'John', 'Smith', '+1234567891', true);

INSERT INTO user_roles (user_id, role)
SELECT id, 'DOCTOR' FROM users WHERE username = 'dr.smith';

-- Seed demo receptionist
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, enabled)
VALUES ('receptionist1', 'reception@hospital.com', '$2a$12$LJ3RG/4.1X2JhB7X1B.NyOFqB4Kz3BqZ5g6pGqk7y0U1zR5vGnKu', 'Sarah', 'Johnson', '+1234567892', true);

INSERT INTO user_roles (user_id, role)
SELECT id, 'RECEPTIONIST' FROM users WHERE username = 'receptionist1';

-- Seed demo patient
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, enabled)
VALUES ('patient1', 'patient@hospital.com', '$2a$12$LJ3RG/4.1X2JhB7X1B.NyOFqB4Kz3BqZ5g6pGqk7y0U1zR5vGnKu', 'Jane', 'Doe', '+1234567893', true);

INSERT INTO user_roles (user_id, role)
SELECT id, 'PATIENT' FROM users WHERE username = 'patient1';

-- Seed demo billing staff
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, enabled)
VALUES ('billing1', 'billing@hospital.com', '$2a$12$LJ3RG/4.1X2JhB7X1B.NyOFqB4Kz3BqZ5g6pGqk7y0U1zR5vGnKu', 'Mike', 'Wilson', '+1234567894', true);

INSERT INTO user_roles (user_id, role)
SELECT id, 'BILLING_STAFF' FROM users WHERE username = 'billing1';
