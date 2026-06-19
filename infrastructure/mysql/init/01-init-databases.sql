-- Create all service databases
CREATE DATABASE IF NOT EXISTS hospital_auth;
CREATE DATABASE IF NOT EXISTS hospital_patient;
CREATE DATABASE IF NOT EXISTS hospital_doctor;
CREATE DATABASE IF NOT EXISTS hospital_appointment;
CREATE DATABASE IF NOT EXISTS hospital_prescription;
CREATE DATABASE IF NOT EXISTS hospital_billing;
CREATE DATABASE IF NOT EXISTS hospital_notification;
CREATE DATABASE IF NOT EXISTS hospital_audit;

-- Grant permissions
GRANT ALL PRIVILEGES ON hospital_auth.* TO 'hospital_user'@'%';
GRANT ALL PRIVILEGES ON hospital_patient.* TO 'hospital_user'@'%';
GRANT ALL PRIVILEGES ON hospital_doctor.* TO 'hospital_user'@'%';
GRANT ALL PRIVILEGES ON hospital_appointment.* TO 'hospital_user'@'%';
GRANT ALL PRIVILEGES ON hospital_prescription.* TO 'hospital_user'@'%';
GRANT ALL PRIVILEGES ON hospital_billing.* TO 'hospital_user'@'%';
GRANT ALL PRIVILEGES ON hospital_notification.* TO 'hospital_user'@'%';
GRANT ALL PRIVILEGES ON hospital_audit.* TO 'hospital_user'@'%';

FLUSH PRIVILEGES;
