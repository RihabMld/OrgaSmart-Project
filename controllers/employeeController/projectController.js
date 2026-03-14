const db = require("../../config/db"); 

exports.searchEmployeeTasksAndProjects = async (req, res) => {
    const { email, searchTerm } = req.query;
    const searchPattern = `%${searchTerm}%`;
    try {
        const projectQuery = `
            SELECT DISTINCT p.id, p.name, p.status, p.startDate, p.endDate
            FROM project p JOIN tasks t ON p.id = t.project_id
            JOIN task_assignments ta ON t.id = ta.task_id
            JOIN user u ON ta.employee_id = u.id
            WHERE u.email = ? AND p.is_archived = FALSE AND p.name LIKE ?`;
        
        const taskQuery = `
            SELECT t.id AS task_id, t.title, t.status, t.startDate, t.endDate, p.name AS project_name
            FROM tasks t JOIN task_assignments ta ON t.id = ta.task_id
            JOIN user u ON ta.employee_id = u.id
            JOIN project p ON t.project_id = p.id
            WHERE u.email = ? AND t.is_archived = FALSE AND t.title LIKE ?`;

        const [projects] = await db.query(projectQuery, [email, searchPattern]);
        const [tasks] = await db.query(taskQuery, [email, searchPattern]);
        res.status(200).json({ matchedProjects: projects, matchedTasks: tasks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchEmployeeArchived = async (req, res) => {
    const { email, searchTerm } = req.query;
    const searchPattern = `%${searchTerm}%`;

    try {
        // 1. البحث في المشاريع المؤرشفة للموظف
        const projectQuery = `
            SELECT DISTINCT p.id, p.name, p.status, p.startDate, p.endDate
            FROM project p
            JOIN tasks t ON p.id = t.project_id
            JOIN task_assignments ta ON t.id = ta.task_id
            JOIN user u ON ta.employee_id = u.id
            WHERE u.email = ? AND p.is_archived = TRUE AND p.name LIKE ?`;

        // 2. البحث في المهام المؤرشفة للموظف
        const taskQuery = `
            SELECT t.id AS task_id, t.title, t.status, t.startDate, t.endDate, p.name AS project_name
            FROM tasks t
            JOIN task_assignments ta ON t.id = ta.task_id
            JOIN user u ON ta.employee_id = u.id
            JOIN project p ON t.project_id = p.id
            WHERE u.email = ? AND t.is_archived = TRUE AND t.title LIKE ?`;

        const [projects] = await db.query(projectQuery, [email, searchPattern]);
        const [tasks] = await db.query(taskQuery, [email, searchPattern]);

        res.status(200).json({
            matchedArchivedProjects: projects,
            matchedArchivedTasks: tasks
        });
    } catch (error) {
        res.status(500).json({ error: "خطأ في جلب الأرشيف: " + error.message });
    }
};