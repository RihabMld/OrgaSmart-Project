const db = require("../../config/db"); 

exports.searchEmployeeProjects = async (req, res) => {
    const { email, searchTerm } = req.query;
    const searchPattern = `%${searchTerm}%`;
    try {
        const projectQuery = `
            SELECT DISTINCT p.id, p.name, p.status, p.startDate, p.endDate
            FROM project p 
            JOIN tasks t ON p.id = t.project_id
            JOIN task_assignments ta ON t.id = ta.task_id
            JOIN user u ON ta.employee_id = u.id
            WHERE u.email = ? AND p.is_archived = FALSE AND p.name LIKE ?`;

        const [projects] = await db.query(projectQuery, [email, searchPattern]);
        res.status(200).json({ matchedProjects: projects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchEmployeeArchivedProjects = async (req, res) => {
    const { email, searchTerm } = req.query;
    const searchPattern = `%${searchTerm}%`;

    try {
        const projectQuery = `
            SELECT DISTINCT p.id, p.name, p.status, p.startDate, p.endDate
            FROM project p
            JOIN tasks t ON p.id = t.project_id
            JOIN task_assignments ta ON t.id = ta.task_id
            JOIN user u ON ta.employee_id = u.id
            WHERE u.email = ? AND p.is_archived = TRUE AND p.name LIKE ?`;

        const [projects] = await db.query(projectQuery, [email, searchPattern]);
        res.status(200).json({ matchedArchivedProjects: projects });
    } catch (error) {
        res.status(500).json({ error: "خطأ في جلب المشاريع المؤرشفة: " + error.message });
    }
};