const questionService = require('../services/questionService');

let questionsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

const getQuestions = async (req, res, next) => {
  try {
    if (questionsCache && (Date.now() - cacheTimestamp < CACHE_TTL)) {
      return res.json(questionsCache);
    }
    
    const data = await questionService.fetchQuestions();
    questionsCache = data;
    cacheTimestamp = Date.now();
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const upsertQuestions = async (req, res, next) => {
  try {
    const { questionsToUpsert, idsToDelete } = req.body;
    await questionService.saveQuestions(questionsToUpsert, idsToDelete);
    
    // Invalidate cache
    questionsCache = null;
    cacheTimestamp = 0;
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  upsertQuestions
};
