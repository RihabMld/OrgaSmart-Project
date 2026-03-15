const db = require('../../config/db');

// 1. عرض كل الاقتراحات للمدير (Inbox) - أضفنا s.date
exports.getAllSuggestions = async (req, res) => {
    try {
        const query = `
            SELECT s.id, s.content, s.status, s.employee_id, s.date, u.name as employee_name 
            FROM suggestions s
            JOIN user u ON s.employee_id = u.id  
            WHERE s.status = 'Pending' 
            AND s.date >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
            ORDER BY s.date DESC`;
        
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. المصادقة على الاقتراح (لا يتغير لأنه يعتمد على ID والحالة فقط)
exports.valideSuggestion = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'Validated' && status !== 'Rejected') {
        return res.status(400).json({ 
            message: "خطأ: الحالة يجب أن تكون 'Validated' أو 'Rejected' فقط." 
        });
    }

    try {
        const query = "UPDATE suggestions SET status = ? WHERE id = ?";
        await db.query(query, [status, id]);
        res.status(200).json({ message: `تم تحديث حالة الاقتراح إلى ${status} بنجاح` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. جلب الأرشيف - أضفنا s.date
exports.getArchivedSuggestions = async (req, res) => {
    try {
        const query = `
            SELECT s.id, s.content, s.status, s.employee_id, s.date, u.name as employee_name
            FROM suggestions s
            JOIN user u ON s.employee_id = u.id
            WHERE s.status IN ('Validated', 'Rejected') 
            OR (s.status = 'Pending' AND s.date < DATE_SUB(NOW(), INTERVAL 2 MONTH))
            ORDER BY s.date DESC`;

        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: "خطأ في جلب الأرشيف: " + error.message });
    }
};

// 4. البحث في المقترحات الحالية (يدعم الكلمة والتاريخ)
exports.searchNormalSuggestions = async (req, res) => {
    let { word, date } = req.query; // استلام التاريخ من الرابط
    
    let query = `
        SELECT s.id, s.content, s.status, s.date, u.name as employee_name
        FROM suggestions s
        JOIN user u ON s.employee_id = u.id
        WHERE s.status = 'Pending'`;
    
    let params = [];

    // فلترة بالكلمة
    if (word && word.trim() !== "") {
        query += ` AND s.content LIKE ?`;
        params.push(`%${word.trim()}%`);
    }

    // فلترة بالتاريخ (نقارن فقط الجزء الخاص بالتاريخ YYYY-MM-DD)
    if (date) {
        query += ` AND DATE(s.date) = ?`;
        params.push(date);
    }

    try {
        const [results] = await db.query(query, params);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "خطأ في بحث المقترحات الحالية: " + error.message });
    }
};

// 5. البحث في الأرشيف (يدعم الكلمة والتاريخ)
exports.searchArchivedSuggestions = async (req, res) => {
    let { word, date } = req.query;
    
    let query = `
        SELECT s.id, s.content, s.status, s.date, u.name as employee_name
        FROM suggestions s
        JOIN user u ON s.employee_id = u.id
        WHERE s.status IN ('Validated', 'Rejected')`;

    let params = [];

    if (word && word.trim() !== "") {
        query += ` AND s.content LIKE ?`;
        params.push(`%${word.trim()}%`);
    }

    if (date) {
        query += ` AND DATE(s.date) = ?`;
        params.push(date);
    }

    try {
        const [results] = await db.query(query, params);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "خطأ في بحث الأرشيف: " + error.message });
    }
};