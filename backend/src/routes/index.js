const express = require('express');
const { verifyAdmin } = require('../middlewares/authMiddleware');
const questionController = require('../controllers/questionController');
const moduleController = require('../controllers/moduleController');
const cptController = require('../controllers/cptController');
const responseController = require('../controllers/responseController');
const statsController = require('../controllers/statsController');

const router = express.Router();

// Questions
router.get('/questions', questionController.getQuestions);
router.post('/questions', verifyAdmin, questionController.upsertQuestions);

// Modules
router.get('/modules', moduleController.getModules);
router.post('/modules', verifyAdmin, moduleController.createModule);
router.delete('/modules/:id', verifyAdmin, moduleController.deleteModule);

// CPT Tasks
router.get('/cpt-tasks', cptController.getCptTasks);
router.post('/cpt-tasks', verifyAdmin, cptController.createCptTask);

// Responses
router.post('/responses', responseController.submitResponse);
router.get('/responses', verifyAdmin, responseController.getResponses);

// Stats
router.get('/stats', verifyAdmin, statsController.getDashboardStats);

module.exports = router;
