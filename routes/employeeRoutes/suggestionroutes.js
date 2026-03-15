const express = require('express');
const router = express.Router();
const suggestionController = require('../../controllers/employeeController/suggestionController');

router.post('/add', suggestionController.createSuggestion); // Ajouter
router.get('/list/:employee_id', suggestionController.getMySuggestions); // See/Afficher
router.get('/archived/:employee_id', suggestionController.getArchivedMySuggestions);
router.put('/edit/:id', suggestionController.updateMySuggestion); // Modifier (Update)
router.delete('/cancel/:id', suggestionController.deleteMySuggestion); // Supprimer (Delete)
router.get('/search/normal/:employee_id', suggestionController.searchNormalMySuggestions);
router.get('/search/archived/:employee_id', suggestionController.searchArchivedMySuggestions);

module.exports = router;