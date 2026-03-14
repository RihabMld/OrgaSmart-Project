CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM(
        'Employee',
        'Manager',
        'Director'
    ) NOT NULL
);

CREATE TABLE Manager (
    userId INT PRIMARY KEY,
    FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE
);

CREATE TABLE Employee (
    userId INT PRIMARY KEY,
    FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE
);

CREATE TABLE Director (
    userId INT PRIMARY KEY,
    FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE
);

CREATE TABLE TechnicalAdministrator (
    id INT PRIMARY KEY DEFAULT 1,
    system_name VARCHAR(50) DEFAULT 'Main Admin System'
);

CREATE TABLE Departement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manager_id INT NOT NULL,
    admin_id INT NOT NULL DEFAULT 1,
    FOREIGN KEY (manager_id) REFERENCES Manager (userId) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES TechnicalAdministrator (id)
);

ALTER TABLE Employee ADD COLUMN departement_id INT;

ALTER TABLE Employee
ADD CONSTRAINT fk_employee_dept FOREIGN KEY (departement_id) REFERENCES Departement (id) ON DELETE SET NULL;

CREATE TABLE Project (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INT NOT NULL,
    FOREIGN KEY (manager_id) REFERENCES Manager (userId) ON DELETE CASCADE
);

CREATE TABLE Tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    comment TEXT,
    project_id INT NOT NULL,
    employee_id INT, -- NULL si la tâche n'est pas encore attribuée
    FOREIGN KEY (project_id) REFERENCES Project (id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES Employee (userId) ON DELETE SET NULL
);

CREATE TABLE Meeting (
    meetingId INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    title VARCHAR(200) NOT NULL,
    room VARCHAR(50) NOT NULL,
    resume TEXT,
    manager_id INT NOT NULL,
    FOREIGN KEY (manager_id) REFERENCES Manager (userId) ON DELETE CASCADE
);

CREATE TABLE Chat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    FOREIGN KEY (senderId) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES User (id) ON DELETE CASCADE
);

CREATE TABLE Suggestions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Submitted',
    employee_id INT NOT NULL,
    manager_id INT,
    director_id INT,
    FOREIGN KEY (employee_id) REFERENCES Employee (userId) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES Manager (userId) ON DELETE SET NULL,
    FOREIGN KEY (director_id) REFERENCES Director (userId) ON DELETE SET NULL
);

CREATE TABLE Notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES User (id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES User (id) ON DELETE CASCADE
);

CREATE TABLE PasswordReset (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiresAt DATETIME NOT NULL,
    FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE
);