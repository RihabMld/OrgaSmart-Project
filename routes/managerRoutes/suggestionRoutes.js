const express = require('express');
const router = express.Router();
const managerSuggestionController = require('../../controllers/managerController/suggestionController');

// مسار رؤية الكل
router.get('/all', managerSuggestionController.getAllSuggestions);

// مسار التغيير/المصادقة
router.put('/validate/:id', managerSuggestionController.valideSuggestion);

module.exports = router;