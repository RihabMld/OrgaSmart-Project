const express = require("express");
const router = express.Router();
// تأكدي من استيراد المتحكم الخاص باجتماعات الموظف
const meetingController = require("../../controllers/employeeController/meetingController");

// 1. جلب الاجتماعات (القادمة والمؤرشفة)
router.get("/upcoming/:userId", meetingController.getUpcomingMeetings);
router.get("/archived/:userId", meetingController.getArchivedMeetings);

// 2. البحث (في القادم وفي الأرشيف)
// نستخدم :userId لأن الموظف يبحث فقط في اجتماعاته الخاصة
router.get("/search-upcoming/:userId", meetingController.searchUpcoming);
router.get("/search-archived/:userId", meetingController.searchArchived);

module.exports = router;
