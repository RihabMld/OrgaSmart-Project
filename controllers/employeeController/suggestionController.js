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
        const query = `
            SELECT id, content, status, date 
            FROM suggestions 
            WHERE employee_id = ? 
            AND status = 'Pending' 
            AND date >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
            ORDER BY date DESC`;
            
        const [rows] = await db.query(query, [employee_id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// aficher archived suggestion 
exports.getArchivedMySuggestions = async (req, res) => {
    const { employee_id } = req.params;
    try {
        const query = `
            SELECT id, content, status, date 
            FROM suggestions 
            WHERE employee_id = ? 
            AND (status IN ('Validated', 'Rejected') OR (status = 'Pending' AND date < DATE_SUB(NOW(), INTERVAL 2 MONTH)))
            ORDER BY date DESC`;
            
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

exports.searchNormalMySuggestions = async (req, res) => {
    const { employee_id } = req.params;
    let { word, date } = req.query; 
    
    let query = `
        SELECT id, content, status, date 
        FROM suggestions 
        WHERE employee_id = ? AND status = 'Pending'`;
    
    let params = [employee_id];

    // البحث بأي كلمة من الوصف (Content)
    if (word && word.trim() !== "") {
        query += ` AND content LIKE ?`;
        params.push(`%${word.trim()}%`);
    }

    // البحث بواسطة التاريخ (DATE التلقائي)
    if (date) {
        query += ` AND DATE(date) = ?`; // مقارنة اليوم فقط
        params.push(date);
    }

    query += ` ORDER BY date DESC`;

    try {
        const [results] = await db.query(query, params);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "خطأ في بحث المقترحات العادية: " + error.message });
    }
};

exports.searchArchivedMySuggestions = async (req, res) => {
    const { employee_id } = req.params;
    let { word, date, status } = req.query; // أضفنا status هنا
    
    let query = `
        SELECT id, content, status, date 
        FROM suggestions 
        WHERE employee_id = ? AND status IN ('Validated', 'Rejected')`;
    
    let params = [employee_id];

    if (word && word.trim() !== "") {
        query += ` AND content LIKE ?`;
        params.push(`%${word.trim()}%`);
    }

    if (date) {
        query += ` AND DATE(date) = ?`;
        params.push(date);
    }

    // فلترة اختيارية حسب الحالة (Validated أو Rejected)
    if (status) {
        query += ` AND status = ?`;
        params.push(status);
    }

    query += ` ORDER BY date DESC`;

    try {
        const [results] = await db.query(query, params);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "خطأ في بحث الأرشيف: " + error.message });
    }
};