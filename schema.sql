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
<<<<<<< HEAD
    -- داخل كود إنشاء جدول Project
    deadline DATE  ,
=======
>>>>>>> 4714cbdfee180b74a94d55829da92efb105534b6
    manager_id INT NOT NULL,
    FOREIGN KEY (manager_id) REFERENCES Manager (userId) ON DELETE CASCADE
);

CREATE TABLE Tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
<<<<<<< HEAD
    status VARCHAR(50) NOT NULL DEFAULT 'To Do',
=======
    status VARCHAR(50) NOT NULL,
>>>>>>> 4714cbdfee180b74a94d55829da92efb105534b6
    comment TEXT,
    project_id INT NOT NULL,
    employee_id INT, -- NULL si la tâche n'est pas encore attribuée
    FOREIGN KEY (project_id) REFERENCES Project (id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES Employee (userId) ON DELETE SET NULL
);
<<<<<<< HEAD
CREATE TABLE task_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    employee_id INT,
    action_type VARCHAR(50) DEFAULT 'Unassigned',
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_history_tasks 
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
=======
>>>>>>> 4714cbdfee180b74a94d55829da92efb105534b6

CREATE TABLE Meeting (
    meetingId INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    title VARCHAR(200) NOT NULL,
<<<<<<< HEAD
    room VARCHAR(50) NOT NULL,
    resume TEXT,
=======
    room VARCHAR(50) DEFAULT NULL,
    virtual_link VARCHAR(255) DEFAULT NULL,
    resume TEXT,
    status ENUM(
        'Scheduled',
        'Cancelled',
        'Completed'
    ) DEFAULT 'Scheduled',
    isArchived BOOLEAN DEFAULT FALSE, -- العمود الجديد 
    isNotified BOOLEAN DEFAULT FALSE,
>>>>>>> 4714cbdfee180b74a94d55829da92efb105534b6
    manager_id INT NOT NULL,
    FOREIGN KEY (manager_id) REFERENCES Manager (userId) ON DELETE CASCADE
);

<<<<<<< HEAD
=======
CREATE TABLE MeetingMembers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT,
    userId INT,
    FOREIGN KEY (meeting_id) REFERENCES Meeting (meetingId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE
);

>>>>>>> 4714cbdfee180b74a94d55829da92efb105534b6
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
<<<<<<< HEAD
);
CREATE TABLE task_assignments (
    task_id INT,
    employee_id INT,
    PRIMARY KEY (task_id, employee_id),
    -- الربط مع جدول المهام (العمود اسمه id في صورة الجدول)
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    -- الربط مع جدول الموظفين (العمود اسمه user في صورة الجدول)
    FOREIGN KEY (employee_id) REFERENCES employee(userId) ON DELETE CASCADE
);
 -- 1. حذف القيد القديم الذي يمنع تعديل الجدول
ALTER TABLE tasks DROP FOREIGN KEY fk_employee;
ALTER TABLE tasks DROP FOREIGN KEY tasks_ibfk_1;
ALTER TABLE tasks DROP FOREIGN KEY tasks_ibfk_2;

-- 2. الآن يمكنكِ حذف العمود بنجاح
ALTER TABLE tasks DROP COLUMN employee_id;
ALTER TABLE project ADD COLUMN status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending';
ALTER TABLE project ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
-- 1. إضافة عمود الأرشفة لجدول المهام
ALTER TABLE tasks ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- 2. حذف جدول تاريخ المهام القديم
DROP TABLE task_history;
ALTER TABLE project 
MODIFY COLUMN status ENUM('Pending', 'In Progress', 'Completed', 'Canceled') DEFAULT 'Pending';
=======
);
>>>>>>> 4714cbdfee180b74a94d55829da92efb105534b6
