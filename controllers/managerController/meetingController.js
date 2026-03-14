const db = require("../../config/db");
const Mailer = require("../../mailer");

exports.createMeeting = async (req, res) => {
  const {
    date,
    time,
    title,
    room,
    virtual_link,
    resume,
    manager_id,
    attendees,
  } = req.body;

  try {
    // 1. التحقق من وجود مكان
    if (!room && !virtual_link) {
      return res
        .status(400)
        .json({ success: false, message: "Provide a room or virtual link" });
    }
    console.log("--- فحص البيانات القادمة من الطلب ---");
    console.log("العنوان:", title);
    console.log("نوع attendees:", typeof attendees);
    console.log("قيمة attendees:", attendees);

    // 2. إدخال الاجتماع (تأكدي من استخدام manager_id موجود فعلياً في جدول manager)
    const [result] = await db.query(
      `INSERT INTO Meeting (date, time, title, room, virtual_link, resume, manager_id, status, isArchived, isNotified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        time,
        title,
        room || null,
        virtual_link || null,
        resume,
        manager_id,
        "Scheduled",
        false,
        true,
      ],
    );

    const meetingId = result.insertId;

    // 3. معالجة المشاركين
    let users = [];
    let managerName = "Manager";

    if (attendees && Array.isArray(attendees) && attendees.length > 0) {
      const [fetchedUsers] = await db.query(
        "SELECT id, email, name FROM User WHERE email IN (?)",
        [attendees],
      );
      users = fetchedUsers;

      if (users.length > 0) {
        const membersData = users.map((u) => [meetingId, u.id]);
        await db.query(
          "INSERT INTO MeetingMembers (meeting_id, userId) VALUES ?",
          [membersData],
        );

        const [manager] = await db.query("SELECT name FROM User WHERE id=?", [
          manager_id,
        ]);
        if (manager.length > 0) managerName = manager[0].name;
      }
    }

    // 4. إرسال الرد فوراً (كما في الـ Register)
    res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      meetingId,
    });
    // 5. إرسال الإيميلات في الخلفية
    if (users.length > 0) {
      const location = room || virtual_link;
      users.forEach((user) => {
        Mailer.sendMeetingInvitation(
          user.email,
          title,
          date,
          time,
          location,
          resume,
          managerName,
        )
          .then(() => console.log(`✅ Meeting email sent to ${user.email}`))
          .catch((err) =>
            console.error(`❌ Mail failed for ${user.email}:`, err.message),
          );
      });
    }
  } catch (error) {
    console.error("❌ Database Error:", error.message);
    if (!res.headersSent) {
      // تنبيه إذا كان السبب هو رقم المدير غير الموجود
      if (error.errno === 1452) {
        return res.status(400).json({
          success: false,
          message: `Manager ID ${manager_id} does not exist.`,
        });
      }
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
};
exports.updateMeeting = async (req, res) => {
  const { id } = req.params;
  const { date, time, title, room, virtual_link, resume, attendees } = req.body;

  try {
    // 1️⃣ جلب الاجتماع الحالي
    const [meetingRows] = await db.query(
      "SELECT * FROM Meeting WHERE meetingId = ?",
      [id],
    );

    if (meetingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    const meeting = meetingRows[0];

    // 2️⃣ جلب المشاركين الحاليين
    const [members] = await db.query(
      `SELECT u.id, u.email
       FROM User u
       JOIN MeetingMembers mm ON u.id = mm.userId
       WHERE mm.meeting_id = ?`,
      [id],
    );

    const currentEmails = members.map((m) => m.email.toLowerCase().trim());

    const safeAttendees = Array.isArray(attendees) ? attendees : [];
    const incomingEmails = safeAttendees.map((e) => e.toLowerCase().trim());

    // 3️⃣ مقارنة معلومات الاجتماع
    const dbDate = new Date(meeting.date).toISOString().split("T")[0];
    const dbTime = meeting.time.toString().slice(0, 5);
    const reqTime = time ? time.slice(0, 5) : dbTime;

    const hasInfoChanged =
      date !== dbDate ||
      reqTime !== dbTime ||
      title !== meeting.title ||
      (room || null) !== meeting.room ||
      (virtual_link || null) !== meeting.virtual_link ||
      resume !== meeting.resume;

    // 4️⃣ تحديد التغييرات في المشاركين
    const addedEmails = incomingEmails.filter(
      (email) => !currentEmails.includes(email),
    );

    const removedMembers = members.filter(
      (m) => !incomingEmails.includes(m.email.toLowerCase().trim()),
    );

    const stayedEmails = incomingEmails.filter((email) =>
      currentEmails.includes(email),
    );

    // 5️⃣ إذا لا يوجد أي تغيير
    if (
      !hasInfoChanged &&
      addedEmails.length === 0 &&
      removedMembers.length === 0
    ) {
      return res.status(200).json({
        success: true,
        message: "No changes detected",
      });
    }

    // 6️⃣ تحديث بيانات الاجتماع
    if (hasInfoChanged) {
      await db.query(
        `UPDATE Meeting 
         SET date=?, time=?, title=?, room=?, virtual_link=?, resume=? 
         WHERE meetingId=?`,
        [date, time, title, room || null, virtual_link || null, resume, id],
      );
    }

    // 7️⃣ حذف المشاركين
    if (removedMembers.length > 0) {
      await db.query(
        "DELETE FROM MeetingMembers WHERE meeting_id=? AND userId IN (?)",
        [id, removedMembers.map((m) => m.id)],
      );
    }

    // 8️⃣ إضافة المشاركين الجدد
    if (addedEmails.length > 0) {
      const [users] = await db.query(
        "SELECT id,email FROM User WHERE email IN (?)",
        [addedEmails],
      );

      if (users.length > 0) {
        const insertData = users.map((u) => [id, u.id]);

        await db.query(
          "INSERT INTO MeetingMembers (meeting_id,userId) VALUES ?",
          [insertData],
        );
      }
    }

    // 9️⃣ الرد للـ frontend
    res.status(200).json({
      success: true,
      message: "Meeting updated successfully",
    });

    // 🔟 إرسال الإيميلات في الخلفية
    const location = room || virtual_link;

    // removed participants
    removedMembers.forEach((m) => {
      Mailer.sendMeetingCancel(m.email, title, date, time)
        .then(() => console.log(`❌ Cancel email sent to ${m.email}`))
        .catch((err) => console.error(err.message));
    });

    // added participants
    addedEmails.forEach((email) => {
      Mailer.sendMeetingInvitation(
        email,
        title,
        date,
        time,
        location,
        resume,
        "Manager",
      )
        .then(() => console.log(`✅ Invitation email sent to ${email}`))
        .catch((err) => console.error(err.message));
    });

    // participants that stayed (only if meeting info changed)
    if (hasInfoChanged) {
      stayedEmails.forEach((email) => {
        Mailer.sendMeetingUpdate(email, title, date, time, location, resume)
          .then(() => console.log(`🔄 Update email sent to ${email}`))
          .catch((err) => console.error(err.message));
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
};
exports.assignParticipants = async (req, res) => {
  const { meetingId } = req.params;
  const { attendees } = req.body; // مصفوفة الإيميلات الجديدة

  try {
    // 1. جلب بيانات الاجتماع الحالية (لإدراجها في الإيميلات)
    const [meeting] = await db.query(
      "SELECT * FROM Meeting WHERE meetingId = ?",
      [meetingId],
    );
    if (meeting.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });

    const { title, date, time, room, virtual_link, resume } = meeting[0];
    const location = room || virtual_link;

    // 2. جلب المشاركين الحاليين من قاعدة البيانات
    const [currentMembers] = await db.query(
      "SELECT u.email, u.id FROM User u JOIN MeetingMembers mm ON u.id = mm.userId WHERE mm.meeting_id = ?",
      [meetingId],
    );

    const currentEmails = currentMembers.map((m) =>
      m.email.toLowerCase().trim(),
    );

    // معالجة حالة null لتجنب خطأ الـ map
    const safeAttendees = attendees || [];
    const incomingEmails = safeAttendees.map((email) =>
      email.toLowerCase().trim(),
    );

    // 3. تحديد من تم حذفهم ومن تم إضافتهم
    const addedEmails = incomingEmails.filter(
      (email) => !currentEmails.includes(email),
    );
    const removedMembers = currentMembers.filter(
      (m) => !incomingEmails.includes(m.email.toLowerCase().trim()),
    );

    // إذا لم يتغير شيء في القائمة، نخرج فوراً
    if (addedEmails.length === 0 && removedMembers.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No changes in participants list." });
    }

    // 4. تحديث قاعدة البيانات

    // حذف من تمت إزالتهم من القائمة
    if (removedMembers.length > 0) {
      await db.query(
        "DELETE FROM MeetingMembers WHERE meeting_id = ? AND userId IN (?)",
        [meetingId, removedMembers.map((m) => m.id)],
      );
    }

    // إضافة المشاركين الجدد
    if (addedEmails.length > 0) {
      const [newUsers] = await db.query(
        "SELECT id FROM User WHERE email IN (?)",
        [addedEmails],
      );
      if (newUsers.length > 0) {
        const values = newUsers.map((u) => [meetingId, u.id]);
        await db.query(
          "INSERT INTO MeetingMembers (meeting_id, userId) VALUES ?",
          [values],
        );
      }
    }

    // إرسال الرد للواجهة الأمامية
    res
      .status(200)
      .json({ success: true, message: "Participants updated successfully." });

    // 5. إرسال الإشعارات البريدية (Notifications)

    // إرسال إيميل إلغاء للمحذوفين فقط
    removedMembers.forEach((m) => {
      Mailer.sendMeetingCancel(m.email, title, date, time)
        .then(() => console.log(`✉️ Cancellation sent to: ${m.email}`))
        .catch((err) => console.error(err));
    });

    // إرسال دعوة للمضافين الجدد فقط
    addedEmails.forEach((email) => {
      Mailer.sendMeetingInvitation(
        email,
        title,
        date,
        time,
        location,
        resume,
        "Manager",
      )
        .then(() =>
          console.log(`✉️ Invitation sent to new participant: ${email}`),
        )
        .catch((err) => console.error(err));
    });
  } catch (error) {
    console.error("❌ Assign Participants Error:", error.message);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.deleteOrCancelMeeting = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. جلب بيانات الاجتماع والمشاركين أولاً للتحقق
    const [meeting] = await db.query(
      "SELECT * FROM Meeting WHERE meetingId = ?",
      [id],
    );
    if (meeting.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    const [participants] = await db.query(
      "SELECT u.email FROM User u JOIN MeetingMembers mm ON u.id = mm.userId WHERE mm.meeting_id = ?",
      [id],
    );

    const meetingData = meeting[0];

    // 2. تطبيق المنطق الذكي
    if (participants.length === 0) {
      // الحالة أ: لا يوجد مشاركون -> حذف نهائي من قاعدة البيانات
      await db.query("DELETE FROM Meeting WHERE meetingId = ?", [id]);

      return res.status(200).json({
        success: true,
        message:
          "Meeting had no participants and was deleted from the database.",
      });
    } else {
      // الحالة ب: يوجد مشاركون -> تغيير الحالة للأرشفة وإرسال إيميلات
      await db.query(
        "UPDATE Meeting SET status = 'Cancelled', isArchived = TRUE WHERE meetingId = ?",
        [id],
      );

      // إرسال الرد فوراً
      res.status(200).json({
        success: true,
        message: "Meeting cancelled, archived, and participants notified.",
      });

      // 3. إرسال إيميل إلغاء لجميع المشاركين في الخلفية
      participants.forEach((p) => {
        Mailer.sendMeetingCancel(
          p.email,
          meetingData.title,
          meetingData.date,
          meetingData.time,
        )
          .then(() => console.log(`✅ Cancellation email sent to ${p.email}`))
          .catch((err) =>
            console.error(`❌ Mail failed for ${p.email}:`, err.message),
          );
      });
    }
  } catch (error) {
    console.error("❌ Delete/Cancel Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};
exports.updateMeetingStatus = async (req, res) => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0];

    const [meetingsToComplete] = await db.query(
      `SELECT meetingId FROM Meeting 
       WHERE status = 'Scheduled' 
       AND (date < ? OR (date = ? AND time < ?))`,
      [currentDate, currentDate, currentTime],
    );

    if (meetingsToComplete.length > 0) {
      const ids = meetingsToComplete.map((m) => m.meetingId);
      await db.query(
        `UPDATE Meeting SET status = 'Completed', isArchived = TRUE WHERE meetingId IN (?)`,
        [ids],
      );
      console.log(`✅ ${ids.length} meetings moved to archive.`);
    }

    // 💡 التحقق: إذا كان الاستدعاء من مسار (Route) نرسل رد، وإذا كان من الكرون نكتفي بالـ console
    if (res) return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Status Update Error:", error.message);
    if (res) res.status(500).json({ success: false });
  }
};
exports.getUpcomingMeetings = async (req, res) => {
  const { managerId } = req.params;
  try {
    // نختار الاجتماعات التي لم تؤرشف بعد وحالتها 'Scheduled'
    const [meetings] = await db.query(
      `SELECT * FROM Meeting 
             WHERE manager_id = ? AND isArchived = FALSE AND status = 'Scheduled'
             ORDER BY date ASC, time ASC`,
      [managerId],
    );

    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    console.error("Error fetching upcoming meetings:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getArchivedMeetings = async (req, res) => {
  const { managerId } = req.params;
  try {
    // نختار الاجتماعات المؤرشفة (سواء كانت Completed أو Cancelled)
    const [meetings] = await db.query(
      `SELECT * FROM Meeting 
             WHERE manager_id = ? AND isArchived = TRUE
             ORDER BY date DESC, time DESC`,
      [managerId],
    );

    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    console.error("Error fetching archived meetings:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.searchUpcoming = async (req, res) => {
  const { managerId } = req.params;
  const { query } = req.query;

  try {
    const [results] = await db.query(
      `SELECT * FROM Meeting 
             WHERE manager_id = ? AND isArchived = FALSE AND status = 'Scheduled'
             AND (title LIKE ? OR CAST(date AS CHAR) LIKE ?)
             ORDER BY date ASC`,
      [managerId, `%${query}%`, `%${query}%`],
    );
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.searchArchived = async (req, res) => {
  const { managerId } = req.params;
  const { query } = req.query;

  try {
    const [results] = await db.query(
      `SELECT * FROM Meeting 
             WHERE manager_id = ? AND isArchived = TRUE
             AND (title LIKE ? OR CAST(date AS CHAR) LIKE ?)
             ORDER BY date DESC`,
      [managerId, `%${query}%`, `%${query}%`],
    );
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
