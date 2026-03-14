const db = require("../config/db");

/**
 * قسم إدارة المشاريع
 */

exports.createProject = async (req, res) => {
    const { name, description, manager_id } = req.body;
    try {
        const query = "INSERT INTO project (name, description, manager_id) VALUES (?, ?, ?)";
        const [result] = await db.query(query, [name, description, manager_id]);
        res.status(201).json({ message: "تم إنشاء المشروع بنجاح!", projectId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "فشل في إنشاء المشروع: " + error.message });
    }
};

exports.updateProject = async (req, res) => {
    const { id } = req.params; 
    const { name, description } = req.body;
    try {
        const query = "UPDATE project SET name = ?, description = ? WHERE id = ?";
        const [result] = await db.query(query, [name, description, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "المشروع غير موجود!" });
        res.status(200).json({ message: "تم تحديث بيانات المشروع بنجاح!" });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء التعديل: " + error.message });
    }
};

exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        const query = "DELETE FROM project WHERE id = ?";
        const [result] = await db.query(query, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "المشروع غير موجود!" });
        res.status(200).json({ message: "تم حذف المشروع بنجاح!" });
    } catch (error) {
        res.status(500).json({ error: "حدث خطأ أثناء الحذف: " + error.message });
    }
};

/**
 * قسم إدارة المهام
 */

exports.createTask = async (req, res) => {
    // نكتفي بطلب البيانات الأساسية للمهمة فقط
    const { title, startDate, endDate, status, project_id } = req.body;
    try {
        const query = "INSERT INTO tasks (title, startDate, endDate, status, project_id) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db.query(query, [title, startDate, endDate, status || 'To Do', project_id]);
        res.status(201).json({ message: "تم إنشاء المهمة بنجاح!", taskId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "فشل إنشاء المهمة: " + error.message });
    }
};

exports.updateTask = async (req, res) => {
    const { id } = req.params;
    // استلام التفاصيل فقط: العنوان، تاريخ البدء، وتاريخ الانتهاء
    const { title, startDate, endDate } = req.body; 

    try {
        // تحديث البيانات الأساسية فقط مع استثناء الـ Status
        const query = "UPDATE tasks SET title = ?, startDate = ?, endDate = ? WHERE id = ?";
        const [result] = await db.query(query, [title, startDate, endDate, id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: "المهمة غير موجودة!" });

        res.status(200).json({ message: "تم تحديث تفاصيل المهمة بنجاح!" });
    } catch (error) {
        res.status(500).json({ error: "فشل في تحديث المهمة: " + error.message });
    }
};

exports.assignTask = async (req, res) => {
    const { task_id, email } = req.body; // استلام إيميل الموظف
    try {
        // 1. البحث عن ID الموظف باستخدام الإيميل
        const [user] = await db.query("SELECT id FROM User WHERE email = ? AND role = 'Employee'", [email]);

        if (user.length === 0) {
            return res.status(404).json({ error: "الموظف غير موجود بهذا البريد الإلكتروني!" });
        }

        const employee_id = user[0].id;

        // 2. تحديث المهمة برقم الموظف الذي وجدناه
        const query = "UPDATE tasks SET employee_id = ? WHERE id = ?";
        const [result] = await db.query(query, [employee_id, task_id]);

        if (result.affectedRows === 0) return res.status(404).json({ error: "المهمة غير موجودة!" });

        res.status(200).json({ message: "تم تعيين المهمة بنجاح!" });
    } catch (error) {
        res.status(500).json({ error: "فشل في التعيين: " + error.message });
    }
};


exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const [task] = await db.query("SELECT employee_id FROM tasks WHERE id = ?", [id]);
        if (task.length === 0) return res.status(404).json({ error: "المهمة غير موجودة" });

        if (task[0].employee_id !== null) {
            // تحويل الحالة إلى إلغاء
            await db.query("UPDATE tasks SET status = 'Canceled' WHERE id = ?", [id]);
            return res.status(200).json({ message: "تم إلغاء المهمة بنجاح" });
        }
        // حذف نهائي إذا لم تكن معينة
        await db.query("DELETE FROM tasks WHERE id = ?", [id]);
        res.status(200).json({ message: "تم حذف المهمة نهائياً" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.reactivateTask = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE tasks SET status = 'To Do' WHERE id = ?", [id]); //
        res.status(200).json({ message: "تم إعادة تفعيل المهمة" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getManagerProjects = async (req, res) => {
    const { manager_id } = req.params;
    try {
        const [projects] = await db.query("SELECT * FROM project WHERE manager_id = ?", [manager_id]);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};