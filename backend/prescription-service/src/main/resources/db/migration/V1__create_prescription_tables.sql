CREATE TABLE prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(100),
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(100),
    appointment_id BIGINT,
    diagnosis TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_presc_patient (patient_id),
    INDEX idx_presc_doctor (doctor_id),
    INDEX idx_presc_appointment (appointment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE medications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prescription_id BIGINT NOT NULL,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    instructions TEXT,
    CONSTRAINT fk_med_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    INDEX idx_med_prescription (prescription_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
