const db = require("../../config/db");
// 1. جلب الاجتماعات القادمة للموظف
exports.getUpcomingMeetings = async (req, res) => {
  const { userId } = req.params;
  try {
    const [meetings] = await db.query(
      `SELECT m.* FROM Meeting m
             JOIN MeetingMembers mm ON m.meetingId = mm.meeting_id
             WHERE mm.userId = ? AND m.isArchived = FALSE AND m.status = 'Scheduled'
             ORDER BY m.date ASC, m.time ASC`,
      [userId],
    );
    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 2. جلب الاجتماعات المؤرشفة للموظف
exports.getArchivedMeetings = async (req, res) => {
  const { userId } = req.params;
  try {
    const [meetings] = await db.query(
      `SELECT m.* FROM Meeting m
             JOIN MeetingMembers mm ON m.meetingId = mm.meeting_id
             WHERE mm.userId = ? AND m.isArchived = TRUE
             ORDER BY m.date DESC, m.time DESC`,
      [userId],
    );
    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// 3. البحث في الاجتماعات القادمة (بالعنوان أو التاريخ)
exports.searchUpcoming = async (req, res) => {
  const { userId } = req.params;
  const { query } = req.query;
  try {
    const [results] = await db.query(
      `SELECT m.* FROM Meeting m
             JOIN MeetingMembers mm ON m.meetingId = mm.meeting_id
             WHERE mm.userId = ? AND m.isArchived = FALSE AND m.status = 'Scheduled'
             AND (m.title LIKE ? OR CAST(m.date AS CHAR) LIKE ?)
             ORDER BY m.date ASC`,
      [userId, `%${query}%`, `%${query}%`],
    );
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. البحث في الاجتماعات المؤرشفة (بالعنوان أو التاريخ)
exports.searchArchived = async (req, res) => {
  const { userId } = req.params;
  const { query } = req.query;
  try {
    const [results] = await db.query(
      `SELECT m.* FROM Meeting m
             JOIN MeetingMembers mm ON m.meetingId = mm.meeting_id
             WHERE mm.userId = ? AND m.isArchived = TRUE
             AND (m.title LIKE ? OR CAST(m.date AS CHAR) LIKE ?)
             ORDER BY m.date DESC`,
      [userId, `%${query}%`, `%${query}%`],
    );
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
