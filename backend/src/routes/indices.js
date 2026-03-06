const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/indices.controller');

router.get('/listar/:coleccion', ctrl.listar);
router.post('/crear', ctrl.crear);
router.post('/crear-texto', ctrl.crearTexto);
router.post('/crear-simple', ctrl.crearSimple);
router.delete('/eliminar', ctrl.eliminar);
router.post('/explain', ctrl.explain);

module.exports = router;
