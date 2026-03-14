const db = require("../../config/db");
// الربط مع متحكم المدير لتحديث شريط التقدم
const managerProject = require("../../controllers/managerController/projectController");

exports.getTasksByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        const query = `
            SELECT p.id AS project_id, p.name AS project_name,
            t.id AS task_id, t.title AS task_title, t.status AS task_status, 
            t.comment AS task_comment, t.startDate, t.endDate
            FROM tasks t JOIN task_assignments ta ON t.id = ta.task_id
            JOIN user u ON ta.employee_id = u.id
            JOIN project p ON t.project_id = p.id
            WHERE u.email = ? AND t.is_archived = FALSE ORDER BY p.id`;
        const [rows] = await db.query(query, [email]);
        // منطق تجميع المهام حسب المشروع (Map) كما في كودك الأصلي
        res.status(200).json(rows); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getArchivedTasksByEmail = async (req, res) => {

    const { email } = req.params;

    try {

        const query = `

            SELECT

                p.name AS project_name,

                t.title AS task_title,

                t.status AS task_status,

                t.startDate, t.endDate

            FROM tasks t

            JOIN task_assignments ta ON t.id = ta.task_id

            JOIN \`user\` u ON ta.employee_id = u.id

            JOIN project p ON t.project_id = p.id

            WHERE u.email = ? AND t.is_archived = 1

            ORDER BY t.endDate DESC

        `;

        const [rows] = await db.query(query, [email]);

        res.status(200).json(rows);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};

exports.updateTaskStatus = async (req, res) => {
    const { task_id, status } = req.body; 
    try {
        await db.query("UPDATE tasks SET status = ? WHERE id = ?", [status, task_id]);
        const [task] = await db.query("SELECT project_id FROM tasks WHERE id = ?", [task_id]);
        if (task.length > 0) {
            const projectId = task[0].project_id;
            // استدعاء دالة تحديث شريط التقدم من ملف المدير
            await managerProject.updateProjectStatus(projectId);
        }
        res.status(200).json({ message: "تم تحديث الحالة وتحريك شريط التقدم!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTaskComment = async (req, res) => {
    const { task_id, comment } = req.body; 
    try {
        await db.query("UPDATE tasks SET comment = ? WHERE id = ?", [comment, task_id]);
        res.status(200).json({ message: "تم حفظ التعليق!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};