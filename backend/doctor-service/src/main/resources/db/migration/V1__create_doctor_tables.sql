CREATE TABLE doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    qualification VARCHAR(200),
    experience_years INT,
    consultation_fee DECIMAL(10,2),
    department VARCHAR(100),
    bio TEXT,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_doctor_user_id (user_id),
    INDEX idx_doctor_specialization (specialization),
    INDEX idx_doctor_department (department),
    INDEX idx_doctor_license (license_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE doctor_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    max_patients INT DEFAULT 20,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_schedule_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_schedule_doctor (doctor_id),
    INDEX idx_schedule_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed demo doctor data
INSERT INTO doctors (user_id, first_name, last_name, email, phone, specialization, license_number, qualification, experience_years, consultation_fee, department, bio, available)
VALUES
(2, 'John', 'Smith', 'dr.smith@hospital.com', '+1234567891', 'Cardiology', 'LIC-CARD-001', 'MD, DM Cardiology', 15, 200.00, 'Cardiology', 'Senior Cardiologist with 15 years of experience', true);

INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients)
SELECT id, 'MONDAY', '09:00', '17:00', 30, 16 FROM doctors WHERE license_number = 'LIC-CARD-001'
UNION ALL
SELECT id, 'WEDNESDAY', '09:00', '17:00', 30, 16 FROM doctors WHERE license_number = 'LIC-CARD-001'
UNION ALL
SELECT id, 'FRIDAY', '09:00', '13:00', 30, 8 FROM doctors WHERE license_number = 'LIC-CARD-001';
