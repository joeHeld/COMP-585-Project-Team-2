CREATE DATABASE IF NOT EXISTS medical_appointments;
USE medical_appointments;

CREATE TABLE Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    PasswordSalt VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20),
    UserType ENUM('Patient', 'Provider', 'Admin') NOT NULL DEFAULT 'Patient',
    IsActive TINYINT(1) NOT NULL DEFAULT 1,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (Email),
    INDEX idx_user_type (UserType),
    INDEX idx_is_active (IsActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Appointments (
    AppointmentId INT AUTO_INCREMENT PRIMARY KEY,
    AppointmentDateTime DATETIME NOT NULL,
    DurationMinutes INT DEFAULT 30,
    ReasonForVisit VARCHAR(255),
    Notes LONGTEXT,
    Status ENUM('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show') NOT NULL DEFAULT 'Scheduled',
    CancellationReason VARCHAR(255),
    CancelledBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_appointment_datetime (AppointmentDateTime),
    INDEX idx_status (Status),
    UNIQUE KEY unique_appointment_slot (ProviderId, AppointmentDateTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


