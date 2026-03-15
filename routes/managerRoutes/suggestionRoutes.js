const express = require('express');
const router = express.Router();

// السطر الناقص الذي يسبب المشكلة:
const suggestionController = require('../../controllers/managerController/suggestionController');

router.get('/all', suggestionController.getAllSuggestions);
router.put('/validate/:id', suggestionController.valideSuggestion);
router.get('/archived-suggestions', suggestionController.getArchivedSuggestions);
router.get('/search/normal', suggestionController.searchNormalSuggestions);
router.get('/search/archived', suggestionController.searchArchivedSuggestions);

module.exports = router;