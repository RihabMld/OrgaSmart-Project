const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/employeeController/taskController');

router.get('/tasks/:email', taskController.getTasksByEmail);
router.get('/archived-tasks/:email', taskController.getArchivedTasksByEmail);
router.put('/update-status', taskController.updateTaskStatus);
router.put('/update-comment', taskController.updateTaskComment);

module.exports = router;