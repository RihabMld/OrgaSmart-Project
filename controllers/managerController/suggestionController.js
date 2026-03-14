const db = require('../../config/db');

// 1. عرض كل الاقتراحات للمدير (Inbox)
exports.getAllSuggestions = async (req, res) => {
    try {
        // البحث عن السطر رقم 9 تقريباً في الملف المصور
     const query = `
        SELECT s.id, s.content, s.status, s.employee_id, u.name as employee_name 
        FROM suggestions s
        JOIN user u ON s.employee_id = u.id  
        ORDER BY s.id DESC`;
        
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. المصادقة على الاقتراح (Valider and rejected )
exports.valideSuggestion = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // التأكد من أن الحالة المرسلة هي إما Validated أو Rejected فقط
    if (status !== 'Validated' && status !== 'Rejected') {
        return res.status(400).json({ 
            message: "خطأ: الحالة يجب أن تكون 'Validated' أو 'Rejected' فقط." 
        });
    }

    try {
        const query = "UPDATE suggestions SET status = ? WHERE id = ?";
        await db.query(query, [status, id]);
        
        res.status(200).json({ 
            message: `تم تحديث حالة الاقتراح إلى ${status} بنجاح` 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};