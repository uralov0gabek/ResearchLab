const express = require('express');
const { verifyAdmin } = require('../middlewares/authMiddleware');
const questionController = require('../controllers/questionController');
const responseController = require('../controllers/responseController');
const statsController = require('../controllers/statsController');
const cptTasksRouter = require('./cptTasks');

const router = express.Router();

// Questions
router.get('/questions', questionController.getQuestions);
router.post('/questions', verifyAdmin, questionController.upsertQuestions);

// Responses
router.post('/responses', responseController.submitResponse);
router.get('/responses', verifyAdmin, responseController.getResponses);

// Stats
router.get('/stats', verifyAdmin, statsController.getDashboardStats);

// CPT Tasks
router.use('/cpt-tasks', cptTasksRouter);

module.exports = router;
