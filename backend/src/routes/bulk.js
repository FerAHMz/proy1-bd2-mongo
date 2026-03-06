const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/bulk.controller');

router.post('/:coleccion', ctrl.bulkWrite);

module.exports = router;
