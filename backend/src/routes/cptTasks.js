const express = require('express');
const { verifyAdmin } = require('../middlewares/authMiddleware');
const cptTaskController = require('../controllers/cptTaskController');

const router = express.Router();

router.get('/', cptTaskController.getTasks);
router.post('/', verifyAdmin, cptTaskController.createTask);

module.exports = router;
