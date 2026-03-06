function pagination(req, res, next) {
  const skip = Math.max(0, parseInt(req.query.skip) || 0);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  const sort = {};
  if (req.query.sort) {
    const parts = req.query.sort.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith('-')) {
        sort[trimmed.slice(1)] = -1;
      } else {
        sort[trimmed] = 1;
      }
    }
  }

  req.pagination = { skip, limit, sort };
  next();
}

module.exports = pagination;
