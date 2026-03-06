const { Router } = require('express');
const router = Router();
const pagination = require('../middleware/pagination');
const ctrl = require('../controllers/ordenes.controller');

router.get('/', pagination, ctrl.listar);
router.get('/:id', ctrl.obtenerUno);
router.get('/:id/detalle', ctrl.detalle);
router.post('/', ctrl.crear);
router.post('/pagar-con-puntos', ctrl.pagarConPuntos);
router.put('/actualizar-estado-muchos', ctrl.actualizarEstadoMuchos);
router.put('/:id/estado', ctrl.actualizarEstado);
router.delete('/eliminar-muchos', ctrl.eliminarMuchos);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
