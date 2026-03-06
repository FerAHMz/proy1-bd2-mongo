const { Router } = require('express');
const router = Router();
const pagination = require('../middleware/pagination');
const ctrl = require('../controllers/menu.controller');

router.get('/', pagination, ctrl.listar);
router.get('/buscar', pagination, ctrl.buscar);
router.get('/:id', ctrl.obtenerUno);
router.post('/', ctrl.crear);
router.post('/muchos', ctrl.crearMuchos);
router.put('/:id', ctrl.actualizar);
router.put('/:id/tamanos', ctrl.actualizarTamanos);
router.put('/:id/tags', ctrl.actualizarTags);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
