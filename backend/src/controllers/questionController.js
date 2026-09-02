const questionService = require('../services/questionService');

const getQuestions = async (req, res, next) => {
  try {
    const data = await questionService.fetchQuestions();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const upsertQuestions = async (req, res, next) => {
  try {
    const { questionsToUpsert, idsToDelete } = req.body;
    await questionService.saveQuestions(questionsToUpsert, idsToDelete);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  upsertQuestions
};
