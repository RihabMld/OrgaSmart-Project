const express = require('express');
const router = express.Router();
const projectController = require('../../controllers/employeeController/projectController');

router.get('/search/projects', projectController.searchEmployeeProjects);
router.get('/archive/search/projects', projectController.searchEmployeeArchivedProjects);

module.exports = router;