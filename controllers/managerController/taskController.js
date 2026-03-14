const db = require("../../config/db");
// نحتاج استدعاء ملف المشاريع لاستخدام دالة تحديث الشريط
const projectCtrl = require("./projectController");

exports.createTask = async (req, res) => {
    const { title, startDate, endDate, project_id, employeeEmails } = req.body;
    try {
        const [taskResult] = await db.query("INSERT INTO tasks (title, startDate, endDate, status, project_id) VALUES (?, ?, ?, 'To Do', ?)", [title, startDate, endDate, project_id]);
        const taskId = taskResult.insertId;
        if (employeeEmails && employeeEmails.length > 0) {
            const [employees] = await db.query("SELECT id FROM user WHERE email IN (?)", [employeeEmails]);
            if (employees.length > 0) {
                const values = employees.map(emp => [taskId, emp.id]);
                await db.query("INSERT INTO task_assignments (task_id, employee_id) VALUES ?", [values]);
            }
        }
        res.status(201).json({ message: "Task created!", taskId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.assignTaskToEmployees = async (req, res) => {

    const { task_id, emails } = req.body;



    try {

        // 1. تحويل الإيميلات إلى IDs

        const [users] = await db.query("SELECT id FROM User WHERE email IN (?) AND role = 'Employee'", [emails]);



        if (users.length === 0) {

            return res.status(404).json({ error: "لم يتم العثور على موظفين بهذه الإيميلات!" });

        }



        const employeeIds = users.map(u => u.id);



        // 2. إدخال التعيينات في الجدول الوسيط

        const assignmentData = employeeIds.map(empId => [task_id, empId]);

        const assignQuery = "INSERT IGNORE INTO task_assignments (task_id, employee_id) VALUES ?";

        await db.query(assignQuery, [assignmentData]);



        // 3. تحديث حالة المهمة لتصبح To Do

        await db.query("UPDATE tasks SET status = 'To Do' WHERE id = ?", [task_id]);



        // 4. تحديث حالة المشروع تلقائياً (المنطق الجديد)

        const [taskInfo] = await db.query("SELECT project_id FROM tasks WHERE id = ?", [task_id]);

        if (taskInfo.length > 0) {

            const projectId = taskInfo[0].project_id;

           

            // استدعاء دالة التحديث (تأكدي من وجودها في الملف)

            await updateProjectStatus(projectId);

        }



        res.status(200).json({ message: "تم تعيين الموظفين وتحديث حالة المشروع بنجاح!" });

    } catch (error) {

        res.status(500).json({ error: "فشل التعيين: " + error.message });

    }

};

exports.getTaskHistoryByProject = async (req, res) => {

    const { project_id } = req.params; // نأخذ رقم المشروع من الرابط

    try {

        // نجلب المهام المؤرشفة لهذا المشروع المحدد فقط

        const query = "SELECT * FROM tasks WHERE project_id = ? AND is_archived = TRUE";

        const [history] = await db.query(query, [project_id]);

        res.status(200).json(history);

    } catch (error) {

        res.status(500).json({ error: error.message });

    }

};

exports.searchTasks = async (req, res) => {
    const { searchTerm } = req.query;
    const searchPattern = `%${searchTerm}%`;
    try {
        const query = `
            SELECT * FROM tasks
            WHERE (title LIKE ? OR startDate LIKE ?)
            AND is_archived = 0
        `;
        // نرسل الـ searchPattern للعنوان (title) ولتاريخ البدء (startDate)
        const [tasks] = await db.query(query, [searchPattern, searchPattern]);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: "خطأ في بحث المهام: " + error.message });
    }
};

exports.searchTasksArchived = async (req, res) => {
    const { searchTerm } = req.query;
    const searchPattern = `%${searchTerm}%`;
    
    try {
        const query = `
            SELECT * FROM tasks 
            WHERE (title LIKE ? OR startDate LIKE ?) 
            AND is_archived = 1
        `;
        // هنا قمنا بتغيير is_archived إلى 1 لجلب المؤرشفة فقط
        
        const [tasks] = await db.query(query, [searchPattern, searchPattern]);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: "خطأ في بحث المهام المؤرشفة: " + error.message });
    }
};

exports.updateTask = async (req, res) => {

    const { id } = req.params; // معرف المهمة المراد تعديلها

    const { title, startDate, endDate, employeeEmails } = req.body;



    try {

        // 1. تحديث البيانات الأساسية للمهمة (العنوان والمواعيد)

        const updateQuery = "UPDATE tasks SET title = ?, startDate = ?, endDate = ? WHERE id = ?";

        await db.query(updateQuery, [title, startDate, endDate, id]);



        // 2. تحديث الموظفين (اختياري: فقط إذا تم إرسال مصفوفة إيميلات)

        if (employeeEmails && Array.isArray(employeeEmails)) {

           

            // أولاً: حذف التعيينات القديمة لهذه المهمة لتجنب التكرار

            await db.query("DELETE FROM task_assignments WHERE task_id = ?", [id]);



            // ثانياً: إذا كانت المصفوفة ليست فارغة، نبحث عن IDs الموظفين الجدد

            if (employeeEmails.length > 0) {

                const [employees] = await db.query("SELECT id FROM user WHERE email IN (?)", [employeeEmails]);



                if (employees.length > 0) {

                    const values = employees.map(emp => [id, emp.id]);

                    const assignQuery = "INSERT INTO task_assignments (task_id, employee_id) VALUES ?";

                    await db.query(assignQuery, [values]);

                }

            }

        }



        res.status(200).json({ message: "تم تحديث المهمة وقائمة الموظفين بنجاح!" });

    } catch (error) {

        res.status(500).json({ error: "فشل تحديث المهمة: " + error.message });

    }

};

exports.getTasksByProject = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM tasks WHERE project_id = ?", [req.params.project_id]);
        res.status(200).json(rows); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const [task] = await db.query("SELECT project_id FROM tasks WHERE id = ?", [id]);
        if (task.length === 0) return res.status(404).json({ error: "المهمة غير موجودة" });
        const projectId = task[0].project_id;
        await db.query("DELETE FROM tasks WHERE id = ?", [id]);
        await projectCtrl.updateProjectStatus(projectId);
        res.status(200).json({ message: "تم الحذف بنجاح" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// أضيفي بقية دوال المهام (updateTask, searchTasks...) بنفس النمط