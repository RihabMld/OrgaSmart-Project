const db = require('../../config/db');

// 1. إضافة اقتراح جديد (Ajouter) - يعتمد على content فقط
exports.createSuggestion = async (req, res) => {
    const { content, employee_id } = req.body;
    try {
        const query = "INSERT INTO suggestions (content, employee_id, status) VALUES (?, ?, 'Pending')";
        const [result] = await db.query(query, [content, employee_id]);
        res.status(201).json({ message: "تمت إضافة الاقتراح بنجاح!", id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. عرض الاقتراحات (Afficher)
exports.getMySuggestions = async (req, res) => {
    const { employee_id } = req.params;
    try {
        const query = "SELECT id, content, status FROM suggestions WHERE employee_id = ? ORDER BY id DESC";
        const [rows] = await db.query(query, [employee_id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. تعديل الاقتراح (Modifier) - مسموح فقط إذا كان Pending
exports.updateMySuggestion = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    try {
        const [suggestion] = await db.query("SELECT status FROM suggestions WHERE id = ?", [id]);
        
        if (suggestion.length > 0 && suggestion[0].status === 'Pending') {
            const updateQuery = "UPDATE suggestions SET content = ? WHERE id = ?";
            await db.query(updateQuery, [content, id]);
            res.status(200).json({ message: "تم تحديث نص الاقتراح بنجاح" });
        } else {
            res.status(403).json({ error: "لا يمكن التعديل لأن الاقتراح لم يعد في حالة الانتظار" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. حذف الاقتراح (Supprimer) - مسموح فقط إذا كان Pending
exports.deleteMySuggestion = async (req, res) => {
    const { id } = req.params;
    try {
        const [suggestion] = await db.query("SELECT status FROM suggestions WHERE id = ?", [id]);
        
        if (suggestion.length > 0 && suggestion[0].status === 'Pending') {
            await db.query("DELETE FROM suggestions WHERE id = ?", [id]);
            res.status(200).json({ message: "تم حذف الاقتراح" });
        } else {
            res.status(403).json({ error: "لا يمكن الحذف بعد فوات الأوان" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};