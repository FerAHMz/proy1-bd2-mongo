const { Router } = require('express');
const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/restaurantes', require('./restaurantes'));
router.use('/usuarios', require('./usuarios'));
router.use('/clientes', require('./clientes'));
router.use('/menu', require('./menu'));
router.use('/ordenes', require('./ordenes'));
router.use('/reviews', require('./reviews'));
router.use('/reportes', require('./reportes'));
router.use('/indices', require('./indices'));
router.use('/archivos', require('./archivos'));
router.use('/bulk', require('./bulk'));

module.exports = router;
