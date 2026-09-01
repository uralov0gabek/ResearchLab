const questionService = require('../services/questionService');

let questionsCache = null;

const getQuestions = async (req, res, next) => {
  try {
    if (questionsCache) {
      return res.json(questionsCache);
    }
    const data = await questionService.fetchQuestions();
    questionsCache = data;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const upsertQuestions = async (req, res, next) => {
  try {
    const { questionsToUpsert, idsToDelete } = req.body;
    await questionService.saveQuestions(questionsToUpsert, idsToDelete);
    questionsCache = null; // Clear cache on update
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  upsertQuestions
};
