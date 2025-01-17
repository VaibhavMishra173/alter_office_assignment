import { trackVisit as _trackVisit } from '../services/analytics.service';
import { error as _error } from '../utils/logger.js';

const trackVisit = async (req, res, next) => {
  try {
    const { urlId } = req;
    await _trackVisit(urlId, req);
    next();
  } catch (error) {
    _error('Error tracking visit:', error);
    next(error);
  }
};

export default { trackVisit };