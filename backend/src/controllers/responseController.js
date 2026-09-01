const responseService = require('../services/responseService');

/**
 * Controller to handle response submission
 */
const submitResponse = async (req, res, next) => {
  try {
    const { answers, userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId (session ID)' });
    }
    
    await responseService.saveResponse(userId, answers);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to handle fetching responses for the admin dashboard
 */
const getResponses = async (req, res, next) => {
  try {
    const processedResponses = await responseService.fetchResponses();
    res.json({ responses: processedResponses });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitResponse,
  getResponses
};
