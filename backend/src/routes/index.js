const { Router } = require('express');
const router = Router();

// Import route modules here
// const queryRoutes = require('./queries');
// router.use('/queries', queryRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
