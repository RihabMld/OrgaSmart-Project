const express = require('express');
const router = express.Router();
// التعديل: التأكد من المسار واسم الملف projectController
const projectController = require('../../controllers/managerController/projectController');

router.post('/create-project', projectController.createProject);
router.put('/update-project/:id', projectController.updateProject);
router.delete('/delete-project/:id', projectController.deleteProject);
router.get('/projects/:manager_id', projectController.getManagerProjects);
router.get('/projects-history/:manager_id', projectController.getProjectHistory);
router.get('/search/projects', projectController.searchProjects);
router.get('/archived/search', projectController.searchProjectsArchived);
module.exports = router;