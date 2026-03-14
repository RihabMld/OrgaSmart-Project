const express = require('express');
const router = express.Router();
const projectController = require('../../controllers/employeeController/projectController');

router.get('/search', projectController.searchEmployeeTasksAndProjects);
router.get('/archive/search', projectController.searchEmployeeArchived);

module.exports = router;