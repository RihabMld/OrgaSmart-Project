const express = require('express');
const router = express.Router();
// التعديل: التأكد من المسار
const taskController = require('../../controllers/managerController/taskController');

router.post('/create-task', taskController.createTask); 
router.put('/update-task/:id', taskController.updateTask);
router.delete('/delete-task/:id', taskController.deleteTask);
router.post('/assign-task', taskController.assignTaskToEmployees); 
router.get('/projects/:project_id/tasks', taskController.getTasksByProject); 
router.get('/projects/:project_id/tasks-history', taskController.getTaskHistoryByProject);
router.get('/search/tasks', taskController.searchTasks); 
router.get('/archived/search', taskController.searchTasksArchived);

module.exports = router;