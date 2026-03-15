const db = require("../../config/db");

exports.createProject = async (req, res) => {
    const { name, description, manager_id, deadline } = req.body;
    try {
        const projectQuery = "INSERT INTO project (name, description, manager_id, deadline, status) VALUES (?, ?, ?, ?, 'Pending')";
        const [projectResult] = await db.query(projectQuery, [name, description, manager_id, deadline]);
        res.status(201).json({ message: "تم إنشاء المشروع بنجاح!", projectId: projectResult.insertId });
    } catch (error) {
        res.status(500).json({ error: "فشل في إنشاء المشروع: " + error.message });
    }
};

exports.updateProject = async (req, res) => {
    const projectId = req.params.id;
    const { name, description, endDate } = req.body; 
    try {
        const query = "UPDATE project SET name = ?, description = ?, deadline = ? WHERE id = ?";
        await db.query(query, [name, description, endDate, projectId]);
        res.status(200).json({ message: "تم تحديث بيانات المشروع بنجاح!" });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء تحديث المشروع" });
    }
};

exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        const [tasks] = await db.query("SELECT id FROM tasks WHERE project_id = ?", [id]);
        if (tasks.length === 0) {
            await db.query("DELETE FROM project WHERE id = ?", [id]);
            return res.status(200).json({ message: "تم حذف المشروع نهائياً" });
        } else {
            await db.query("UPDATE project SET is_archived = TRUE, status = 'Canceled' WHERE id = ?", [id]);
            await db.query("UPDATE tasks SET is_archived = TRUE, status = 'Canceled' WHERE project_id = ?", [id]);
            return res.status(200).json({ message: "تم إلغاء المشروع وأرشفته" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getManagerProjects = async (req, res) => {
    const { manager_id } = req.params;
    try {
        const query = `
            SELECT p.*, COUNT(t.id) AS total_tasks,
            SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks
            FROM project p LEFT JOIN tasks t ON p.id = t.project_id
            WHERE p.manager_id = ? AND p.is_archived = FALSE
            GROUP BY p.id`;
        const [projects] = await db.query(query, [manager_id]);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// هذه الدالة مهمة جداً ليتحرك شريط التقدم
exports.updateProjectStatus = async (project_id) => {
    const [tasks] = await db.query("SELECT status FROM tasks WHERE project_id = ?", [project_id]);
    if (tasks.length === 0) return;
    const statuses = tasks.map(t => t.status);
    let newStatus = 'Pending';
    if (statuses.every(s => s === 'Done')) {
        newStatus = 'Completed';
        await db.query("UPDATE project SET status = ?, is_archived = TRUE WHERE id = ?", [newStatus, project_id]);
    } else if (statuses.some(s => ['In Progress', 'Done'].includes(s))) {
        newStatus = 'In Progress';
        await db.query("UPDATE project SET status = ? WHERE id = ?", [newStatus, project_id]);
    } else {
        await db.query("UPDATE project SET status = ? WHERE id = ?", [newStatus, project_id]);
    }
};

exports.getProjectHistory = async (req, res) => {
    const { manager_id } = req.params;
    try {
        const [history] = await db.query("SELECT * FROM project WHERE manager_id = ? AND is_archived = TRUE", [manager_id]);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchProjects = async (req, res) => {
    const { searchTerm } = req.query;
    const searchPattern = `%${searchTerm}%`;
    try {
        const query = "SELECT * FROM project WHERE (name LIKE ? OR deadline LIKE ?) AND is_archived = 0";
        const [projects] = await db.query(query, [searchPattern, searchPattern]);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchProjectsArchived = async (req, res) => {
    const { searchTerm } = req.query;
    const searchPattern = `%${searchTerm}%`;
    try {
        const query = "SELECT * FROM project WHERE (name LIKE ? OR deadline LIKE ?) AND is_archived = 1";
        const [projects] = await db.query(query, [searchPattern, searchPattern]);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};