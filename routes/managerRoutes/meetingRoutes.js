const express = require("express");
const router = express.Router();
const meetingController = require("../../controllers/managerController/meetingController");

router.post("/create", meetingController.createMeeting);
router.put("/update/:id", meetingController.updateMeeting);
router.put(
  "/assign-participants/:meetingId",
  meetingController.assignParticipants,
);
router.delete("/delete/:id", meetingController.deleteOrCancelMeeting);
router.put("/update-status", meetingController.updateMeetingStatus);
router.get("/upcoming/:managerId", meetingController.getUpcomingMeetings);
router.get("/archived/:managerId", meetingController.getArchivedMeetings);
router.get("/search-upcoming/:managerId", meetingController.searchUpcoming);
router.get("/search-archived/:managerId", meetingController.searchArchived);
module.exports = router;
