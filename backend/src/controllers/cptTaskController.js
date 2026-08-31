const cptTaskService = require('../services/cptTaskService');

const getTasks = async (req, res, next) => {
  try {
    const data = await cptTaskService.fetchCptTasks();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const data = await cptTaskService.createCptTask(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask
};
