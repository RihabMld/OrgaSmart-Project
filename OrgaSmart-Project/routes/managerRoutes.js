const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');

// مسارات المشاريع
router.post('/create-project', managerController.createProject);
router.put('/update-project/:id', managerController.updateProject);
router.delete('/delete-project/:id', managerController.deleteProject);
router.get('/projects/:manager_id', managerController.getManagerProjects);

// مسارات المهام
router.post('/create-task', managerController.createTask);
router.put('/update-task/:id', managerController.updateTask);
router.put('/assign-task', managerController.assignTask);
router.delete('/delete-task/:id', managerController.deleteTask);
router.put('/reactivate-task/:id', managerController.reactivateTask); // المسار الجديد
module.exports = router;