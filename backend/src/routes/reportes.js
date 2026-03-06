const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/reportes.controller');

router.get('/platillo-mas-vendido', ctrl.platilloMasVendido);
router.get('/restaurante-mejor-calificado', ctrl.restauranteMejorCalificado);
router.get('/margen-por-sede', ctrl.margenPorSede);
router.get('/cliente-mas-frecuente', ctrl.clienteMasFrecuente);
router.get('/ventas-por-mes', ctrl.ventasPorMes);
router.get('/ordenes-por-restaurante', ctrl.ordenesPorRestaurante);
router.get('/conteo/:coleccion', ctrl.conteo);
router.get('/distinct/:coleccion/:campo', ctrl.distinct);

module.exports = router;
