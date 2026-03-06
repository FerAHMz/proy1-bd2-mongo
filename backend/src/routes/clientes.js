const { Router } = require('express');
const router = Router();
const pagination = require('../middleware/pagination');
const ctrl = require('../controllers/clientes.controller');

router.get('/', pagination, ctrl.listar);
router.get('/:id', ctrl.obtenerUno);
router.get('/:id/ordenes', pagination, ctrl.historialOrdenes);
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.put('/:id/direccion', ctrl.actualizarDireccion);
router.put('/:id/tags', ctrl.actualizarTags);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
